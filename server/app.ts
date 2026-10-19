import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import path from 'path';
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import {
  Building,
  Unit,
  FinancialRecord,
  MaintenanceTicket,
  BulkSmsNotice,
  AgentKYC,
  AuthUser,
  DashboardStats,
  MobileConfig
} from '../src/types.js';
import { listSmsAudiences, resolveSmsAudience } from '../src/utils/smsAudience.js';
import { Repository, KycRecord, KycDocument, createPool } from './db.js';
import { authenticate, requireRole, login, logout, syncAccountsFromEnv, loginLimiter } from './auth.js';
import { buildReceiptPdf } from './pdf.js';
import { fail, msg, langOf } from './http.js';
import {
  UNIT_STATUSES,
  PROPERTY_TYPES,
  PAYMENT_METHODS,
  TX_STATUSES,
  TICKET_STATUSES,
  TICKET_CATEGORIES,
  TICKET_URGENCIES,
  isNonEmptyString,
  isAmount,
  isOneOf,
  isCameroonMobile,
  formatCameroonMobile,
  newId
} from './validation.js';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
// Vercel rejects request bodies over 4.5 MB; a 3 MB file is about 4 MB once base64-encoded.
const MAX_DOCUMENT_BYTES = 3 * 1024 * 1024;

// Allowed identity-document types, checked against the file's leading bytes (not just its declared type).
const DOCUMENT_TYPES: Record<string, { ext: string; magic: number[] }> = {
  'application/pdf': { ext: 'pdf', magic: [0x25, 0x50, 0x44, 0x46] },
  'image/jpeg': { ext: 'jpg', magic: [0xff, 0xd8, 0xff] },
  'image/png': { ext: 'png', magic: [0x89, 0x50, 0x4e, 0x47] }
};

// Hashing both sides first gives equal-length buffers, as timingSafeEqual requires.
function secretsMatch(provided: string, expected: string): boolean {
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

const nowIso = () => new Date().toISOString();
const today = () => nowIso().split('T')[0];

/** Express 4 does not catch rejected promises; forward them to the error handler. */
const ah =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

let repoPromise: Promise<Repository> | null = null;

/**
 * Connects to Postgres once per process (or serverless instance), then creates the schema,
 * seeds the demo data into an empty database and syncs accounts from the environment.
 * The work runs under an advisory lock, so concurrent instances never race each other.
 */
export function getRepository(): Promise<Repository> {
  repoPromise ??= (async () => {
    const pool = createPool();
    if (process.env.VERCEL) {
      // Lets Vercel Fluid compute close idle connections before suspending the function.
      const { attachDatabasePool } = await import('@vercel/functions');
      attachDatabasePool(pool);
    }
    const repo = new Repository(pool, pool);
    const warnings = await repo.transaction(async (tx) => {
      await tx.lockForInit();
      await tx.createSchema();
      if (!(await tx.isSeeded())) {
        if (process.env.SEED_DEMO_DATA !== 'false') await tx.seedDemoData();
        await tx.markSeeded(nowIso());
      }
      return syncAccountsFromEnv(tx);
    });
    for (const warning of warnings) console.warn(`[auth] ${warning}`);
    return repo;
  })().catch((err) => {
    repoPromise = null; // retry on the next request instead of caching the failure
    throw err;
  });
  return repoPromise;
}

/** Builds the API. Static files are served by Vite (dev), express.static (self-hosted) or Vercel's CDN. */
export function createApp(): Express {
  const app = express();

  // Behind Vercel's proxy the client IP is in X-Forwarded-For (used for login rate limiting).
  if (process.env.VERCEL || process.env.TRUST_PROXY === 'true') app.set('trust proxy', true);

  // Identity documents are uploaded as base64 inside JSON.
  app.use(express.json({ limit: '4.5mb' }));

  // CORS Middleware for Mobile App Emulators, Expo, and External Clients
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Accept-Language, Authorization, X-API-Key, X-Webhook-Secret'
    );
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use('/api', authenticate(getRepository));

  // Every handler below gets the repository through this middleware.
  let repo: Repository;
  app.use('/api', ah(async (req, res, next) => {
    repo = await getRepository();
    next();
  }));

  const currentUser = (res: Response) => res.locals.user as AuthUser | undefined;

  const emptyKyc = (user: AuthUser): AgentKYC => ({
    userId: user.id,
    username: user.username,
    fullName: '',
    agencyName: '',
    licenseId: '',
    city: '',
    momoNumber: '',
    isCertified: false,
    status: 'unverified',
    hasDocument: false
  });

  const publicKyc = (k: KycRecord): AgentKYC => {
    const { documentMime, ...rest } = k;
    return rest;
  };

  // Dynamically compute real-time statistics from current portfolio state
  async function computeStats(): Promise<DashboardStats> {
    const [buildings, units, transactions, tickets, certifiedAgentsCount] = await Promise.all([
      repo.listBuildings(),
      repo.listUnits(),
      repo.listTransactions(),
      repo.listTickets(),
      repo.countCertifiedAgents()
    ]);

    const totalUnits = units.length;
    const occupiedUnits = units.filter((u) => u.status === 'Occupied').length;
    const occupancyRate = totalUnits > 0 ? Number(((occupiedUnits / totalUnits) * 100).toFixed(1)) : 0;
    const totalMonthlyRevenueXAF = units.reduce((sum, u) => sum + (u.rentAmountXAF || 0), 0);
    const collectedRevenueXAF = transactions
      .filter((t) => t.status === 'Completed')
      .reduce((sum, t) => sum + (t.amountXAF || 0), 0);
    const pendingArrearsXAF = units.reduce((sum, u) => sum + (u.balanceDueXAF || 0), 0);
    // Overpayments and advance rent can exceed the monthly roll; a collection rate above 100% is meaningless.
    const collectionRatePercent =
      totalMonthlyRevenueXAF > 0
        ? Math.min(100, Number(((collectedRevenueXAF / totalMonthlyRevenueXAF) * 100).toFixed(1)))
        : 0;

    return {
      totalBuildings: buildings.length,
      totalUnits,
      occupiedUnits,
      availableUnits: units.filter((u) => u.status === 'Available').length,
      underMaintenanceUnits: units.filter((u) => u.status === 'Under Maintenance').length,
      occupancyRate,
      totalMonthlyRevenueXAF,
      collectedRevenueXAF,
      pendingArrearsXAF,
      collectionRatePercent,
      collectedUnitsCount: units.filter((u) => u.status === 'Occupied' && !u.balanceDueXAF).length,
      pendingArrearsUnitsCount: units.filter((u) => (u.balanceDueXAF || 0) > 0).length,
      activeTicketsCount: tickets.filter((t) => t.status !== 'Resolved').length,
      resolvedTicketsCount: tickets.filter((t) => t.status === 'Resolved').length,
      certifiedAgentsCount,
      recentTransactionsCount: transactions.length,
      lastUpdated: nowIso()
    };
  }

  // Unit counts, occupancy and revenue are derived from the units table so they never drift.
  function withLiveTotals(b: Building, units: Unit[]): Building {
    const bUnits = units.filter((u) => u.buildingId === b.id);
    const occupied = bUnits.filter((u) => u.status === 'Occupied');
    return {
      ...b,
      totalUnits: bUnits.length,
      availableUnits: bUnits.filter((u) => u.status === 'Available').length,
      occupancyRate: bUnits.length > 0 ? Number(((occupied.length / bUnits.length) * 100).toFixed(1)) : 0,
      monthlyRevenueXAF: occupied.reduce((sum, u) => sum + (u.rentAmountXAF || 0), 0)
    };
  }

  // Resolve which unit a payment belongs to. Unit numbers repeat across buildings,
  // so prefer the unit id, then narrow by building and tenant. Ambiguous → no match.
  async function findUnitForPayment(ref: {
    unitId?: unknown;
    buildingName?: unknown;
    unitNumber?: unknown;
    tenantName?: unknown;
  }): Promise<Unit | undefined> {
    if (isNonEmptyString(ref.unitId)) {
      return await repo.getUnit(ref.unitId);
    }
    const hasBuilding = isNonEmptyString(ref.buildingName);
    const hasUnit = isNonEmptyString(ref.unitNumber);
    const hasTenant = isNonEmptyString(ref.tenantName);
    if (!hasBuilding && !hasUnit && !hasTenant) return undefined;

    let pool = await repo.listUnits();
    if (hasBuilding) {
      const name = (ref.buildingName as string).trim().toLowerCase();
      const ids = new Set((await repo.listBuildings()).filter((b) => b.name.toLowerCase() === name).map((b) => b.id));
      pool = pool.filter((u) => ids.has(u.buildingId));
    }
    if (hasUnit) {
      const unitNumber = (ref.unitNumber as string).trim().toLowerCase();
      pool = pool.filter((u) => u.unitNumber.toLowerCase() === unitNumber);
    }
    if (pool.length > 1 && hasTenant) {
      const tenant = (ref.tenantName as string).trim().toLowerCase();
      pool = pool.filter((u) => u.tenantName?.toLowerCase() === tenant);
    }
    return pool.length === 1 ? pool[0] : undefined;
  }

  // Reduces a unit's balance after a completed payment. Pass the transaction's repository.
  async function reconcilePayment(tx: Repository, unit: Unit | undefined, amountXAF: number) {
    if (!unit) return;
    const balance = unit.balanceDueXAF || 0;
    await tx.saveUnit({
      ...unit,
      balanceDueXAF: Math.max(0, balance - amountXAF),
      lastPaymentDate: today()
    });
  }

  const gatewayRef = (method: FinancialRecord['method']) =>
    `${method === 'Orange Money' ? 'OM' : 'MOMO'}-CMR-${randomInt(1_000_000, 10_000_000)}`;

  // ============================================================================
  // REST API ROUTES FOR MOBILE APPLICATION & WEB CLIENT
  // Reads are public; every change requires a signed-in account with the right role.
  // ============================================================================

  // 1. Healthcheck & System Telemetry
  app.get('/api/health', ah(async (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'FindNdap Cadastral & Proptech Core API',
      version: '1.4.2',
      uptimeSeconds: process.uptime(),
      timestamp: nowIso()
    });
  }));

  // 2. Mobile App Runtime Configuration & Gateway Status
  app.get('/api/mobile/config', ah(async (req: Request, res: Response) => {
    const config: MobileConfig = {
      appName: 'FindNdap Mobile',
      version: '1.4.2',
      environment: IS_PRODUCTION ? 'production' : 'staging-sandbox',
      currency: 'XAF',
      momoGatewayStatus: 'ONLINE',
      orangeMoneyGatewayStatus: 'ONLINE',
      endpoints: {
        stats: '/api/stats',
        buildings: '/api/buildings',
        units: '/api/units',
        transactions: '/api/transactions',
        tickets: '/api/tickets',
        sms: '/api/sms',
        agentKYC: '/api/agent/kyc',
        momoWebhook: '/api/momo/webhook',
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        me: '/api/auth/me'
      }
    };
    res.json(config);
  }));

  // 3. Authentication
  app.post('/api/auth/login', ah(async (req: Request, res: Response) => {
    const { username, password } = req.body || {};
    if (!isNonEmptyString(username) || typeof password !== 'string' || password.length === 0) {
      return fail(req, res, 400, 'Username and password are required', "Nom d'utilisateur et mot de passe requis");
    }
    const limiterKey = loginLimiter.key(req.ip || 'unknown', username);
    const wait = await loginLimiter.retryAfterSeconds(repo, limiterKey);
    if (wait > 0) {
      res.setHeader('Retry-After', String(wait));
      return fail(
        req,
        res,
        429,
        `Too many failed attempts. Try again in ${Math.ceil(wait / 60)} minute(s).`,
        `Trop de tentatives échouées. Réessayez dans ${Math.ceil(wait / 60)} minute(s).`
      );
    }
    const session = await login(repo, username.trim(), password);
    if (!session) {
      await loginLimiter.recordFailure(repo, limiterKey);
      return fail(req, res, 401, 'Incorrect username or password', "Nom d'utilisateur ou mot de passe incorrect");
    }
    await loginLimiter.reset(repo, limiterKey);
    const kyc = session.user.role === 'agent' ? await repo.getKyc(session.user.id) : undefined;
    res.json({
      success: true,
      ...session,
      agentKYC: session.user.role === 'agent' ? (kyc ? publicKyc(kyc) : emptyKyc(session.user)) : null
    });
  }));

  app.post('/api/auth/logout', ah(async (req: Request, res: Response) => {
    if (res.locals.token) await logout(repo, res.locals.token);
    res.json({ success: true });
  }));

  app.get('/api/auth/me', requireRole('admin', 'agent'), ah(async (req: Request, res: Response) => {
    const user = currentUser(res)!;
    const kyc = user.role === 'agent' ? await repo.getKyc(user.id) : undefined;
    res.json({
      success: true,
      user,
      agentKYC: user.role === 'agent' ? (kyc ? publicKyc(kyc) : emptyKyc(user)) : null
    });
  }));

  // 4. Dynamic Real-Time Statistics
  app.get('/api/stats', ah(async (req: Request, res: Response) => {
    res.json((await computeStats()));
  }));

  // 5. Buildings API: List, Detail & Register
  app.get('/api/buildings', ah(async (req: Request, res: Response) => {
    const units = await repo.listUnits();
    const buildings = (await repo.listBuildings()).map((b) => withLiveTotals(b, units));
    res.json({ success: true, count: buildings.length, buildings });
  }));

  app.get('/api/buildings/:id', ah(async (req: Request, res: Response) => {
    const building = await repo.getBuilding(req.params.id);
    if (!building) {
      return fail(req, res, 404, 'Building not found', 'Immeuble introuvable');
    }
    const units = await repo.listUnits();
    res.json({
      success: true,
      building: withLiveTotals(building, units),
      units: units.filter((u) => u.buildingId === building.id)
    });
  }));

  app.post('/api/buildings', requireRole('agent'), ah(async (req: Request, res: Response) => {
    const user = currentUser(res)!;
    const kyc = await repo.getKyc(user.id);
    if (!kyc || kyc.status !== 'certified') {
      return fail(
        req,
        res,
        403,
        'Only certified agents can register buildings. Submit your certification application and wait for approval.',
        "Seuls les agents certifiés peuvent enregistrer des immeubles. Soumettez votre demande de certification et attendez l'approbation."
      );
    }

    const { building, units: newUnits } = req.body || {};
    if (!building || typeof building !== 'object' || !isNonEmptyString(building.name)) {
      return fail(req, res, 400, 'Building name is required', "Le nom de l'immeuble est requis");
    }
    if (!isNonEmptyString(building.cadastreNumber)) {
      return fail(req, res, 400, 'Titre Foncier (cadastreNumber) is required', 'Le Titre Foncier (cadastreNumber) est requis');
    }
    if (building.propertyType !== undefined && !isOneOf(building.propertyType, PROPERTY_TYPES)) {
      return fail(
        req,
        res,
        400,
        `propertyType must be one of: ${PROPERTY_TYPES.join(', ')}`,
        `propertyType doit être l'une des valeurs : ${PROPERTY_TYPES.join(', ')}`
      );
    }
    if (await repo.cadastreExists(building.cadastreNumber)) {
      return fail(
        req,
        res,
        409,
        `A building with Titre Foncier ${building.cadastreNumber} is already registered`,
        `Un immeuble avec le Titre Foncier ${building.cadastreNumber} est déjà enregistré`
      );
    }
    if (newUnits !== undefined && !Array.isArray(newUnits)) {
      return fail(req, res, 400, 'units must be an array', 'units doit être un tableau');
    }
    const seenUnitNumbers = new Set<string>();
    for (const u of newUnits || []) {
      if (!u || !isNonEmptyString(u.unitNumber)) {
        return fail(req, res, 400, 'Every unit needs a unitNumber', 'Chaque logement doit avoir un numéro (unitNumber)');
      }
      if (!isAmount(u.rentAmountXAF, { allowZero: false })) {
        return fail(
          req,
          res,
          400,
          `Unit ${u.unitNumber}: rentAmountXAF must be a positive number`,
          `Logement ${u.unitNumber} : rentAmountXAF doit être un nombre positif`
        );
      }
      if (u.status !== undefined && !isOneOf(u.status, UNIT_STATUSES)) {
        return fail(
          req,
          res,
          400,
          `Unit ${u.unitNumber}: status must be one of: ${UNIT_STATUSES.join(', ')}`,
          `Logement ${u.unitNumber} : le statut doit être l'une des valeurs : ${UNIT_STATUSES.join(', ')}`
        );
      }
      if (u.status === 'Occupied' && !isNonEmptyString(u.tenantName)) {
        return fail(
          req,
          res,
          400,
          `Unit ${u.unitNumber}: an occupied unit needs a tenantName`,
          `Logement ${u.unitNumber} : un logement occupé doit avoir un locataire (tenantName)`
        );
      }
      const key = u.unitNumber.trim().toLowerCase();
      if (seenUnitNumbers.has(key)) {
        return fail(
          req,
          res,
          400,
          `Duplicate unit number "${u.unitNumber}" in this building`,
          `Numéro de logement en double « ${u.unitNumber} » dans cet immeuble`
        );
      }
      seenUnitNumbers.add(key);
    }

    const createdBuilding: Building = {
      id: newId('bld'),
      name: building.name.trim(),
      cadastreNumber: building.cadastreNumber.trim(),
      propertyType: building.propertyType || 'Residential Complex',
      city: isNonEmptyString(building.city) ? building.city.trim() : '',
      neighborhood: isNonEmptyString(building.neighborhood) ? building.neighborhood.trim() : '',
      photoUrl: isNonEmptyString(building.photoUrl) && /^https:\/\//i.test(building.photoUrl) ? building.photoUrl : '',
      amenities: Array.isArray(building.amenities) ? building.amenities.filter(isNonEmptyString) : [],
      registeredBy: `${kyc.fullName} (Cert. #${kyc.badgeId})`,
      isVerified: true,
      createdAt: today(),
      totalUnits: 0,
      availableUnits: 0,
      monthlyRevenueXAF: 0,
      occupancyRate: 0
    };

    await repo.transaction(async (tx) => {
      await tx.insertBuilding(createdBuilding, user.id);
      for (const u of newUnits || []) {
        await tx.insertUnit({
          id: newId('u'),
          buildingId: createdBuilding.id,
          unitNumber: u.unitNumber.trim(),
          type: isNonEmptyString(u.type) ? u.type.trim() : '',
          rentAmountXAF: Math.round(Number(u.rentAmountXAF)),
          status: u.status || 'Available',
          tenantName: isNonEmptyString(u.tenantName) ? u.tenantName.trim() : undefined,
          tenantPhone: isCameroonMobile(u.tenantPhone) ? formatCameroonMobile(u.tenantPhone) : undefined,
          balanceDueXAF: 0
        });
      }
    });

    const units = await repo.listUnits();
    res.status(201).json({
      success: true,
      message: msg(
        req,
        `Building "${createdBuilding.name}" registered successfully.`,
        `Immeuble « ${createdBuilding.name} » enregistré avec succès.`
      ),
      building: withLiveTotals(createdBuilding, units),
      units: units.filter((u) => u.buildingId === createdBuilding.id),
      stats: (await computeStats())
    });
  }));

  // 6. Units API: List (with buildingId / status filter) & Status/Rent/Lease Updates
  app.get('/api/units', ah(async (req: Request, res: Response) => {
    const { buildingId, status } = req.query;
    let units = await repo.listUnits();
    if (buildingId) units = units.filter((u) => u.buildingId === String(buildingId));
    if (status) units = units.filter((u) => u.status === String(status));
    res.json({ success: true, count: units.length, units });
  }));

  app.patch('/api/units/:id', requireRole('admin'), ah(async (req: Request, res: Response) => {
    const existing = await repo.getUnit(req.params.id);
    if (!existing) {
      return fail(req, res, 404, 'Unit not found', 'Logement introuvable');
    }

    const { status, rentAmountXAF, tenantName, tenantPhone, balanceDueXAF } = req.body || {};

    if (status !== undefined && !isOneOf(status, UNIT_STATUSES)) {
      return fail(
        req,
        res,
        400,
        `status must be one of: ${UNIT_STATUSES.join(', ')}`,
        `Le statut doit être l'une des valeurs : ${UNIT_STATUSES.join(', ')}`
      );
    }
    if (rentAmountXAF !== undefined && !isAmount(rentAmountXAF, { allowZero: false })) {
      return fail(req, res, 400, 'rentAmountXAF must be a positive number', 'rentAmountXAF doit être un nombre positif');
    }
    if (balanceDueXAF !== undefined && !isAmount(balanceDueXAF, { allowZero: true })) {
      return fail(req, res, 400, 'balanceDueXAF must be a non-negative number', 'balanceDueXAF doit être un nombre positif ou nul');
    }
    if (tenantName !== undefined && tenantName !== null && typeof tenantName !== 'string') {
      return fail(req, res, 400, 'tenantName must be a string', 'tenantName doit être une chaîne de caractères');
    }
    const phoneProvided = tenantPhone !== undefined && tenantPhone !== null && tenantPhone !== '';
    if (phoneProvided && !isCameroonMobile(tenantPhone)) {
      return fail(
        req,
        res,
        400,
        'tenantPhone must be a Cameroon mobile number (9 digits starting with 6)',
        'tenantPhone doit être un numéro mobile camerounais (9 chiffres commençant par 6)'
      );
    }

    const updated: Unit = {
      ...existing,
      status: status !== undefined ? status : existing.status,
      rentAmountXAF: rentAmountXAF !== undefined ? Math.round(Number(rentAmountXAF)) : existing.rentAmountXAF,
      tenantName: tenantName !== undefined ? (isNonEmptyString(tenantName) ? tenantName.trim() : undefined) : existing.tenantName,
      tenantPhone: tenantPhone !== undefined ? (phoneProvided ? formatCameroonMobile(tenantPhone) : undefined) : existing.tenantPhone,
      balanceDueXAF: balanceDueXAF !== undefined ? Math.round(Number(balanceDueXAF)) : existing.balanceDueXAF
    };

    if (updated.status === 'Available') {
      // Ending a lease must not silently discard money still owed on the unit.
      if ((updated.balanceDueXAF || 0) > 0) {
        return fail(
          req,
          res,
          409,
          `${existing.unitNumber} still owes ${updated.balanceDueXAF!.toLocaleString('en-US')} XAF; settle the balance before marking it Available`,
          `${existing.unitNumber} doit encore ${updated.balanceDueXAF!.toLocaleString('fr-FR')} XAF ; réglez le solde avant de le marquer Disponible`
        );
      }
      updated.tenantName = undefined;
      updated.tenantPhone = undefined;
    }
    if (updated.status === 'Occupied' && !isNonEmptyString(updated.tenantName)) {
      return fail(
        req,
        res,
        400,
        'tenantName is required to mark a unit Occupied',
        'Un locataire (tenantName) est requis pour marquer un logement Occupé'
      );
    }

    await repo.saveUnit(updated);
    res.json({ success: true, unit: updated, stats: (await computeStats()) });
  }));

  // 7. Financial Ledger, MoMo Rent Deposits & PDF Receipts
  app.get('/api/transactions', ah(async (req: Request, res: Response) => {
    const transactions = await repo.listTransactions();
    res.json({ success: true, count: transactions.length, transactions });
  }));

  app.post('/api/transactions', requireRole('admin'), ah(async (req: Request, res: Response) => {
    const { unitId, tenantName, buildingName, unitNumber, amountXAF, method, txRef, status } = req.body || {};

    if (!isAmount(amountXAF, { allowZero: false })) {
      return fail(req, res, 400, 'A positive amountXAF is required', 'Un montant amountXAF positif est requis');
    }
    if (method !== undefined && !isOneOf(method, PAYMENT_METHODS)) {
      return fail(
        req,
        res,
        400,
        `method must be one of: ${PAYMENT_METHODS.join(', ')}`,
        `method doit être l'une des valeurs : ${PAYMENT_METHODS.join(', ')}`
      );
    }
    if (status !== undefined && !isOneOf(status, TX_STATUSES)) {
      return fail(
        req,
        res,
        400,
        `status must be one of: ${TX_STATUSES.join(', ')}`,
        `Le statut doit être l'une des valeurs : ${TX_STATUSES.join(', ')}`
      );
    }

    const matchingUnit = await findUnitForPayment({ unitId, buildingName, unitNumber, tenantName });
    if (isNonEmptyString(unitId) && !matchingUnit) {
      return fail(req, res, 404, 'Unit not found', 'Logement introuvable');
    }
    const resolvedTenant = isNonEmptyString(tenantName) ? tenantName.trim() : matchingUnit?.tenantName;
    if (!resolvedTenant) {
      return fail(
        req,
        res,
        400,
        'tenantName is required (or pass the unitId of a leased unit)',
        "tenantName est requis (ou indiquez l'unitId d'un logement loué)"
      );
    }

    const paymentMethod: FinancialRecord['method'] = method || 'MTN MoMo';
    const newRecord: FinancialRecord = {
      id: newId('tx'),
      unitId: matchingUnit?.id,
      tenantName: resolvedTenant,
      buildingName:
        (matchingUnit && (await repo.getBuilding(matchingUnit.buildingId))?.name) ||
        (isNonEmptyString(buildingName) ? buildingName.trim() : '—'),
      unitNumber: matchingUnit?.unitNumber || (isNonEmptyString(unitNumber) ? unitNumber.trim() : '—'),
      amountXAF: Math.round(Number(amountXAF)),
      method: paymentMethod,
      date: nowIso(),
      status: status || 'Completed',
      txRef: isNonEmptyString(txRef) ? txRef.trim() : gatewayRef(paymentMethod)
    };

    await repo.transaction(async (tx) => {
      await tx.insertTransaction(newRecord);
      if (newRecord.status === 'Completed') await reconcilePayment(tx, matchingUnit, newRecord.amountXAF);
    });

    const fmt = newRecord.amountXAF.toLocaleString(langOf(req) === 'fr' ? 'fr-FR' : 'en-US');
    res.status(201).json({
      success: true,
      message: msg(
        req,
        `Deposit of ${fmt} XAF recorded via ${newRecord.method}.`,
        `Dépôt de ${fmt} XAF enregistré via ${newRecord.method}.`
      ),
      transaction: newRecord,
      stats: (await computeStats())
    });
  }));

  app.get('/api/transactions/:id/receipt', ah(async (req: Request, res: Response) => {
    const tx = await repo.getTransaction(req.params.id);
    if (!tx) {
      return fail(req, res, 404, 'Transaction not found', 'Transaction introuvable');
    }
    if (tx.status !== 'Completed') {
      return fail(
        req,
        res,
        409,
        'A receipt is only available once the payment is completed',
        'Un reçu n’est disponible qu’une fois le paiement effectué'
      );
    }
    const lang = req.query.lang === 'fr' ? 'fr' : req.query.lang === 'en' ? 'en' : langOf(req);
    const pdf = buildReceiptPdf(tx, lang);
    const safeRef = tx.txRef.replace(/[^A-Za-z0-9_-]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="FindNdap-Receipt-${safeRef}.pdf"`);
    res.setHeader('Content-Length', String(pdf.length));
    res.send(pdf);
  }));

  // 8. Maintenance Work-Orders API
  app.get('/api/tickets', ah(async (req: Request, res: Response) => {
    const tickets = await repo.listTickets();
    res.json({ success: true, count: tickets.length, tickets });
  }));

  app.post('/api/tickets', requireRole('admin'), ah(async (req: Request, res: Response) => {
    const { unitId, buildingName, unitNumber, tenantName, category, description, urgency } = req.body || {};

    if (!isNonEmptyString(description) || !isOneOf(category, TICKET_CATEGORIES)) {
      return fail(
        req,
        res,
        400,
        `description and a category (${TICKET_CATEGORIES.join(', ')}) are required`,
        `Une description et une catégorie (${TICKET_CATEGORIES.join(', ')}) sont requises`
      );
    }
    if (urgency !== undefined && !isOneOf(urgency, TICKET_URGENCIES)) {
      return fail(
        req,
        res,
        400,
        `urgency must be one of: ${TICKET_URGENCIES.join(', ')}`,
        `L'urgence doit être l'une des valeurs : ${TICKET_URGENCIES.join(', ')}`
      );
    }

    const unit = isNonEmptyString(unitId) ? await repo.getUnit(unitId) : undefined;
    if (isNonEmptyString(unitId) && !unit) {
      return fail(req, res, 404, 'Unit not found', 'Logement introuvable');
    }
    const resolvedBuilding = (unit && (await repo.getBuilding(unit.buildingId))?.name) || (isNonEmptyString(buildingName) ? buildingName.trim() : '');
    const resolvedUnit = unit?.unitNumber || (isNonEmptyString(unitNumber) ? unitNumber.trim() : '');
    if (!resolvedBuilding || !resolvedUnit) {
      return fail(
        req,
        res,
        400,
        'Choose the unit (unitId) or give buildingName and unitNumber',
        "Choisissez le logement (unitId) ou indiquez buildingName et unitNumber"
      );
    }

    const newTicket: MaintenanceTicket = {
      id: newId('tkt'),
      buildingName: resolvedBuilding,
      unitNumber: resolvedUnit,
      tenantName: isNonEmptyString(tenantName) ? tenantName.trim() : unit?.tenantName || '—',
      category,
      description: description.trim(),
      status: 'Logged',
      reportedDate: nowIso(),
      urgency: urgency || 'Medium'
    };

    await repo.insertTicket(newTicket);
    res.status(201).json({ success: true, ticket: newTicket, stats: (await computeStats()) });
  }));

  app.patch('/api/tickets/:id', requireRole('admin'), ah(async (req: Request, res: Response) => {
    const existing = await repo.getTicket(req.params.id);
    if (!existing) {
      return fail(req, res, 404, 'Ticket not found', 'Ticket introuvable');
    }

    const { status, assignedVendor, costXAF } = req.body || {};
    if (status !== undefined && !isOneOf(status, TICKET_STATUSES)) {
      return fail(
        req,
        res,
        400,
        `status must be one of: ${TICKET_STATUSES.join(', ')}`,
        `Le statut doit être l'une des valeurs : ${TICKET_STATUSES.join(', ')}`
      );
    }
    if (costXAF !== undefined && !isAmount(costXAF, { allowZero: true })) {
      return fail(req, res, 400, 'costXAF must be a non-negative number', 'costXAF doit être un nombre positif ou nul');
    }

    const updated: MaintenanceTicket = {
      ...existing,
      status: status || existing.status,
      assignedVendor: assignedVendor !== undefined ? (isNonEmptyString(assignedVendor) ? assignedVendor.trim() : undefined) : existing.assignedVendor,
      costXAF: costXAF !== undefined ? Math.round(Number(costXAF)) : existing.costXAF
    };

    await repo.saveTicket(updated);
    res.json({ success: true, ticket: updated, stats: (await computeStats()) });
  }));

  // 9. Bulk SMS Broadcasts API
  app.get('/api/sms', ah(async (req: Request, res: Response) => {
    const smsNotices = await repo.listSms();
    res.json({ success: true, count: smsNotices.length, smsNotices });
  }));

  app.post('/api/sms', requireRole('admin'), ah(async (req: Request, res: Response) => {
    const { title, message, target } = req.body || {};

    if (!isNonEmptyString(title) || !isNonEmptyString(message)) {
      return fail(req, res, 400, 'Missing title or message', 'Titre ou message manquant');
    }

    const buildings = await repo.listBuildings();
    const units = await repo.listUnits();
    const audience = resolveSmsAudience(isNonEmptyString(target) ? target : 'all', buildings, units);
    if (!audience) {
      const options = listSmsAudiences(buildings, units).map((a) => a.id).join(', ');
      return fail(req, res, 400, `Unknown target. Use one of: ${options}`, `Destinataires inconnus. Utilisez : ${options}`);
    }
    const recipientCount = audience.recipients.length;
    if (recipientCount === 0) {
      return fail(
        req,
        res,
        400,
        `No tenants with a phone number in "${audience.label}"`,
        `Aucun locataire avec un numéro de téléphone dans « ${audience.label} »`
      );
    }

    const newNotice: BulkSmsNotice = {
      id: newId('sms'),
      title: title.trim(),
      message: message.trim(),
      target: audience.label,
      recipientCount,
      sentAt: nowIso()
    };
    await repo.insertSms(newNotice);

    res.status(201).json({
      success: true,
      message: msg(
        req,
        `Broadcast queued via Direct Telecom Gateway (${recipientCount} recipient${recipientCount === 1 ? '' : 's'}).`,
        `Diffusion envoyée via la passerelle télécom (${recipientCount} destinataire${recipientCount === 1 ? '' : 's'}).`
      ),
      notice: newNotice
    });
  }));

  // 10. Agent Certification: application (agent) and review (admin)
  app.get('/api/agent/kyc', requireRole('agent'), ah(async (req: Request, res: Response) => {
    const user = currentUser(res)!;
    const kyc = await repo.getKyc(user.id);
    res.json({ success: true, agentKYC: kyc ? publicKyc(kyc) : emptyKyc(user) });
  }));

  app.post('/api/agent/kyc', requireRole('agent'), ah(async (req: Request, res: Response) => {
    const user = currentUser(res)!;
    const existing = await repo.getKyc(user.id);
    if (existing?.status === 'certified') {
      return fail(
        req,
        res,
        409,
        'You are already certified. Contact the administrator to change your details.',
        "Vous êtes déjà certifié. Contactez l'administrateur pour modifier vos informations."
      );
    }

    const { fullName, agencyName, licenseId, city, momoNumber, document } = req.body || {};
    if (!isNonEmptyString(fullName) || !isNonEmptyString(licenseId) || !isNonEmptyString(agencyName) || !isNonEmptyString(city)) {
      return fail(
        req,
        res,
        400,
        'Full name, agency, license ID and city are required',
        'Nom complet, agence, numéro de licence et ville sont requis'
      );
    }
    if (!isCameroonMobile(momoNumber)) {
      return fail(
        req,
        res,
        400,
        'momoNumber must be a Cameroon mobile number (9 digits starting with 6)',
        'momoNumber doit être un numéro mobile camerounais (9 chiffres commençant par 6)'
      );
    }

    let newDocument: KycDocument | undefined;
    if (document !== undefined && document !== null) {
      const type = DOCUMENT_TYPES[document?.mimeType];
      if (!type || !isNonEmptyString(document?.name) || typeof document?.dataBase64 !== 'string') {
        return fail(req, res, 400, 'The ID document must be a PDF, JPG or PNG file', "La pièce d'identité doit être un fichier PDF, JPG ou PNG");
      }
      const bytes = Buffer.from(document.dataBase64, 'base64');
      if (bytes.length === 0 || bytes.length > MAX_DOCUMENT_BYTES) {
        return fail(req, res, 400, 'The ID document must be at most 3 MB', "La pièce d'identité doit faire au maximum 3 Mo");
      }
      if (!type.magic.every((b, i) => bytes[i] === b)) {
        return fail(
          req,
          res,
          400,
          'The file content does not match its type (PDF, JPG or PNG expected)',
          'Le contenu du fichier ne correspond pas à son type (PDF, JPG ou PNG attendu)'
        );
      }
      newDocument = {
        name: path.basename(String(document.name).replace(/\\/g, '/')).slice(0, 120),
        mime: document.mimeType,
        data: bytes
      };
    }
    if (!newDocument && !existing?.hasDocument) {
      return fail(
        req,
        res,
        400,
        'Upload your National ID card or agency license (PDF, JPG or PNG)',
        "Téléversez votre carte nationale d'identité ou votre licence d'agence (PDF, JPG ou PNG)"
      );
    }

    const record: KycRecord = {
      userId: user.id,
      fullName: fullName.trim(),
      agencyName: agencyName.trim(),
      licenseId: licenseId.trim(),
      city: city.trim(),
      momoNumber: formatCameroonMobile(momoNumber),
      isCertified: false,
      status: 'in-review',
      submittedAt: nowIso(),
      reviewedAt: undefined,
      reviewNote: undefined,
      badgeId: undefined
    };
    await repo.saveKyc(record, newDocument);

    res.json({
      success: true,
      message: msg(
        req,
        'Application submitted. An administrator will review your documents.',
        'Demande envoyée. Un administrateur va examiner vos documents.'
      ),
      agentKYC: publicKyc((await repo.getKyc(user.id))!)
    });
  }));

  app.get('/api/admin/agents', requireRole('admin'), ah(async (req: Request, res: Response) => {
    const agents = (await repo.listKyc()).map(publicKyc);
    res.json({ success: true, count: agents.length, agents });
  }));

  app.get('/api/admin/agents/:userId/document', requireRole('admin'), ah(async (req: Request, res: Response) => {
    const doc = await repo.getKycDocument(req.params.userId);
    if (!doc || !DOCUMENT_TYPES[doc.mime]) {
      return fail(req, res, 404, 'No document on file', 'Aucun document enregistré');
    }
    const safeName = doc.name.replace(/[^A-Za-z0-9._-]/g, '_');
    res.setHeader('Content-Type', doc.mime);
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(doc.data);
  }));

  app.post('/api/admin/agents/:userId/review', requireRole('admin'), ah(async (req: Request, res: Response) => {
    const kyc = await repo.getKyc(req.params.userId);
    if (!kyc) {
      return fail(req, res, 404, 'Application not found', 'Demande introuvable');
    }
    const { decision, note } = req.body || {};
    if (decision !== 'approve' && decision !== 'reject') {
      return fail(req, res, 400, 'decision must be "approve" or "reject"', 'decision doit être "approve" ou "reject"');
    }
    if (decision === 'approve' && kyc.status !== 'in-review') {
      return fail(req, res, 409, 'Only applications under review can be approved', 'Seules les demandes en cours d’examen peuvent être approuvées');
    }
    if (decision === 'reject' && kyc.status !== 'in-review' && kyc.status !== 'certified') {
      return fail(req, res, 409, 'This application cannot be rejected in its current state', 'Cette demande ne peut pas être rejetée dans son état actuel');
    }
    if (decision === 'reject' && !isNonEmptyString(note)) {
      return fail(req, res, 400, 'Give the agent a reason for the rejection', 'Indiquez à l’agent le motif du rejet');
    }

    const updated: KycRecord = {
      ...kyc,
      status: decision === 'approve' ? 'certified' : 'rejected',
      isCertified: decision === 'approve',
      badgeId:
        decision === 'approve'
          ? `FND-CERT-${new Date().getFullYear()}-${randomBytes(3).toString('hex').toUpperCase()}`
          : undefined,
      reviewedAt: nowIso(),
      reviewNote: isNonEmptyString(note) ? note.trim().slice(0, 500) : undefined
    };
    await repo.saveKyc(updated);

    res.json({
      success: true,
      message:
        decision === 'approve'
          ? msg(req, `${kyc.fullName} is now a certified agent.`, `${kyc.fullName} est désormais un agent certifié.`)
          : msg(req, `${kyc.fullName}'s application was rejected.`, `La demande de ${kyc.fullName} a été rejetée.`),
      agent: publicKyc(updated),
      stats: (await computeStats())
    });
  }));

  // 11. MTN MoMo & Orange Money Payment Callbacks
  async function processMoMoPayment(req: Request, body: any) {
    const { amount, unitReference, transactionRef } = body;
    const amountNum = Math.round(Number(amount));
    const method: FinancialRecord['method'] = isOneOf(body.method, PAYMENT_METHODS) ? body.method : 'MTN MoMo';
    const match = await findUnitForPayment({
      unitId: body.unitId,
      buildingName: body.buildingName,
      unitNumber: unitReference,
      tenantName: body.tenantName
    });

    const newTx: FinancialRecord = {
      id: newId('tx'),
      unitId: match?.id,
      tenantName: (isNonEmptyString(body.tenantName) && body.tenantName.trim()) || match?.tenantName || 'Unknown payer',
      buildingName:
        (match && (await repo.getBuilding(match.buildingId))?.name) || (isNonEmptyString(body.buildingName) ? body.buildingName.trim() : '—'),
      unitNumber: match?.unitNumber || (isNonEmptyString(unitReference) ? unitReference.trim() : '—'),
      amountXAF: amountNum,
      method,
      date: nowIso(),
      status: 'Completed',
      txRef: isNonEmptyString(transactionRef) ? transactionRef.trim() : gatewayRef(method)
    };

    await repo.transaction(async (tx) => {
      await tx.insertTransaction(newTx);
      await reconcilePayment(tx, match, amountNum);
    });

    return {
      status: 'SUCCESS',
      message: msg(
        req,
        'Payment received, ledger auto-reconciled and PDF receipt available.',
        'Paiement reçu, registre rapproché automatiquement et reçu PDF disponible.'
      ),
      transaction: newTx,
      reconciledUnit: match ? match.unitNumber : null,
      stats: (await computeStats())
    };
  }

  const momoAmountError = (req: Request, res: Response) =>
    req.body && isAmount(req.body.amount, { allowZero: false })
      ? null
      : fail(req, res, 400, 'amount must be a positive number', 'amount doit être un nombre positif');

  // Telecom callback receiver: requires the shared secret in the X-Webhook-Secret header.
  app.post('/api/momo/webhook', ah(async (req: Request, res: Response) => {
    const expectedSecret = process.env.MOMO_WEBHOOK_SECRET;
    if (!expectedSecret) {
      return fail(req, res, 503, 'Webhook secret is not configured on the server', "Le secret du webhook n'est pas configuré sur le serveur");
    }
    const providedSecret = req.get('X-Webhook-Secret');
    if (!providedSecret || !secretsMatch(providedSecret, expectedSecret)) {
      return fail(req, res, 401, 'Invalid or missing webhook secret', 'Secret du webhook invalide ou manquant');
    }
    if (momoAmountError(req, res)) return;
    res.status(200).json(await processMoMoPayment(req, req.body));
  }));

  // In-browser Developer Sandbox simulator: admin only, disabled in production.
  app.post('/api/momo/simulate', (req: Request, res: Response, next: NextFunction) => {
    if (IS_PRODUCTION) {
      return fail(req, res, 404, 'Not found', 'Introuvable');
    }
    next();
  }, requireRole('admin'), ah(async (req: Request, res: Response) => {
    if (momoAmountError(req, res)) return;
    res.status(200).json(await processMoMoPayment(req, req.body));
  }));

  // Unknown API routes return JSON instead of falling through to the SPA.
  app.use('/api', (req: Request, res: Response) => fail(req, res, 404, 'Not found', 'Introuvable'));

  // Errors from any /api handler end up here as JSON. A duplicate key (two requests racing to
  // register the same Titre Foncier or unit number) is reported as a conflict, not a crash.
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);
    if (err?.type === 'entity.too.large') {
      return fail(req, res, 413, 'The request is too large (maximum 4.5 MB)', 'La requête est trop volumineuse (4,5 Mo maximum)');
    }
    if (err?.type === 'entity.parse.failed') {
      return fail(req, res, 400, 'The request body is not valid JSON', "Le corps de la requête n'est pas un JSON valide");
    }
    if (err?.code === '23505') {
      return fail(req, res, 409, 'This record already exists', 'Cet enregistrement existe déjà');
    }
    console.error('[api] Unhandled error:', err);
    return fail(req, res, 500, 'Something went wrong on the server. Please try again.', 'Une erreur est survenue sur le serveur. Veuillez réessayer.');
  });

  return app;
}
