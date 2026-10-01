'use client';
import { useEffect, useMemo, useState } from 'react';
import { calculate, STARTER_PROFILES, type Minerals } from '@/lib/chemistry';
import RunningHead from './RunningHead';
import TabRail from './TabRail';
import Builder from './Builder';
import ProfilesTab from './ProfilesTab';
import JournalTab from './JournalTab';

export type CurrentUser = { id: number; email: string; role: 'admin' | 'user' | 'guest'; display_name: string };
export type Profile = { id: number; name: string; drops: Minerals; ro_tds: number; note: string };
export type Experiment = {
  id: number;
  title: string;
  beans: string;
  brew_method: string;
  drops: Minerals;
  ro_tds: number;
  rating: number | null;
  notes: string;
  created_at: string;
};
export type ExpDraft = { title: string; beans: string; brewMethod: string; rating: number; notes: string };
export type Tab = 'lab' | 'profiles' | 'experiments';

export const labels: { key: keyof Minerals; label: string; formula: string; desc: string }[] = [
  { key: 'mg', label: 'Magnesium', formula: 'MgCl₂·6H₂O', desc: 'body / complexity' },
  { key: 'ca', label: 'Calcium', formula: 'CaCl₂·2H₂O', desc: 'structure / clarity' },
  { key: 'k', label: 'Potassium', formula: 'KHCO₃', desc: 'buffer / acidity' },
  { key: 'na', label: 'Sodium', formula: 'NaHCO₃', desc: 'buffer / balance' },
];

export function fmt(n: number) {
  return Number.isFinite(n) ? (Math.round(n * 10) / 10).toFixed(1) : '0.0';
}

export default function WaterLab() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [drops, setDrops] = useState<Minerals>({ mg: 6, ca: 3, k: 2, na: 1 });
  const [roTds, setRoTds] = useState(12);
  const [liters, setLiters] = useState(1);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [tab, setTab] = useState<Tab>('lab');
  const [toast, setToast] = useState('');
  const [profileName, setProfileName] = useState('My profile');
  const [profileNote, setProfileNote] = useState('');
  const [exp, setExp] = useState<ExpDraft>({ title: 'New brew', beans: '', brewMethod: 'Filter', rating: 5, notes: '' });

  const result = useMemo(() => calculate(drops, liters, roTds), [drops, liters, roTds]);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(j => {
      if (!j.user) { location.href = '/login'; return; }
      setUser(j.user);
      load();
    });
  }, []);

  async function load() {
    const [p, e] = await Promise.all([fetch('/api/profiles'), fetch('/api/experiments')]);
    if (p.ok) setProfiles((await p.json()).profiles);
    if (e.ok) setExperiments((await e.json()).experiments);
  }

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 2600);
      return () => clearTimeout(t);
    }
  }, [toast]);

  function setDrop(k: keyof Minerals, v: number) {
    setDrops(d => ({ ...d, [k]: Math.max(0, Math.round(v)) }));
  }

  function loadPreset(p: { name: string; drops: Minerals; note: string; ro_tds?: number }) {
    setDrops({ ...p.drops });
    setProfileName(p.name);
    setProfileNote(p.note);
    if (p.ro_tds !== undefined) setRoTds(p.ro_tds);
    setTab('lab');
  }

  async function saveProfile() {
    const r = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: profileName, drops, roTds, note: profileNote }),
    });
    const j = await r.json();
    if (r.ok) { setToast('Profile saved'); load(); } else setToast(j.error || 'Could not save');
  }

  async function deleteProfile(id: number) {
    await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
    load();
    setToast('Profile deleted');
  }

  async function saveExperiment() {
    const r = await fetch('/api/experiments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: exp.title, beans: exp.beans, brewMethod: exp.brewMethod, drops, roTds, rating: exp.rating, notes: exp.notes }),
    });
    const j = await r.json();
    if (r.ok) { setToast('Experiment logged'); load(); setExp({ ...exp, title: 'New brew', notes: '' }); } else setToast(j.error || 'Could not save');
  }

  async function deleteExperiment(id: number) {
    await fetch(`/api/experiments/${id}`, { method: 'DELETE' });
    load();
    setToast('Entry deleted');
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    location.href = '/login';
  }

  if (!user) return <main className="center"><p className="loading-line">Loading…</p></main>;
  const guest = user.role === 'guest';

  return (
    <div className="app-root">
      <RunningHead name={user.display_name} guest={guest} onSignOut={logout} />
      <TabRail
        tab={tab}
        onSelect={setTab}
        counts={{ profiles: profiles.length, experiments: experiments.length }}
        isAdmin={user.role === 'admin'}
      />
      <main className="content-col">
        {tab === 'lab' && (
          <Builder
            drops={drops}
            setDrop={setDrop}
            roTds={roTds}
            setRoTds={setRoTds}
            liters={liters}
            setLiters={setLiters}
            result={result}
            profileName={profileName}
            setProfileName={setProfileName}
            profileNote={profileNote}
            setProfileNote={setProfileNote}
            saveProfile={saveProfile}
            exp={exp}
            setExp={setExp}
            saveExperiment={saveExperiment}
          />
        )}
        {tab === 'profiles' && (
          <ProfilesTab profiles={profiles} presets={STARTER_PROFILES} onLoad={loadPreset} onDelete={deleteProfile} />
        )}
        {tab === 'experiments' && (
          <JournalTab experiments={experiments} onDelete={deleteExperiment} />
        )}
      </main>
      {toast && <p className="toast-line">{toast}</p>}
    </div>
  );
}
