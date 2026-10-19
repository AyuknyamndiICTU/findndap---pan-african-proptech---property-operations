import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import type { Repository, UserRecord } from './db.js';
import type { AuthUser, UserRole } from '../src/types.js';
import { newId } from './validation.js';
import { fail } from './http.js';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 8;
const LOGIN_MAX_FAILURES = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function scrypt(password: string, salt: Buffer, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, keylen, (err, key) => (err ? reject(err) : resolve(key)))
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [alg, saltHex, hashHex] = stored.split('$');
  if (alg !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(actual, expected);
}

// Compared against when the username doesn't exist, so failed logins take the same time either way.
let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= hashPassword(randomBytes(16).toString('hex')));

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const toAuthUser = (u: UserRecord): AuthUser => ({ id: u.id, username: u.username, role: u.role });

/**
 * Creates/updates accounts from the environment, so .env (or the Vercel project's
 * environment variables) is the source of truth:
 *   ADMIN_USERNAME / ADMIN_PASSWORD          – the landlord/admin account
 *   AGENT_ACCOUNTS="user1:pass1,user2:pass2" – agent accounts (passwords may not contain commas)
 * Accounts removed from the environment are deactivated and their sessions revoked.
 * Must run inside a transaction holding the init lock (see server/app.ts).
 */
export async function syncAccountsFromEnv(repo: Repository, env: NodeJS.ProcessEnv = process.env): Promise<string[]> {
  const warnings: string[] = [];
  const accounts: { username: string; password: string; role: UserRole }[] = [];

  const adminUser = (env.ADMIN_USERNAME || 'admin').trim();
  if (env.ADMIN_PASSWORD) {
    accounts.push({ username: adminUser, password: env.ADMIN_PASSWORD, role: 'admin' });
  } else {
    warnings.push('ADMIN_PASSWORD is not set: no admin account exists, so console changes and agent approvals are impossible.');
  }

  for (const entry of (env.AGENT_ACCOUNTS || '').split(',').map((e) => e.trim()).filter(Boolean)) {
    const sep = entry.indexOf(':');
    if (sep <= 0) {
      warnings.push(`Ignoring malformed AGENT_ACCOUNTS entry "${entry.slice(0, 20)}" (expected username:password).`);
      continue;
    }
    accounts.push({ username: entry.slice(0, sep).trim(), password: entry.slice(sep + 1), role: 'agent' });
  }

  const seen = new Set<string>();
  const valid = accounts.filter((a) => {
    if (!/^[A-Za-z0-9._-]{3,32}$/.test(a.username)) {
      warnings.push(`Ignoring account "${a.username}": usernames must be 3-32 letters, digits, dots, dashes or underscores.`);
      return false;
    }
    if (a.password.length < MIN_PASSWORD_LENGTH) {
      warnings.push(`Ignoring account "${a.username}": password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return false;
    }
    if (seen.has(a.username.toLowerCase())) {
      warnings.push(`Ignoring duplicate account "${a.username}".`);
      return false;
    }
    seen.add(a.username.toLowerCase());
    return true;
  });

  for (const a of valid) {
    const existing = await repo.findUserByUsername(a.username);
    // Keep the stored hash (and its salt) when nothing changed, so restarts don't rewrite every row.
    const unchanged =
      existing && existing.active && existing.role === a.role && (await verifyPassword(a.password, existing.passwordHash));
    if (unchanged) continue;
    await repo.upsertUser({
      id: existing?.id ?? newId('usr'),
      username: a.username,
      role: a.role,
      passwordHash: await hashPassword(a.password)
    });
  }
  await repo.deactivateUsersExcept(valid.map((a) => a.username));
  await repo.deleteExpired();

  return warnings;
}

export async function login(repo: Repository, username: string, password: string) {
  const user = await repo.findUserByUsername(username);
  const ok = (await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()))) && !!user?.active;
  if (!ok || !user) return null;

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  await repo.insertSession(hashToken(token), user.id, expiresAt);
  return { token, expiresAt, user: toAuthUser(user) };
}

export async function logout(repo: Repository, token: string): Promise<void> {
  await repo.deleteSession(hashToken(token));
}

function bearerToken(req: Request): string | null {
  const header = req.get('Authorization') || '';
  const match = /^Bearer\s+([a-f0-9]{64})$/i.exec(header.trim());
  return match ? match[1] : null;
}

/** Attaches res.locals.user and res.locals.token when a valid session token is presented. */
export function authenticate(getRepo: () => Promise<Repository>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = bearerToken(req);
      if (token) {
        const user = await (await getRepo()).findSessionUser(hashToken(token));
        if (user) {
          res.locals.user = toAuthUser(user);
          res.locals.token = token;
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user as AuthUser | undefined;
    if (!user) {
      return fail(req, res, 401, 'Sign in required', 'Connexion requise');
    }
    if (!roles.includes(user.role)) {
      const en = roles.map((r) => (r === 'admin' ? 'landlord/admin' : 'agent')).join(' or ');
      const fr = roles.map((r) => (r === 'admin' ? 'propriétaire/administrateur' : 'agent')).join(' ou ');
      return fail(req, res, 403, `This action requires a ${en} account`, `Cette action nécessite un compte ${fr}`);
    }
    next();
  };
}

/** Allows 5 failed attempts per IP+username per 15 minutes, tracked in the database. */
export const loginLimiter = {
  key: (ip: string, username: string) => createHash('sha256').update(`${ip}|${username.toLowerCase()}`).digest('hex'),

  async retryAfterSeconds(repo: Repository, key: string): Promise<number> {
    const entry = await repo.getLoginFailures(key);
    if (!entry) return 0;
    const remainingMs = Date.parse(entry.resetAt) - Date.now();
    return entry.count >= LOGIN_MAX_FAILURES && remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  },

  recordFailure: (repo: Repository, key: string) => repo.recordLoginFailure(key, LOGIN_WINDOW_MS),
  reset: (repo: Repository, key: string) => repo.clearLoginFailures(key)
};
