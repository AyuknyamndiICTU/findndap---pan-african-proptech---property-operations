import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
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

export const DATA_DIR = path.resolve(process.env.DATA_DIR || 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

export interface UserRecord {
  id: string;
  username: string;
  role: UserRole;
  passwordHash: string;
  active: boolean;
}

export interface KycRecord extends AgentKYC {
  userId: string;
  documentPath?: string;
  documentMime?: string;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS buildings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cadastre_number TEXT NOT NULL COLLATE NOCASE UNIQUE,
  city TEXT NOT NULL DEFAULT '',
  neighborhood TEXT NOT NULL DEFAULT '',
  property_type TEXT NOT NULL,
  photo_url TEXT NOT NULL DEFAULT '',
  amenities TEXT NOT NULL DEFAULT '[]',
  registered_by TEXT NOT NULL DEFAULT '',
  registered_by_user_id TEXT,
  is_verified INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  building_id TEXT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '',
  rent_amount_xaf INTEGER NOT NULL,
  status TEXT NOT NULL,
  tenant_name TEXT,
  tenant_phone TEXT,
  balance_due_xaf INTEGER NOT NULL DEFAULT 0,
  last_payment_date TEXT,
  UNIQUE (building_id, unit_number COLLATE NOCASE)
);

CREATE TABLE IF NOT EXISTS transactions (
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
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target TEXT NOT NULL,
  recipient_count INTEGER NOT NULL,
  sent_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'agent')),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

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
  document_path TEXT,
  document_mime TEXT,
  status TEXT NOT NULL CHECK (status IN ('unverified', 'in-review', 'certified', 'rejected')),
  badge_id TEXT UNIQUE,
  submitted_at TEXT,
  reviewed_at TEXT,
  review_note TEXT
);
`;

type Row = Record<string, any>;

const toBuilding = (r: Row): Building => ({
  id: r.id,
  name: r.name,
  cadastreNumber: r.cadastre_number,
  city: r.city,
  neighborhood: r.neighborhood,
  propertyType: r.property_type,
  photoUrl: r.photo_url,
  amenities: JSON.parse(r.amenities),
  registeredBy: r.registered_by,
  isVerified: !!r.is_verified,
  createdAt: r.created_at,
  // Derived per request from the units table (see withLiveTotals in server.ts).
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
  documentPath: r.document_path ?? undefined,
  documentMime: r.document_mime ?? undefined,
  hasDocument: !!r.document_path,
  isCertified: r.status === 'certified',
  status: r.status,
  badgeId: r.badge_id ?? undefined,
  submittedAt: r.submitted_at ?? undefined,
  reviewedAt: r.reviewed_at ?? undefined,
  reviewNote: r.review_note ?? undefined
});

function seedIfEmpty(db: Database.Database) {
  if (db.prepare(`SELECT value FROM meta WHERE key = 'seeded'`).get()) return;

  const seed = db.transaction(() => {
    // Lists are read newest-first (rowid DESC), so seed in reverse to keep the original order.
    const insertBuilding = db.prepare(
      `INSERT INTO buildings (id, name, cadastre_number, city, neighborhood, property_type, photo_url, amenities, registered_by, is_verified, created_at)
       VALUES (@id, @name, @cadastreNumber, @city, @neighborhood, @propertyType, @photoUrl, @amenities, @registeredBy, @isVerified, @createdAt)`
    );
    for (const b of [...INITIAL_BUILDINGS].reverse()) {
      insertBuilding.run({ ...b, amenities: JSON.stringify(b.amenities), isVerified: b.isVerified ? 1 : 0 });
    }
    for (const u of INITIAL_UNITS) insertUnitStmt(db).run(unitParams(u));
    for (const t of [...INITIAL_TRANSACTIONS].reverse()) insertTransactionStmt(db).run(transactionParams(t));
    for (const t of [...INITIAL_TICKETS].reverse()) insertTicketStmt(db).run(ticketParams(t));
    for (const s of [...INITIAL_SMS_NOTICES].reverse()) insertSmsStmt(db).run(s);
    db.prepare(`INSERT INTO meta (key, value) VALUES ('seeded', ?)`).run(new Date().toISOString());
  });
  seed();
}

const insertUnitStmt = (db: Database.Database) =>
  db.prepare(
    `INSERT INTO units (id, building_id, unit_number, type, rent_amount_xaf, status, tenant_name, tenant_phone, balance_due_xaf, last_payment_date)
     VALUES (@id, @buildingId, @unitNumber, @type, @rentAmountXAF, @status, @tenantName, @tenantPhone, @balanceDueXAF, @lastPaymentDate)`
  );
const unitParams = (u: Unit) => ({
  id: u.id,
  buildingId: u.buildingId,
  unitNumber: u.unitNumber,
  type: u.type ?? '',
  rentAmountXAF: u.rentAmountXAF,
  status: u.status,
  tenantName: u.tenantName ?? null,
  tenantPhone: u.tenantPhone ?? null,
  balanceDueXAF: u.balanceDueXAF ?? 0,
  lastPaymentDate: u.lastPaymentDate ?? null
});

const insertTransactionStmt = (db: Database.Database) =>
  db.prepare(
    `INSERT INTO transactions (id, unit_id, tenant_name, building_name, unit_number, amount_xaf, method, date, status, tx_ref)
     VALUES (@id, @unitId, @tenantName, @buildingName, @unitNumber, @amountXAF, @method, @date, @status, @txRef)`
  );
const transactionParams = (t: FinancialRecord) => ({ ...t, unitId: t.unitId ?? null });

const insertTicketStmt = (db: Database.Database) =>
  db.prepare(
    `INSERT INTO tickets (id, building_name, unit_number, tenant_name, category, description, status, reported_date, urgency, assigned_vendor, cost_xaf, photo_url)
     VALUES (@id, @buildingName, @unitNumber, @tenantName, @category, @description, @status, @reportedDate, @urgency, @assignedVendor, @costXAF, @photoUrl)`
  );
const ticketParams = (t: MaintenanceTicket) => ({
  ...t,
  assignedVendor: t.assignedVendor ?? null,
  costXAF: t.costXAF ?? null,
  photoUrl: t.photoUrl ?? null
});

const insertSmsStmt = (db: Database.Database) =>
  db.prepare(
    `INSERT INTO sms_notices (id, title, message, target, recipient_count, sent_at)
     VALUES (@id, @title, @message, @target, @recipientCount, @sentAt)`
  );

export function openDatabase(file = process.env.DATABASE_PATH || path.join(DATA_DIR, 'findndap.db')) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  seedIfEmpty(db);

  return {
    raw: db,
    transaction: <T>(fn: () => T): T => db.transaction(fn)(),

    // Buildings
    listBuildings: (): Building[] => db.prepare(`SELECT * FROM buildings ORDER BY rowid DESC`).all().map(toBuilding),
    getBuilding: (id: string): Building | undefined => {
      const r = db.prepare(`SELECT * FROM buildings WHERE id = ?`).get(id);
      return r ? toBuilding(r as Row) : undefined;
    },
    cadastreExists: (cadastreNumber: string): boolean =>
      !!db.prepare(`SELECT 1 FROM buildings WHERE cadastre_number = ?`).get(cadastreNumber.trim()),
    insertBuilding: (b: Building, registeredByUserId: string | null) =>
      db
        .prepare(
          `INSERT INTO buildings (id, name, cadastre_number, city, neighborhood, property_type, photo_url, amenities, registered_by, registered_by_user_id, is_verified, created_at)
           VALUES (@id, @name, @cadastreNumber, @city, @neighborhood, @propertyType, @photoUrl, @amenities, @registeredBy, @userId, @isVerified, @createdAt)`
        )
        .run({ ...b, amenities: JSON.stringify(b.amenities), isVerified: b.isVerified ? 1 : 0, userId: registeredByUserId }),

    // Units
    listUnits: (): Unit[] => db.prepare(`SELECT * FROM units ORDER BY rowid ASC`).all().map(toUnit),
    getUnit: (id: string): Unit | undefined => {
      const r = db.prepare(`SELECT * FROM units WHERE id = ?`).get(id);
      return r ? toUnit(r as Row) : undefined;
    },
    insertUnit: (u: Unit) => insertUnitStmt(db).run(unitParams(u)),
    saveUnit: (u: Unit) =>
      db
        .prepare(
          `UPDATE units SET unit_number = @unitNumber, type = @type, rent_amount_xaf = @rentAmountXAF, status = @status,
             tenant_name = @tenantName, tenant_phone = @tenantPhone, balance_due_xaf = @balanceDueXAF, last_payment_date = @lastPaymentDate
           WHERE id = @id`
        )
        .run(unitParams(u)),

    // Transactions
    listTransactions: (): FinancialRecord[] =>
      db.prepare(`SELECT * FROM transactions ORDER BY rowid DESC`).all().map(toTransaction),
    getTransaction: (id: string): FinancialRecord | undefined => {
      const r = db.prepare(`SELECT * FROM transactions WHERE id = ?`).get(id);
      return r ? toTransaction(r as Row) : undefined;
    },
    insertTransaction: (t: FinancialRecord) => insertTransactionStmt(db).run(transactionParams(t)),

    // Tickets
    listTickets: (): MaintenanceTicket[] => db.prepare(`SELECT * FROM tickets ORDER BY rowid DESC`).all().map(toTicket),
    getTicket: (id: string): MaintenanceTicket | undefined => {
      const r = db.prepare(`SELECT * FROM tickets WHERE id = ?`).get(id);
      return r ? toTicket(r as Row) : undefined;
    },
    insertTicket: (t: MaintenanceTicket) => insertTicketStmt(db).run(ticketParams(t)),
    saveTicket: (t: MaintenanceTicket) =>
      db
        .prepare(`UPDATE tickets SET status = @status, assigned_vendor = @assignedVendor, cost_xaf = @costXAF WHERE id = @id`)
        .run(ticketParams(t)),

    // SMS
    listSms: (): BulkSmsNotice[] => db.prepare(`SELECT * FROM sms_notices ORDER BY rowid DESC`).all().map(toSms),
    insertSms: (s: BulkSmsNotice) => insertSmsStmt(db).run(s),

    // Users & sessions
    findUserByUsername: (username: string): UserRecord | undefined => {
      const r = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);
      return r ? toUser(r as Row) : undefined;
    },
    getUser: (id: string): UserRecord | undefined => {
      const r = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
      return r ? toUser(r as Row) : undefined;
    },
    upsertUser: (u: { id: string; username: string; role: UserRole; passwordHash: string }) =>
      db
        .prepare(
          `INSERT INTO users (id, username, password_hash, role, active, created_at)
           VALUES (@id, @username, @passwordHash, @role, 1, @createdAt)
           ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash, role = excluded.role, active = 1`
        )
        .run({ ...u, createdAt: new Date().toISOString() }),
    deactivateUsersExcept: (usernames: string[]) => {
      const keep = new Set(usernames.map((n) => n.toLowerCase()));
      const all = db.prepare(`SELECT id, username FROM users WHERE active = 1`).all() as Row[];
      for (const r of all) {
        if (!keep.has(String(r.username).toLowerCase())) {
          db.prepare(`UPDATE users SET active = 0 WHERE id = ?`).run(r.id);
          db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(r.id);
        }
      }
    },
    insertSession: (tokenHash: string, userId: string, expiresAt: string) =>
      db
        .prepare(`INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`)
        .run(tokenHash, userId, new Date().toISOString(), expiresAt),
    findSession: (tokenHash: string): { userId: string; expiresAt: string } | undefined => {
      const r = db.prepare(`SELECT user_id, expires_at FROM sessions WHERE token_hash = ?`).get(tokenHash) as Row | undefined;
      return r ? { userId: r.user_id, expiresAt: r.expires_at } : undefined;
    },
    deleteSession: (tokenHash: string) => db.prepare(`DELETE FROM sessions WHERE token_hash = ?`).run(tokenHash),
    deleteExpiredSessions: () => db.prepare(`DELETE FROM sessions WHERE expires_at < ?`).run(new Date().toISOString()),

    // Agent KYC
    getKyc: (userId: string): KycRecord | undefined => {
      const r = db
        .prepare(`SELECT k.*, u.username FROM agent_kyc k JOIN users u ON u.id = k.user_id WHERE k.user_id = ?`)
        .get(userId);
      return r ? toKyc(r as Row) : undefined;
    },
    listKyc: (): KycRecord[] =>
      db
        .prepare(
          `SELECT k.*, u.username FROM agent_kyc k JOIN users u ON u.id = k.user_id
           ORDER BY CASE k.status WHEN 'in-review' THEN 0 ELSE 1 END, k.submitted_at DESC`
        )
        .all()
        .map(toKyc),
    countCertifiedAgents: (): number =>
      (
        db
          .prepare(
            `SELECT COUNT(*) AS n FROM agent_kyc k JOIN users u ON u.id = k.user_id WHERE k.status = 'certified' AND u.active = 1`
          )
          .get() as Row
      ).n,
    saveKyc: (k: KycRecord) =>
      db
        .prepare(
          `INSERT INTO agent_kyc (user_id, full_name, agency_name, license_id, city, momo_number, document_name, document_path, document_mime,
             status, badge_id, submitted_at, reviewed_at, review_note)
           VALUES (@userId, @fullName, @agencyName, @licenseId, @city, @momoNumber, @documentName, @documentPath, @documentMime,
             @status, @badgeId, @submittedAt, @reviewedAt, @reviewNote)
           ON CONFLICT(user_id) DO UPDATE SET full_name = excluded.full_name, agency_name = excluded.agency_name,
             license_id = excluded.license_id, city = excluded.city, momo_number = excluded.momo_number,
             document_name = excluded.document_name, document_path = excluded.document_path, document_mime = excluded.document_mime,
             status = excluded.status, badge_id = excluded.badge_id, submitted_at = excluded.submitted_at,
             reviewed_at = excluded.reviewed_at, review_note = excluded.review_note`
        )
        .run({
          userId: k.userId,
          fullName: k.fullName,
          agencyName: k.agencyName,
          licenseId: k.licenseId,
          city: k.city,
          momoNumber: k.momoNumber,
          documentName: k.documentName ?? null,
          documentPath: k.documentPath ?? null,
          documentMime: k.documentMime ?? null,
          status: k.status,
          badgeId: k.badgeId ?? null,
          submittedAt: k.submittedAt ?? null,
          reviewedAt: k.reviewedAt ?? null,
          reviewNote: k.reviewNote ?? null
        })
  };
}

export type Repository = ReturnType<typeof openDatabase>;
