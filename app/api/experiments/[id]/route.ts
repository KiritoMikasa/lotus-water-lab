import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){ const u=await getCurrentUser(); if(!u)return NextResponse.json({error:'Unauthorized'},{status:401}); const {id}=await params; db.prepare('DELETE FROM experiments WHERE id=? AND user_id=?').run(Number(id),u.id); return NextResponse.json({ok:true}); }
