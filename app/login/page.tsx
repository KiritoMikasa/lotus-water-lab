'use client';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('guest@lotus.dvsncloud.com');
  const [password, setPassword] = useState('guest');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json();
    if (!r.ok) {
      setError(j.error || 'Login failed');
      setBusy(false);
      return;
    }
    location.href = '/';
  }

  return (
    <main className="login-split">
      <section className="login-title">
        <h1 className="login-headline">
          Every cup<br />starts as water.
        </h1>
        <p className="wordmark">Lotus</p>
      </section>
      <section className="login-form-panel">
        <form onSubmit={submit}>
          <label>
            Email
            <input value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          </label>
          <p className="footnote">demo account, pre-filled</p>
          {error && <p className="form-error">{error}</p>}
          <button className="btn full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </section>
    </main>
  );
}
