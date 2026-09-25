import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import db from './db';

export type User = { id: number; email: string; role: 'admin'|'user'|'guest'; display_name: string; enabled: number };
const COOKIE = 'lotus_session';
const guestTtl = Number(process.env.GUEST_TTL_HOURS || 6) * 60 * 60 * 1000;

export function purgeExpired() {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
  const guest = db.prepare("SELECT id FROM users WHERE role='guest'").get() as {id:number}|undefined;
  if (guest) {
    db.prepare('DELETE FROM profiles WHERE user_id=? AND created_at < datetime(\'now\', ? || \' seconds\')').run(guest.id, `-${guestTtl/1000}`);
    db.prepare('DELETE FROM experiments WHERE user_id=? AND created_at < datetime(\'now\', ? || \' seconds\')').run(guest.id, `-${guestTtl/1000}`);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  purgeExpired();
  const c = await cookies();
  const sid = c.get(COOKIE)?.value;
  if (!sid) return null;
  const row = db.prepare(`SELECT u.id,u.email,u.role,u.display_name,u.enabled,s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=?`).get(sid) as (User & {expires_at:number})|undefined;
  if (!row || !row.enabled || row.expires_at < Date.now()) return null;
  return row;
}

export async function createSession(userId: number, role: User['role']) {
  const id = crypto.randomBytes(32).toString('hex');
  const ttl = role === 'guest' ? guestTtl : 7 * 24 * 60 * 60 * 1000;
  db.prepare('INSERT INTO sessions (id,user_id,expires_at,created_at) VALUES (?,?,?,?)').run(id,userId,Date.now()+ttl,Date.now());
  const c = await cookies();
  c.set(COOKIE,id,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:Math.floor(ttl/1000)});
}

export async function clearSession() {
  const c = await cookies(); const sid = c.get(COOKIE)?.value;
  if (sid) db.prepare('DELETE FROM sessions WHERE id=?').run(sid);
  c.delete(COOKIE);
}
