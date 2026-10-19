import pg from 'pg';
import {
  Building,
  Unit,
  FinancialRecord,
  MaintenanceTicket,
  BulkSmsNotice,
  AgentKYC,
  UserRole
} from '../src/types.js';
import {
  INITIAL_BUILDINGS,
  INITIAL_UNITS,
  INITIAL_TRANSACTIONS,
  INITIAL_TICKETS,
  INITIAL_SMS_NOTICES
} from '../src/data/mockData.js';

export interface UserRecord {
  id: string;
  username: string;
  role: UserRole;
  passwordHash: string;
  active: boolean;
}

export interface KycRecord extends AgentKYC {
  userId: string;
  documentMime?: string;
}

export interface KycDocument {
  name: string;
  mime: string;
  data: Buffer;
}

type Row = Record<string, any>;
type Queryable = pg.Pool | pg.PoolClient;

// Any fixed number works; it just has to be the same for every instance of the app.
const INIT_LOCK_ID = 834_215_007;

// `seq` gives every table a stable insertion order (newest-first lists use ORDER BY seq DESC).
const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS buildings (
  seq BIGINT GENERATED ALWAYS AS IDENTITY,
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cadastre_number TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  neighborhood TEXT NOT NULL DEFAULT '',
  property_type TEXT NOT NULL,
  photo_url TEXT NOT NULL DEFAULT '',
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  registered_by TEXT NOT NULL DEFAULT '',
  registered_by_user_id TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS buildings_cadastre_number_key ON buildings (lower(cadastre_number));

CREATE TABLE IF NOT EXISTS units (
  seq BIGINT GENERATED ALWAYS AS IDENTITY,
  id TEXT PRIMARY KEY,
  building_id TEXT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '',
  rent_amount_xaf INTEGER NOT NULL,
  status TEXT NOT NULL,
  tenant_name TEXT,
  tenant_phone TEXT,
  balance_due_xaf INTEGER NOT NULL DEFAULT 0,
  last_payment_date TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS units_building_unit_number_key ON units (building_id, lower(unit_number));

CREATE TABLE IF NOT EXISTS transactions (
  seq BIGINT GENERATED ALWAYS AS IDENTITY,
  id TEXT PRIMARY KEY,
  unit_id TEXT REFERENCES units(id) ON DELETE SET NULL,
  tenant_name TEXT NOT NULL,
  building_name TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  amount_xaf INTEGER NOT NULL,
  method TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  tx_ref TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
  seq BIGINT GENERATED ALWAYS AS IDENTITY,
  id TEXT PRIMARY KEY,
  building_name TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  tenant_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  reported_date TEXT NOT NULL,
  urgency TEXT NOT NULL,
  assigned_vendor TEXT,
  cost_xaf INTEGER,
  photo_url TEXT
);

CREATE TABLE IF NOT EXISTS sms_notices (
  seq BIGINT GENERATED ALWAYS AS IDENTITY,
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target TEXT NOT NULL,
  recipient_count INTEGER NOT NULL,
  sent_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'agent')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON users (lower(username));

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_kyc (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  agency_name TEXT NOT NULL,
  license_id TEXT NOT NULL,
  city TEXT NOT NULL,
  momo_number TEXT NOT NULL,
  document_name TEXT,
  document_mime TEXT,
  document_data BYTEA,
  status TEXT NOT NULL CHECK (status IN ('unverified', 'in-review', 'certified', 'rejected')),
  badge_id TEXT UNIQUE,
  submitted_at TEXT,
  reviewed_at TEXT,
  review_note TEXT
);

CREATE TABLE IF NOT EXISTS login_failures (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at TEXT NOT NULL
);
`;

const toBuilding = (r: Row): Building => ({
  id: r.id,
  name: r.name,
  cadastreNumber: r.cadastre_number,
  city: r.city,
  neighborhood: r.neighborhood,
  propertyType: r.property_type,
  photoUrl: r.photo_url,
  amenities: Array.isArray(r.amenities) ? r.amenities : [],
  registeredBy: r.registered_by,
  isVerified: !!r.is_verified,
  createdAt: r.created_at,
  // Derived per request from the units table (see withLiveTotals in server/app.ts).
  totalUnits: 0,
  availableUnits: 0,
  monthlyRevenueXAF: 0,
  occupancyRate: 0
});

const toUnit = (r: Row): Unit => ({
  id: r.id,
  buildingId: r.building_id,
  unitNumber: r.unit_number,
  type: r.type,
  rentAmountXAF: r.rent_amount_xaf,
  status: r.status,
  tenantName: r.tenant_name ?? undefined,
  tenantPhone: r.tenant_phone ?? undefined,
  balanceDueXAF: r.balance_due_xaf,
  lastPaymentDate: r.last_payment_date ?? undefined
});

const toTransaction = (r: Row): FinancialRecord => ({
  id: r.id,
  unitId: r.unit_id ?? undefined,
  tenantName: r.tenant_name,
  buildingName: r.building_name,
  unitNumber: r.unit_number,
  amountXAF: r.amount_xaf,
  method: r.method,
  date: r.date,
  status: r.status,
  txRef: r.tx_ref
});

const toTicket = (r: Row): MaintenanceTicket => ({
  id: r.id,
  buildingName: r.building_name,
  unitNumber: r.unit_number,
  tenantName: r.tenant_name,
  category: r.category,
  description: r.description,
  status: r.status,
  reportedDate: r.reported_date,
  urgency: r.urgency,
  assignedVendor: r.assigned_vendor ?? undefined,
  costXAF: r.cost_xaf ?? undefined,
  photoUrl: r.photo_url ?? undefined
});

const toSms = (r: Row): BulkSmsNotice => ({
  id: r.id,
  title: r.title,
  message: r.message,
  target: r.target,
  recipientCount: r.recipient_count,
  sentAt: r.sent_at
});

const toUser = (r: Row): UserRecord => ({
  id: r.id,
  username: r.username,
  role: r.role,
  passwordHash: r.password_hash,
  active: !!r.active
});

const toKyc = (r: Row): KycRecord => ({
  userId: r.user_id,
  username: r.username ?? undefined,
  fullName: r.full_name,
  agencyName: r.agency_name,
  licenseId: r.license_id,
  city: r.city,
  momoNumber: r.momo_number,
  documentName: r.document_name ?? undefined,
  documentMime: r.document_mime ?? undefined,
  hasDocument: !!r.has_document,
  isCertified: r.status === 'certified',
  status: r.status,
  badgeId: r.badge_id ?? undefined,
  submittedAt: r.submitted_at ?? undefined,
  reviewedAt: r.reviewed_at ?? undefined,
  reviewNote: r.review_note ?? undefined
});

// Every column except the document bytes, which are only read by getKycDocument.
const KYC_COLUMNS = `k.user_id, u.username, k.full_name, k.agency_name, k.license_id, k.city, k.momo_number,
  k.document_name, k.document_mime, (k.document_data IS NOT NULL) AS has_document, k.status, k.badge_id,
  k.submitted_at, k.reviewed_at, k.review_note`;

/** Data access for every table. Methods run on the pool, or on one client inside `transaction`. */
export class Repository {
  constructor(private readonly db: Queryable, private readonly pool: pg.Pool | null) {}

  private async rows(text: string, params: unknown[] = []): Promise<Row[]> {
    return (await this.db.query(text, params)).rows;
  }

  private async one(text: string, params: unknown[] = []): Promise<Row | undefined> {
    return (await this.db.query(text, params)).rows[0];
  }

  private async exec(text: string, params: unknown[] = []): Promise<void> {
    await this.db.query(text, params);
  }

  /** Runs `fn` in a database transaction; nested calls reuse the outer transaction. */
  async transaction<T>(fn: (tx: Repository) => Promise<T>): Promise<T> {
    if (!this.pool) return fn(this);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(new Repository(client, null));
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  /** Serialises start-up work (schema, seeding, account sync) across all running instances. */
  async lockForInit(): Promise<void> {
    await this.exec('SELECT pg_advisory_xact_lock($1)', [INIT_LOCK_ID]);
  }

  // Schema & seed
  async createSchema(): Promise<void> {
    await this.exec(SCHEMA);
  }

  async isSeeded(): Promise<boolean> {
    return !!(await this.one(`SELECT 1 FROM meta WHERE key = 'seeded'`));
  }

  async seedDemoData(): Promise<void> {
    // Lists are read newest-first, so insert in reverse to keep the original display order.
    for (const b of [...INITIAL_BUILDINGS].reverse()) await this.insertBuilding(b, null);
    for (const u of INITIAL_UNITS) await this.insertUnit(u);
    for (const t of [...INITIAL_TRANSACTIONS].reverse()) await this.insertTransaction(t);
    for (const t of [...INITIAL_TICKETS].reverse()) await this.insertTicket(t);
    for (const s of [...INITIAL_SMS_NOTICES].reverse()) await this.insertSms(s);
  }

  async markSeeded(value: string): Promise<void> {
    await this.exec(`INSERT INTO meta (key, value) VALUES ('seeded', $1) ON CONFLICT (key) DO NOTHING`, [value]);
  }

  // Buildings
  async listBuildings(): Promise<Building[]> {
    return (await this.rows(`SELECT * FROM buildings ORDER BY seq DESC`)).map(toBuilding);
  }

  async getBuilding(id: string): Promise<Building | undefined> {
    const r = await this.one(`SELECT * FROM buildings WHERE id = $1`, [id]);
    return r ? toBuilding(r) : undefined;
  }

  async cadastreExists(cadastreNumber: string): Promise<boolean> {
    return !!(await this.one(`SELECT 1 FROM buildings WHERE lower(cadastre_number) = lower($1)`, [cadastreNumber.trim()]));
  }

  async insertBuilding(b: Building, registeredByUserId: string | null): Promise<void> {
    await this.exec(
      `INSERT INTO buildings (id, name, cadastre_number, city, neighborhood, property_type, photo_url, amenities,
         registered_by, registered_by_user_id, is_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12)`,
      [
        b.id, b.name, b.cadastreNumber, b.city, b.neighborhood, b.propertyType, b.photoUrl,
        JSON.stringify(b.amenities), b.registeredBy, registeredByUserId, b.isVerified, b.createdAt
      ]
    );
  }

  // Units
  async listUnits(): Promise<Unit[]> {
    return (await this.rows(`SELECT * FROM units ORDER BY seq ASC`)).map(toUnit);
  }

  async getUnit(id: string): Promise<Unit | undefined> {
    const r = await this.one(`SELECT * FROM units WHERE id = $1`, [id]);
    return r ? toUnit(r) : undefined;
  }

  async insertUnit(u: Unit): Promise<void> {
    await this.exec(
      `INSERT INTO units (id, building_id, unit_number, type, rent_amount_xaf, status, tenant_name, tenant_phone,
         balance_due_xaf, last_payment_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        u.id, u.buildingId, u.unitNumber, u.type ?? '', u.rentAmountXAF, u.status, u.tenantName ?? null,
        u.tenantPhone ?? null, u.balanceDueXAF ?? 0, u.lastPaymentDate ?? null
      ]
    );
  }

  async saveUnit(u: Unit): Promise<void> {
    await this.exec(
      `UPDATE units SET unit_number = $2, type = $3, rent_amount_xaf = $4, status = $5, tenant_name = $6,
         tenant_phone = $7, balance_due_xaf = $8, last_payment_date = $9
       WHERE id = $1`,
      [
        u.id, u.unitNumber, u.type ?? '', u.rentAmountXAF, u.status, u.tenantName ?? null, u.tenantPhone ?? null,
        u.balanceDueXAF ?? 0, u.lastPaymentDate ?? null
      ]
    );
  }

  // Transactions
  async listTransactions(): Promise<FinancialRecord[]> {
    return (await this.rows(`SELECT * FROM transactions ORDER BY seq DESC`)).map(toTransaction);
  }

  async getTransaction(id: string): Promise<FinancialRecord | undefined> {
    const r = await this.one(`SELECT * FROM transactions WHERE id = $1`, [id]);
    return r ? toTransaction(r) : undefined;
  }

  async insertTransaction(t: FinancialRecord): Promise<void> {
    await this.exec(
      `INSERT INTO transactions (id, unit_id, tenant_name, building_name, unit_number, amount_xaf, method, date, status, tx_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [t.id, t.unitId ?? null, t.tenantName, t.buildingName, t.unitNumber, t.amountXAF, t.method, t.date, t.status, t.txRef]
    );
  }

  // Tickets
  async listTickets(): Promise<MaintenanceTicket[]> {
    return (await this.rows(`SELECT * FROM tickets ORDER BY seq DESC`)).map(toTicket);
  }

  async getTicket(id: string): Promise<MaintenanceTicket | undefined> {
    const r = await this.one(`SELECT * FROM tickets WHERE id = $1`, [id]);
    return r ? toTicket(r) : undefined;
  }

  async insertTicket(t: MaintenanceTicket): Promise<void> {
    await this.exec(
      `INSERT INTO tickets (id, building_name, unit_number, tenant_name, category, description, status, reported_date,
         urgency, assigned_vendor, cost_xaf, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        t.id, t.buildingName, t.unitNumber, t.tenantName, t.category, t.description, t.status, t.reportedDate,
        t.urgency, t.assignedVendor ?? null, t.costXAF ?? null, t.photoUrl ?? null
      ]
    );
  }

  async saveTicket(t: MaintenanceTicket): Promise<void> {
    await this.exec(`UPDATE tickets SET status = $2, assigned_vendor = $3, cost_xaf = $4 WHERE id = $1`, [
      t.id, t.status, t.assignedVendor ?? null, t.costXAF ?? null
    ]);
  }

  // SMS
  async listSms(): Promise<BulkSmsNotice[]> {
    return (await this.rows(`SELECT * FROM sms_notices ORDER BY seq DESC`)).map(toSms);
  }

  async insertSms(s: BulkSmsNotice): Promise<void> {
    await this.exec(
      `INSERT INTO sms_notices (id, title, message, target, recipient_count, sent_at) VALUES ($1, $2, $3, $4, $5, $6)`,
      [s.id, s.title, s.message, s.target, s.recipientCount, s.sentAt]
    );
  }

  // Users & sessions
  async findUserByUsername(username: string): Promise<UserRecord | undefined> {
    const r = await this.one(`SELECT * FROM users WHERE lower(username) = lower($1)`, [username]);
    return r ? toUser(r) : undefined;
  }

  async getUser(id: string): Promise<UserRecord | undefined> {
    const r = await this.one(`SELECT * FROM users WHERE id = $1`, [id]);
    return r ? toUser(r) : undefined;
  }

  async upsertUser(u: { id: string; username: string; role: UserRole; passwordHash: string }): Promise<void> {
    await this.exec(
      `INSERT INTO users (id, username, password_hash, role, active, created_at)
       VALUES ($1, $2, $3, $4, TRUE, $5)
       ON CONFLICT ((lower(username))) DO UPDATE
         SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, active = TRUE`,
      [u.id, u.username, u.passwordHash, u.role, new Date().toISOString()]
    );
  }

  /** Disables accounts no longer listed in the environment and revokes their sessions. */
  async deactivateUsersExcept(usernames: string[]): Promise<void> {
    const keep = usernames.map((n) => n.toLowerCase());
    await this.exec(`UPDATE users SET active = FALSE WHERE active AND NOT (lower(username) = ANY($1::text[]))`, [keep]);
    await this.exec(`DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE NOT active)`);
  }

  async insertSession(tokenHash: string, userId: string, expiresAt: string): Promise<void> {
    await this.exec(`INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES ($1, $2, $3, $4)`, [
      tokenHash, userId, new Date().toISOString(), expiresAt
    ]);
  }

  /** Returns the session's user when the token is valid, not expired, and the account is active. */
  async findSessionUser(tokenHash: string): Promise<UserRecord | undefined> {
    const r = await this.one(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > $2 AND u.active`,
      [tokenHash, new Date().toISOString()]
    );
    return r ? toUser(r) : undefined;
  }

  async deleteSession(tokenHash: string): Promise<void> {
    await this.exec(`DELETE FROM sessions WHERE token_hash = $1`, [tokenHash]);
  }

  async deleteExpired(): Promise<void> {
    const now = new Date().toISOString();
    await this.exec(`DELETE FROM sessions WHERE expires_at < $1`, [now]);
    await this.exec(`DELETE FROM login_failures WHERE reset_at < $1`, [now]);
  }

  // Login rate limiting (stored in the database so it holds across serverless instances)
  async getLoginFailures(key: string): Promise<{ count: number; resetAt: string } | undefined> {
    const r = await this.one(`SELECT count, reset_at FROM login_failures WHERE key = $1`, [key]);
    return r ? { count: r.count, resetAt: r.reset_at } : undefined;
  }

  async recordLoginFailure(key: string, windowMs: number): Promise<void> {
    const now = new Date();
    const resetAt = new Date(now.getTime() + windowMs).toISOString();
    await this.exec(
      `INSERT INTO login_failures (key, count, reset_at) VALUES ($1, 1, $2)
       ON CONFLICT (key) DO UPDATE SET
         count = CASE WHEN login_failures.reset_at < $3 THEN 1 ELSE login_failures.count + 1 END,
         reset_at = CASE WHEN login_failures.reset_at < $3 THEN $2 ELSE login_failures.reset_at END`,
      [key, resetAt, now.toISOString()]
    );
  }

  async clearLoginFailures(key: string): Promise<void> {
    await this.exec(`DELETE FROM login_failures WHERE key = $1`, [key]);
  }

  // Agent KYC
  async getKyc(userId: string): Promise<KycRecord | undefined> {
    const r = await this.one(
      `SELECT ${KYC_COLUMNS} FROM agent_kyc k JOIN users u ON u.id = k.user_id WHERE k.user_id = $1`,
      [userId]
    );
    return r ? toKyc(r) : undefined;
  }

  async listKyc(): Promise<KycRecord[]> {
    return (
      await this.rows(
        `SELECT ${KYC_COLUMNS} FROM agent_kyc k JOIN users u ON u.id = k.user_id
         ORDER BY CASE k.status WHEN 'in-review' THEN 0 ELSE 1 END, k.submitted_at DESC NULLS LAST`
      )
    ).map(toKyc);
  }

  async getKycDocument(userId: string): Promise<KycDocument | undefined> {
    const r = await this.one(
      `SELECT document_name, document_mime, document_data FROM agent_kyc
       WHERE user_id = $1 AND document_data IS NOT NULL`,
      [userId]
    );
    return r ? { name: r.document_name || 'document', mime: r.document_mime, data: r.document_data } : undefined;
  }

  async countCertifiedAgents(): Promise<number> {
    const r = await this.one(
      `SELECT COUNT(*)::int AS n FROM agent_kyc k JOIN users u ON u.id = k.user_id WHERE k.status = 'certified' AND u.active`
    );
    return r?.n ?? 0;
  }

  /**
   * Inserts or updates an application. Pass `document` to replace the stored file;
   * omit it to keep the file already on record.
   */
  async saveKyc(k: KycRecord, document?: KycDocument): Promise<void> {
    await this.exec(
      `INSERT INTO agent_kyc (user_id, full_name, agency_name, license_id, city, momo_number, document_name,
         document_mime, document_data, status, badge_id, submitted_at, reviewed_at, review_note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name, agency_name = EXCLUDED.agency_name,
         license_id = EXCLUDED.license_id, city = EXCLUDED.city, momo_number = EXCLUDED.momo_number,
         document_name = COALESCE(EXCLUDED.document_name, agent_kyc.document_name),
         document_mime = COALESCE(EXCLUDED.document_mime, agent_kyc.document_mime),
         document_data = COALESCE(EXCLUDED.document_data, agent_kyc.document_data),
         status = EXCLUDED.status, badge_id = EXCLUDED.badge_id, submitted_at = EXCLUDED.submitted_at,
         reviewed_at = EXCLUDED.reviewed_at, review_note = EXCLUDED.review_note`,
      [
        k.userId, k.fullName, k.agencyName, k.licenseId, k.city, k.momoNumber,
        document?.name ?? null, document?.mime ?? null, document?.data ?? null,
        k.status, k.badgeId ?? null, k.submittedAt ?? null, k.reviewedAt ?? null, k.reviewNote ?? null
      ]
    );
  }
}

/**
 * Builds a pg connection string from the environment. Neon (and the Vercel–Neon integration)
 * provide DATABASE_URL; POSTGRES_URL is accepted as a fallback.
 */
export function databaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const raw = env.DATABASE_URL || env.POSTGRES_URL;
  if (!raw) {
    throw new Error(
      'DATABASE_URL is not set. Add your Neon connection string to .env (locally) or to the Vercel project settings.'
    );
  }
  const url = new URL(raw);
  // pg already treats sslmode=require as verify-full; say so explicitly to avoid its deprecation warning.
  const mode = url.searchParams.get('sslmode');
  if (mode && ['prefer', 'require', 'verify-ca'].includes(mode) && !url.searchParams.has('uselibpqcompat')) {
    url.searchParams.set('sslmode', 'verify-full');
  }
  return url.toString();
}

export function createPool(connectionString = databaseUrl()): pg.Pool {
  return new pg.Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX) || 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000
  });
}
