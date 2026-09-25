import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';
export async function GET(){ const u=await getCurrentUser(); if(u?.role!=='admin')return NextResponse.json({error:'Forbidden'},{status:403}); return NextResponse.json({users:db.prepare('SELECT id,email,role,display_name,enabled,created_at,last_login_at FROM users ORDER BY id').all()}); }
export async function POST(req:Request){ const u=await getCurrentUser(); if(u?.role!=='admin')return NextResponse.json({error:'Forbidden'},{status:403}); const b=await req.json(); if(!b.email||!b.password)return NextResponse.json({error:'Email and password required'},{status:400}); try{ const r=db.prepare('INSERT INTO users(email,password_hash,role,display_name) VALUES(?,?,?,?)').run(String(b.email).toLowerCase(),bcrypt.hashSync(String(b.password),12),b.role==='guest'?'guest':'user',String(b.displayName||b.email)); return NextResponse.json({id:r.lastInsertRowid}); }catch{return NextResponse.json({error:'Email already exists'},{status:409});} }
