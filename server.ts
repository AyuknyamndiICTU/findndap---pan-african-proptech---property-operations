import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createHash, timingSafeEqual } from 'crypto';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_BUILDINGS,
  INITIAL_UNITS,
  INITIAL_TRANSACTIONS,
  INITIAL_TICKETS,
  DEFAULT_CERTIFIED_AGENT
} from './src/data/mockData.js';
import {
  Building,
  Unit,
  FinancialRecord,
  MaintenanceTicket,
  BulkSmsNotice,
  AgentKYC,
  DashboardStats,
  MobileConfig
} from './src/types.js';

const PORT = 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Hashing both sides first gives equal-length buffers, as timingSafeEqual requires.
function secretsMatch(provided: string, expected: string): boolean {
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

async function startServer() {
  const app = express();

  // Middleware: JSON Body Parser
  app.use(express.json());

  // CORS Middleware for Mobile App Emulators, Expo, and External Clients
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-Webhook-Secret');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ============================================================================
  // IN-MEMORY DATA STORE (Mutable in real-time across API calls)
  // ============================================================================
  let buildings: Building[] = JSON.parse(JSON.stringify(INITIAL_BUILDINGS));
  let units: Unit[] = JSON.parse(JSON.stringify(INITIAL_UNITS));
  let transactions: FinancialRecord[] = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
  let tickets: MaintenanceTicket[] = JSON.parse(JSON.stringify(INITIAL_TICKETS));
  let agentKYC: AgentKYC = JSON.parse(JSON.stringify(DEFAULT_CERTIFIED_AGENT));
  let smsNotices: BulkSmsNotice[] = [
    {
      id: 'sms-001',
      title: 'September Rent Collection Notice',
      message: 'Dear Occupant, rental reconciliation for September 2025 is underway. Please initiate your settlement via MTN MoMo (*126#) or Orange Money (#150#) to auto-generate your instant digital receipt. FindNdap Operations.',
      target: 'All Building Tenants',
      recipientCount: 84,
      sentAt: '2025-09-01 08:30'
    },
    {
      id: 'sms-002',
      title: 'Scheduled Forage Booster Servicing',
      message: 'Water booster pump maintenance scheduled today from 14:00 to 16:30 at Résidence Le Cristal. Underground reservoir tanks will remain active. - Management',
      target: 'Résidence Le Cristal',
      recipientCount: 16,
      sentAt: '2025-09-04 10:15'
    }
  ];

  // Dynamically compute real-time statistics from current portfolio state
  function computeStats(): DashboardStats {
    const totalBuildings = buildings.length;
    const totalUnits = units.length;
    const occupiedUnits = units.filter((u) => u.status === 'Occupied').length;
    const availableUnits = units.filter((u) => u.status === 'Available').length;
    const underMaintenanceUnits = units.filter((u) => u.status === 'Under Maintenance').length;
    const occupancyRate = totalUnits > 0 ? Number(((occupiedUnits / totalUnits) * 100).toFixed(1)) : 0;

    // Monthly potential revenue from all units
    const totalMonthlyRevenueXAF = units.reduce((sum, u) => sum + (u.rentAmountXAF || 0), 0);

    // Actual collected revenue from completed transactions
    const collectedRevenueXAF = transactions
      .filter((t) => t.status === 'Completed')
      .reduce((sum, t) => sum + (t.amountXAF || 0), 0);

    // Outstanding balances & arrears
    const pendingArrearsXAF = units.reduce((sum, u) => sum + (u.balanceDueXAF || 0), 0);

    // Collection rate percentage
    const collectionRatePercent =
      totalMonthlyRevenueXAF > 0
        ? Number(((collectedRevenueXAF / totalMonthlyRevenueXAF) * 100).toFixed(1))
        : 0;

    const collectedUnitsCount = units.filter(
      (u) => u.status === 'Occupied' && (!u.balanceDueXAF || u.balanceDueXAF === 0)
    ).length;
    const pendingArrearsUnitsCount = units.filter((u) => (u.balanceDueXAF || 0) > 0).length;

    const activeTicketsCount = tickets.filter((t) => t.status !== 'Resolved').length;
    const resolvedTicketsCount = tickets.filter((t) => t.status === 'Resolved').length;

    return {
      totalBuildings,
      totalUnits,
      occupiedUnits,
      availableUnits,
      underMaintenanceUnits,
      occupancyRate,
      totalMonthlyRevenueXAF,
      collectedRevenueXAF,
      pendingArrearsXAF,
      collectionRatePercent,
      collectedUnitsCount,
      pendingArrearsUnitsCount,
      activeTicketsCount,
      resolvedTicketsCount,
      certifiedAgentsCount: agentKYC.isCertified ? 1 : 0,
      recentTransactionsCount: transactions.length,
      lastUpdated: new Date().toISOString()
    };
  }

  // ============================================================================
  // REST API ROUTES FOR MOBILE APPLICATION & WEB CLIENT
  // ============================================================================

  // 1. Healthcheck & System Telemetry
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'FindNdap Cadastral & Proptech Core API',
      version: '1.4.2',
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // 2. Mobile App Runtime Configuration & Gateway Status
  app.get('/api/mobile/config', (req: Request, res: Response) => {
    const config: MobileConfig = {
      appName: 'FindNdap Mobile',
      version: '1.4.2',
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'staging-sandbox',
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
        momoWebhook: '/api/momo/webhook'
      }
    };
    res.json(config);
  });

  // 3. Dynamic Real-Time Statistics (Recomputed across all portfolio actions)
  app.get('/api/stats', (req: Request, res: Response) => {
    res.json(computeStats());
  });

  // 4. Buildings API: List, Detail & Register
  app.get('/api/buildings', (req: Request, res: Response) => {
    res.json({
      success: true,
      count: buildings.length,
      buildings
    });
  });

  app.get('/api/buildings/:id', (req: Request, res: Response) => {
    const building = buildings.find((b) => b.id === req.params.id);
    if (!building) {
      return res.status(404).json({ success: false, error: 'Building not found' });
    }
    const buildingUnits = units.filter((u) => u.buildingId === req.params.id);
    res.json({ success: true, building, units: buildingUnits });
  });

  app.post('/api/buildings', (req: Request, res: Response) => {
    const { building, units: newUnits } = req.body;

    if (!building || !building.name) {
      return res.status(400).json({ success: false, error: 'Invalid building payload' });
    }

    const createdBuilding: Building = {
      ...building,
      id: building.id || `bld-${Date.now().toString().slice(-4)}`,
      createdAt: building.createdAt || new Date().toISOString().split('T')[0],
      isVerified: building.isVerified !== undefined ? building.isVerified : true
    };

    buildings.unshift(createdBuilding);

    if (Array.isArray(newUnits) && newUnits.length > 0) {
      const formattedUnits: Unit[] = newUnits.map((u, i) => ({
        ...u,
        id: u.id || `u-${Date.now().toString().slice(-4)}-${i + 1}`,
        buildingId: createdBuilding.id
      }));
      units.push(...formattedUnits);
    }

    res.status(201).json({
      success: true,
      message: `Building "${createdBuilding.name}" registered successfully.`,
      building: createdBuilding,
      stats: computeStats()
    });
  });

  // 5. Units API: List (with buildingId / status filter) & Status/Rent Updates
  app.get('/api/units', (req: Request, res: Response) => {
    const { buildingId, status } = req.query;
    let filtered = units;

    if (buildingId) {
      filtered = filtered.filter((u) => u.buildingId === String(buildingId));
    }
    if (status) {
      filtered = filtered.filter((u) => u.status === String(status));
    }

    res.json({
      success: true,
      count: filtered.length,
      units: filtered
    });
  });

  app.patch('/api/units/:id', (req: Request, res: Response) => {
    const unitIndex = units.findIndex((u) => u.id === req.params.id);
    if (unitIndex === -1) {
      return res.status(404).json({ success: false, error: 'Unit not found' });
    }

    const { status, rentAmountXAF, tenantName, tenantPhone, balanceDueXAF } = req.body;
    const existing = units[unitIndex];

    const updated: Unit = {
      ...existing,
      status: status !== undefined ? status : existing.status,
      rentAmountXAF: rentAmountXAF !== undefined ? Number(rentAmountXAF) : existing.rentAmountXAF,
      tenantName: tenantName !== undefined ? tenantName : existing.tenantName,
      tenantPhone: tenantPhone !== undefined ? tenantPhone : existing.tenantPhone,
      balanceDueXAF: balanceDueXAF !== undefined ? Number(balanceDueXAF) : existing.balanceDueXAF
    };

    units[unitIndex] = updated;

    res.json({
      success: true,
      unit: updated,
      stats: computeStats()
    });
  });

  // 6. Financial Ledger & MoMo Rent Deposit API
  app.get('/api/transactions', (req: Request, res: Response) => {
    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  });

  app.post('/api/transactions', (req: Request, res: Response) => {
    const { tenantName, buildingName, unitNumber, amountXAF, method, txRef, status } = req.body;

    if (!tenantName || !amountXAF) {
      return res.status(400).json({ success: false, error: 'Missing tenantName or amountXAF' });
    }

    const newRecord: FinancialRecord = {
      id: `tx-${Date.now().toString().slice(-5)}`,
      tenantName,
      buildingName: buildingName || 'Résidence Le Cristal',
      unitNumber: unitNumber || 'Apt 101',
      amountXAF: Number(amountXAF),
      method: method || 'MTN MoMo',
      date: 'Just Now',
      status: status || 'Completed',
      txRef: txRef || `MOMO-CMR-${Math.floor(1000000 + Math.random() * 9000000)}`
    };

    transactions.unshift(newRecord);

    // Auto-reconcile with corresponding unit if found
    const matchingUnit = units.find(
      (u) =>
        u.tenantName?.toLowerCase() === tenantName.toLowerCase() ||
        (unitNumber && u.unitNumber.toLowerCase().includes(unitNumber.toLowerCase()))
    );

    if (matchingUnit && matchingUnit.balanceDueXAF && matchingUnit.balanceDueXAF > 0) {
      matchingUnit.balanceDueXAF = Math.max(0, matchingUnit.balanceDueXAF - Number(amountXAF));
      matchingUnit.lastPaymentDate = new Date().toISOString().split('T')[0];
    }

    res.status(201).json({
      success: true,
      message: `Deposit of ${newRecord.amountXAF.toLocaleString()} XAF recorded via ${newRecord.method}.`,
      transaction: newRecord,
      stats: computeStats()
    });
  });

  // 7. Maintenance Work-Orders API
  app.get('/api/tickets', (req: Request, res: Response) => {
    res.json({
      success: true,
      count: tickets.length,
      tickets
    });
  });

  app.post('/api/tickets', (req: Request, res: Response) => {
    const { buildingName, unitNumber, tenantName, category, description, urgency } = req.body;

    if (!description || !category) {
      return res.status(400).json({ success: false, error: 'Missing description or category' });
    }

    const newTicket: MaintenanceTicket = {
      id: `tkt-${Date.now().toString().slice(-4)}`,
      buildingName: buildingName || 'Résidence Le Cristal',
      unitNumber: unitNumber || 'Apt 101',
      tenantName: tenantName || 'Sophie Ebanda',
      category: category || 'Plumbing',
      description,
      status: 'Logged',
      reportedDate: 'Just Now',
      urgency: urgency || 'Medium'
    };

    tickets.unshift(newTicket);

    res.status(201).json({
      success: true,
      ticket: newTicket,
      stats: computeStats()
    });
  });

  app.patch('/api/tickets/:id', (req: Request, res: Response) => {
    const ticketIndex = tickets.findIndex((t) => t.id === req.params.id);
    if (ticketIndex === -1) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    const { status, assignedVendor, costXAF } = req.body;
    const existing = tickets[ticketIndex];

    const updated: MaintenanceTicket = {
      ...existing,
      status: status || existing.status,
      assignedVendor: assignedVendor !== undefined ? assignedVendor : existing.assignedVendor,
      costXAF: costXAF !== undefined ? Number(costXAF) : existing.costXAF
    };

    tickets[ticketIndex] = updated;

    res.json({
      success: true,
      ticket: updated,
      stats: computeStats()
    });
  });

  // 8. Bulk SMS Broadcasts API
  app.get('/api/sms', (req: Request, res: Response) => {
    res.json({
      success: true,
      count: smsNotices.length,
      smsNotices
    });
  });

  app.post('/api/sms', (req: Request, res: Response) => {
    const { title, message, target } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Missing title or message' });
    }

    const recipientCount = target === 'All Building Tenants' ? 84 : 16;
    const newNotice: BulkSmsNotice = {
      id: `sms-${Date.now().toString().slice(-4)}`,
      title,
      message,
      target: target || 'All Building Tenants',
      recipientCount,
      sentAt: 'Just Now'
    };

    smsNotices.unshift(newNotice);

    res.status(201).json({
      success: true,
      message: `Broadcast queued via Direct Telecom Gateway (${recipientCount} recipients).`,
      notice: newNotice
    });
  });

  // 9. Certified Agent Accreditation & KYC API
  app.get('/api/agent/kyc', (req: Request, res: Response) => {
    res.json({
      success: true,
      agentKYC
    });
  });

  app.post('/api/agent/kyc', (req: Request, res: Response) => {
    const { fullName, agencyName, licenseId, city, momoNumber, documentName } = req.body;

    if (!fullName || !licenseId) {
      return res.status(400).json({ success: false, error: 'Missing fullName or licenseId' });
    }

    agentKYC = {
      fullName,
      agencyName: agencyName || 'Independent Real Estate Partner',
      licenseId,
      city: city || 'Douala, Cameroon',
      momoNumber: momoNumber || '+237 670 00 00 00',
      documentName: documentName || 'Cadastral_Audit_Certificate.pdf',
      isCertified: true,
      status: 'certified',
      badgeId: `FND-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      submittedAt: new Date().toISOString().split('T')[0]
    };

    res.json({
      success: true,
      message: `Agent ${fullName} certified successfully.`,
      agentKYC,
      stats: computeStats()
    });
  });

  app.post('/api/agent/toggle-demo', (req: Request, res: Response) => {
    if (agentKYC.isCertified) {
      agentKYC = {
        fullName: 'Unverified Guest',
        agencyName: 'Unregistered Broker',
        licenseId: 'NONE',
        city: 'Douala',
        momoNumber: '',
        isCertified: false,
        status: 'unverified'
      };
    } else {
      agentKYC = JSON.parse(JSON.stringify(DEFAULT_CERTIFIED_AGENT));
    }

    res.json({
      success: true,
      message: `Agent status is now ${agentKYC.isCertified ? 'CERTIFIED' : 'UNCERTIFIED'}`,
      agentKYC,
      stats: computeStats()
    });
  });

  // 10. MTN MoMo & Orange Money Payment Callbacks
  function processMoMoPayment(body: any) {
    const { amount, unitReference, transactionRef } = body;

    const amountNum = Number(amount) || 250000;
    const tx = transactionRef || `MOMO-CALLBACK-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newTx: FinancialRecord = {
      id: `tx-cb-${Date.now().toString().slice(-4)}`,
      tenantName: body.tenantName || 'Dr. Jean-Marc Bella',
      buildingName: body.buildingName || 'Résidence Le Cristal',
      unitNumber: unitReference || 'Apt 101',
      amountXAF: amountNum,
      method: 'MTN MoMo',
      date: 'Just Now',
      status: 'Completed',
      txRef: tx
    };

    transactions.unshift(newTx);

    // Auto-reconcile unit balance if match found
    const match = units.find((u) => u.unitNumber.toLowerCase() === (unitReference || '').toLowerCase());
    if (match && match.balanceDueXAF) {
      match.balanceDueXAF = Math.max(0, match.balanceDueXAF - amountNum);
    }

    return {
      status: 'SUCCESS',
      message: 'Payment received, ledger auto-reconciled and PDF receipt queued.',
      transaction: newTx,
      reconciledUnit: unitReference || 'Apt 101',
      stats: computeStats()
    };
  }

  // Telecom callback receiver: requires the shared secret in the X-Webhook-Secret header.
  app.post('/api/momo/webhook', (req: Request, res: Response) => {
    const expectedSecret = process.env.MOMO_WEBHOOK_SECRET;
    if (!expectedSecret) {
      return res.status(503).json({ success: false, error: 'Webhook secret is not configured on the server' });
    }

    const providedSecret = req.get('X-Webhook-Secret');
    if (!providedSecret || !secretsMatch(providedSecret, expectedSecret)) {
      return res.status(401).json({ success: false, error: 'Invalid or missing webhook secret' });
    }

    res.status(200).json(processMoMoPayment(req.body));
  });

  // Unauthenticated simulator for the in-browser Developer Sandbox; disabled in production.
  app.post('/api/momo/simulate', (req: Request, res: Response) => {
    if (IS_PRODUCTION) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    res.status(200).json(processMoMoPayment(req.body));
  });

  // ============================================================================
  // FRONTEND CLIENT INTEGRATION (Vite Middleware in Dev / Static in Prod)
  // ============================================================================
  if (!IS_PRODUCTION) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FindNdap Core Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
