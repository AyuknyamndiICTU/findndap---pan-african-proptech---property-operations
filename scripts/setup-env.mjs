// Creates .env from .env.example with freshly generated secrets.
// Usage: npm run setup            (refuses to overwrite an existing .env)
//        npm run setup -- --force (replaces it)
import { randomBytes } from 'crypto';
import fs from 'fs';

const force = process.argv.includes('--force');
if (fs.existsSync('.env') && !force) {
  console.log('.env already exists; nothing changed. Run "npm run setup -- --force" to regenerate it.');
  process.exit(0);
}

const adminPassword = randomBytes(12).toString('base64url');
const webhookSecret = randomBytes(32).toString('hex');

const set = (text, key, value) => text.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}="${value}"`);

let env = fs.readFileSync('.env.example', 'utf8');
env = set(env, 'ADMIN_PASSWORD', adminPassword);
env = set(env, 'MOMO_WEBHOOK_SECRET', webhookSecret);
fs.writeFileSync('.env', env, { mode: 0o600 });

const adminUser = /^ADMIN_USERNAME="?([^"\r\n]*)"?/m.exec(env)?.[1] || 'admin';
console.log('Created .env with new secrets.');
console.log(`  Admin username: ${adminUser}`);
console.log(`  Admin password: ${adminPassword}   (shown once - store it somewhere safe)`);
console.log('Add agent accounts to AGENT_ACCOUNTS in .env, then run "npm run dev".');
