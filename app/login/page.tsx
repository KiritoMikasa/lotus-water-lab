'use client';
import { useState } from 'react';
import { Droplets, FlaskConical, ShieldCheck } from 'lucide-react';
export default function Login(){
 const [email,setEmail]=useState('guest@lotus.dvsncloud.com'); const [password,setPassword]=useState('guest'); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');const r=await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})});const j=await r.json();if(!r.ok){setError(j.error||'Login failed');setBusy(false);return}location.href='/';}
 return <main className="login-page"><div className="login-card"><div className="brand"><span className="brand-mark"><Droplets size={24}/></span><div><b>Lotus Water Lab</b><small>Build · brew · remember</small></div></div><h1>Welcome back.</h1><p className="muted">Tune your water one drop at a time.</p><form onSubmit={submit}><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label>{error&&<div className="error">{error}</div>}<button className="primary full" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form><div className="login-hints"><span><FlaskConical size={15}/> Demo access is disposable</span><span><ShieldCheck size={15}/> Admin tools are protected</span></div></div></main>
}
