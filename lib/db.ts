import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'data');
fs.mkdirSync(dir, { recursive: true });
const db = new Database(path.join(dir, 'lotus.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 email TEXT UNIQUE NOT NULL,
 password_hash TEXT NOT NULL,
 role TEXT NOT NULL DEFAULT 'user',
 display_name TEXT NOT NULL,
 enabled INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 last_login_at TEXT
);
CREATE TABLE IF NOT EXISTS sessions (
 id TEXT PRIMARY KEY,
 user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL,
 created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS profiles (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 name TEXT NOT NULL,
 drops_json TEXT NOT NULL,
 ro_tds REAL NOT NULL DEFAULT 12,
 note TEXT DEFAULT '',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS experiments (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title TEXT NOT NULL,
 beans TEXT DEFAULT '',
 brew_method TEXT DEFAULT 'Filter',
 water_drops_json TEXT NOT NULL,
 ro_tds REAL NOT NULL DEFAULT 12,
 rating INTEGER,
 notes TEXT DEFAULT '',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

function env(name: string, fallback?: string) { return process.env[name] || fallback; }
const adminEmail = (env('ADMIN_EMAIL', 'admin@lotus.dvsncloud.com')!).toLowerCase();
const guestEmail = (env('GUEST_EMAIL', 'guest@lotus.dvsncloud.com')!).toLowerCase();
const guestPassword = env('GUEST_PASSWORD', 'guest')!;

if (process.env.NEXT_PHASE !== 'phase-production-build') {
  try {
    const existingAdmin = db.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").get() as {id:number}|undefined;
    let adminPassword = process.env.ADMIN_PASSWORD;
    if (!existingAdmin) {
      if (!adminPassword) {
        adminPassword = crypto.randomBytes(12).toString('base64url');
        console.warn(`\n[Lotus Water Lab] Generated first-run admin password: ${adminPassword}\nSet ADMIN_PASSWORD in .env and restart to use your own password.\n`);
      }
      db.prepare('INSERT OR IGNORE INTO users(email,password_hash,role,display_name) VALUES(?,?,?,?)').run(adminEmail,bcrypt.hashSync(adminPassword,12),'admin','Administrator');
    } else if (adminPassword) {
      // Sync admin credentials from .env whenever ADMIN_PASSWORD is set
      db.prepare('UPDATE users SET email=?, password_hash=? WHERE id=?').run(adminEmail, bcrypt.hashSync(adminPassword, 12), existingAdmin.id);
    }

    const existingGuest = db.prepare("SELECT id FROM users WHERE role='guest' LIMIT 1").get() as {id:number}|undefined;
    if (!existingGuest) {
      db.prepare('INSERT OR IGNORE INTO users(email,password_hash,role,display_name) VALUES(?,?,?,?)').run(guestEmail,bcrypt.hashSync(guestPassword,12),'guest','Demo Guest');
    } else if (process.env.GUEST_PASSWORD || process.env.GUEST_EMAIL) {
      db.prepare('UPDATE users SET email=?, password_hash=? WHERE id=?').run(guestEmail, bcrypt.hashSync(guestPassword, 12), existingGuest.id);
    }
  } catch {
    // Ignore race conditions during parallel worker initialization
  }
}

export default db;
