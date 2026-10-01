'use client';
import { useEffect, useState } from 'react';

type U = { id: number; email: string; role: string; display_name: string; enabled: number; created_at: string; last_login_at: string | null };
type Me = { id: number; email: string; role: string; display_name: string } | null;

export default function Admin() {
  const [users, setUsers] = useState<U[]>([]);
  const [me, setMe] = useState<Me | undefined>(undefined);
  const [form, setForm] = useState({ email: '', password: '', displayName: '', role: 'user' });
  const [msg, setMsg] = useState('');

  async function load() {
    const m = await fetch('/api/me').then(r => r.json());
    setMe(m.user);
    if (m.user?.role === 'admin') setUsers((await fetch('/api/admin/users').then(r => r.json())).users || []);
  }
  useEffect(() => { load(); }, []);

  if (me === undefined) return <main className="center"><p className="loading-line">Loading…</p></main>;
  if (me?.role !== 'admin') return <main className="center"><p className="narrative">Admin only. <a href="/" className="text-link">← Lab</a></p></main>;

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch('/api/admin/users', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
    const j = await r.json();
    setMsg(r.ok ? 'User created' : j.error || 'Error');
    if (r.ok) { setForm({ email: '', password: '', displayName: '', role: 'user' }); load(); }
  }
  async function toggle(id: number) { await fetch(`/api/admin/users/${id}/toggle`, { method: 'POST' }); load(); }
  async function del(id: number) { if (confirm('Delete this user and all their data?')) { await fetch(`/api/admin/users/${id}`, { method: 'DELETE' }); load(); } }

  return (
    <main className="admin-page">
      <a href="/" className="text-link back-link">← Lab</a>
      <h2 className="section-heading">Accounts</h2>
      <p className="narrative">Create a user, or enable, disable, and remove existing ones.</p>

      <form onSubmit={create} className="stacked-form">
        <label>Display name<input value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} /></label>
        <label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label>
        <label>Role<select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          <option value="user">User</option>
          <option value="guest">Guest</option>
        </select></label>
        <button className="btn">Create account</button>
        {msg && <p className="footnote">{msg}</p>}
      </form>

      <hr className="hairline" style={{ margin: '32px 0' }} />

      <div className="account-list">
        {users.map(u => (
          <div className="account-row" key={u.id}>
            <span className="account-name">{u.display_name}</span>
            <span className="account-meta">{u.email} · {u.role}</span>
            <span className="account-status">{u.enabled ? 'active' : 'disabled'}</span>
            <button className="text-link" onClick={() => toggle(u.id)}>{u.enabled ? 'disable' : 'enable'}</button>
            {u.role !== 'admin' && <button className="text-link alert-text" onClick={() => del(u.id)}>delete</button>}
          </div>
        ))}
      </div>
    </main>
  );
}
