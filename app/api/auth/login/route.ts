import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { createSession } from '@/lib/auth';
export async function POST(req: Request){
  const {email,password}=await req.json();
  const user=db.prepare('SELECT * FROM users WHERE lower(email)=lower(?)').get(String(email||'')) as any;
  if(!user || !user.enabled || !(await bcrypt.compare(String(password||''),user.password_hash))) return NextResponse.json({error:'Invalid email or password'},{status:401});
  db.prepare('UPDATE users SET last_login_at=CURRENT_TIMESTAMP WHERE id=?').run(user.id);
  if(user.role==='guest') { db.prepare('DELETE FROM profiles WHERE user_id=?').run(user.id); db.prepare('DELETE FROM experiments WHERE user_id=?').run(user.id); }
  await createSession(user.id,user.role);
  return NextResponse.json({user:{id:user.id,email:user.email,role:user.role,display_name:user.display_name}});
}
