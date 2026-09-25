import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){ const u=await getCurrentUser(); if(u?.role!=='admin')return NextResponse.json({error:'Forbidden'},{status:403}); const {id}=await params; if(Number(id)===u.id)return NextResponse.json({error:'Cannot disable yourself'},{status:400}); db.prepare('UPDATE users SET enabled=1-enabled WHERE id=?').run(Number(id)); return NextResponse.json({ok:true}); }
