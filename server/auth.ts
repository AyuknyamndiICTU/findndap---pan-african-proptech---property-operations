import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import type { Repository, UserRecord } from './db.js';
import type { AuthUser, UserRole } from '../src/types.js';
import { newId } from './validation.js';
import { fail } from './http.js';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 8;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [alg, saltHex, hashHex] = stored.split('$');
  if (alg !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(actual, expected);
}

// Used when the username doesn't exist, so failed logins take the same time either way.
const DUMMY_HASH = hashPassword(randomBytes(16).toString('hex'));

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const toAuthUser = (u: UserRecord): AuthUser => ({ id: u.id, username: u.username, role: u.role });

/**
 * Creates/updates accounts from the environment on every start, so .env is the source of truth:
 *   ADMIN_USERNAME / ADMIN_PASSWORD    – the landlord/admin account
 *   AGENT_ACCOUNTS="user1:pass1,user2:pass2" – agent accounts (passwords may not contain commas)
 * Accounts removed from .env are deactivated and their sessions revoked.
 */
export function syncAccountsFromEnv(repo: Repository, env: NodeJS.ProcessEnv = process.env): string[] {
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

  const valid = accounts.filter((a) => {
    if (!/^[A-Za-z0-9._-]{3,32}$/.test(a.username)) {
      warnings.push(`Ignoring account "${a.username}": usernames must be 3-32 letters, digits, dots, dashes or underscores.`);
      return false;
    }
    if (a.password.length < MIN_PASSWORD_LENGTH) {
      warnings.push(`Ignoring account "${a.username}": password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return false;
    }
    return true;
  });

  repo.transaction(() => {
    for (const a of valid) {
      const existing = repo.findUserByUsername(a.username);
      // Keep the stored hash (and its salt) when the password hasn't changed.
      const passwordHash =
        existing && existing.role === a.role && verifyPassword(a.password, existing.passwordHash)
          ? existing.passwordHash
          : hashPassword(a.password);
      repo.upsertUser({ id: existing?.id ?? newId('usr'), username: a.username, role: a.role, passwordHash });
    }
    repo.deactivateUsersExcept(valid.map((a) => a.username));
    repo.deleteExpiredSessions();
  });

  return warnings;
}

export function login(repo: Repository, username: string, password: string) {
  const user = repo.findUserByUsername(username);
  const ok = verifyPassword(password, user?.passwordHash ?? DUMMY_HASH) && !!user?.active;
  if (!ok || !user) return null;

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  repo.insertSession(hashToken(token), user.id, expiresAt);
  return { token, expiresAt, user: toAuthUser(user) };
}

export function logout(repo: Repository, token: string) {
  repo.deleteSession(hashToken(token));
}

function bearerToken(req: Request): string | null {
  const header = req.get('Authorization') || '';
  const match = /^Bearer\s+([a-f0-9]{64})$/i.exec(header.trim());
  return match ? match[1] : null;
}

/** Attaches res.locals.user and res.locals.token when a valid session token is presented. */
export function authenticate(repo: Repository) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = bearerToken(req);
    if (token) {
      const session = repo.findSession(hashToken(token));
      if (session && session.expiresAt > new Date().toISOString()) {
        const user = repo.getUser(session.userId);
        if (user?.active) {
          res.locals.user = toAuthUser(user);
          res.locals.token = token;
        }
      }
    }
    next();
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

/** Allows 5 failed attempts per IP+username per 15 minutes. */
export function createLoginLimiter(maxFailures = 5, windowMs = 15 * 60 * 1000) {
  const failures = new Map<string, { count: number; resetAt: number }>();
  const key = (ip: string, username: string) => `${ip}|${username.toLowerCase()}`;
  return {
    retryAfterSeconds(ip: string, username: string): number {
      const entry = failures.get(key(ip, username));
      if (!entry || entry.resetAt < Date.now()) return 0;
      return entry.count >= maxFailures ? Math.ceil((entry.resetAt - Date.now()) / 1000) : 0;
    },
    recordFailure(ip: string, username: string) {
      const k = key(ip, username);
      const entry = failures.get(k);
      if (!entry || entry.resetAt < Date.now()) failures.set(k, { count: 1, resetAt: Date.now() + windowMs });
      else entry.count += 1;
    },
    reset(ip: string, username: string) {
      failures.delete(key(ip, username));
    }
  };
}
