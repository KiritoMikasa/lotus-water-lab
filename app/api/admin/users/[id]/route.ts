import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){ const u=await getCurrentUser(); if(u?.role!=='admin')return NextResponse.json({error:'Forbidden'},{status:403}); const {id}=await params; const b=await req.json(); if(b.password) db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(bcrypt.hashSync(String(b.password),12),Number(id)); if(b.displayName)db.prepare('UPDATE users SET display_name=? WHERE id=?').run(String(b.displayName),Number(id)); if(b.enabled!==undefined)db.prepare('UPDATE users SET enabled=? WHERE id=?').run(b.enabled?1:0,Number(id)); return NextResponse.json({ok:true}); }
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){ const u=await getCurrentUser(); if(u?.role!=='admin')return NextResponse.json({error:'Forbidden'},{status:403}); const {id}=await params; if(Number(id)===u.id)return NextResponse.json({error:'Cannot delete yourself'},{status:400}); db.prepare('DELETE FROM users WHERE id=?').run(Number(id)); return NextResponse.json({ok:true}); }
