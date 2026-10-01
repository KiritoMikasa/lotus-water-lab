'use client';
import { useEffect, useRef, useState } from 'react';
import type { Minerals, calculate } from '@/lib/chemistry';
import { labels, fmt, type ExpDraft } from './WaterLab';

type Result = ReturnType<typeof calculate>;

type Props = {
  drops: Minerals;
  setDrop: (k: keyof Minerals, v: number) => void;
  roTds: number;
  setRoTds: (v: number) => void;
  liters: number;
  setLiters: (v: number) => void;
  result: Result;
  profileName: string;
  setProfileName: (v: string) => void;
  profileNote: string;
  setProfileNote: (v: string) => void;
  saveProfile: () => void;
  exp: ExpDraft;
  setExp: (v: ExpDraft) => void;
  saveExperiment: () => void;
};

const DEFAULT_DROPS: Minerals = { mg: 6, ca: 3, k: 2, na: 1 };
const TICKS = [30, 25, 20, 15, 10, 5, 0];

export default function Builder(p: Props) {
  const totalDrops = p.drops.mg + p.drops.ca + p.drops.k + p.drops.na;
  const pct = Math.round((totalDrops / 12) * 100);

  function applyIntensity(v: number) {
    const f = v / 100;
    p.setDrop('mg', Math.round(DEFAULT_DROPS.mg * f));
    p.setDrop('ca', Math.round(DEFAULT_DROPS.ca * f));
    p.setDrop('k', Math.round(DEFAULT_DROPS.k * f));
    p.setDrop('na', Math.round(DEFAULT_DROPS.na * f));
  }

  function reset() {
    p.setDrop('mg', DEFAULT_DROPS.mg);
    p.setDrop('ca', DEFAULT_DROPS.ca);
    p.setDrop('k', DEFAULT_DROPS.k);
    p.setDrop('na', DEFAULT_DROPS.na);
  }

  return (
    <section>
      <span className="eyebrow">LIVE MIX</span>
      <h2 className="section-heading">Dial in your water</h2>
      <p className="narrative">Everything is calculated for {p.liters.toFixed(1)} L of RO water.</p>

      <div className="rack-wrap">
        <div className="rack-block">
          <div className="tube-labels-row">
            {labels.map(x => (
              <div className="tube-label-cell" key={x.key}>
                <span className="ion-symbol">{ionSymbol(x.key)}</span>
                <span className="drop-count">{p.drops[x.key]}</span>
              </div>
            ))}
          </div>
          <div className="cylinder-rack">
            <div className="rack-ticks" />
            <div className="rack-tick-labels">
              {TICKS.map(t => <span key={t}>{t}</span>)}
            </div>
            {labels.map(x => (
              <Tube key={x.key} name={x.label} value={p.drops[x.key]} onChange={v => p.setDrop(x.key, v)} />
            ))}
          </div>
        </div>
        <aside className="annotation-col">
          <div className="annotation-group">
            <AnnotationLine label="Hardness" value={p.result.hardness} unit="ppm as CaCO₃" />
            <AnnotationLine label="Alkalinity" value={p.result.alkalinity} unit="ppm as CaCO₃" />
            <AnnotationLine label="HCO₃" value={p.result.hco3} unit="mg/L" />
          </div>
          <hr className="hairline" />
          <div className="annotation-group">
            {labels.map(x => (
              <AnnotationLine key={x.key} label={`${x.label} (${x.formula})`} value={p.result[x.key]} unit="ppm" />
            ))}
            <AnnotationLine label="Estimated TDS" value={p.result.estimatedTds} unit="ppm" />
          </div>
        </aside>
      </div>

      <div className="calibration-strip">
        <label>RO baseline <input type="number" min="0" max="100" step="1" value={p.roTds} onChange={e => p.setRoTds(Number(e.target.value) || 0)} /> ppm</label>
        <label>Batch <select value={p.liters} onChange={e => p.setLiters(Number(e.target.value))}>
          <option value="0.5">0.5 L</option>
          <option value="1">1.0 L</option>
          <option value="1.5">1.5 L</option>
          <option value="2">2.0 L</option>
        </select></label>
        <label>Intensity <input type="range" min="0" max="200" value={pct} onChange={e => applyIntensity(Number(e.target.value))} /> {pct}%</label>
        <button className="text-link" onClick={reset}>Reset</button>
      </div>

      <span className="eyebrow" style={{ marginTop: 'var(--space-16)', display: 'block' }}>SAVE THIS MIX</span>
      <hr className="hairline" />
      <div className="form-row">
        <input value={p.profileName} onChange={e => p.setProfileName(e.target.value)} placeholder="Profile name" />
        <input value={p.profileNote} onChange={e => p.setProfileNote(e.target.value)} placeholder="Short note (optional)" />
      </div>
      <button className="btn" style={{ marginTop: 'var(--space-4)' }} onClick={p.saveProfile}>Save profile</button>

      <span className="eyebrow" style={{ marginTop: 'var(--space-16)', display: 'block' }}>LOG THIS BREW</span>
      <hr className="hairline" />
      <div className="form-row">
        <input value={p.exp.title} onChange={e => p.setExp({ ...p.exp, title: e.target.value })} placeholder="Brew title" />
        <input value={p.exp.beans} onChange={e => p.setExp({ ...p.exp, beans: e.target.value })} placeholder="Beans / roaster" />
        <select value={p.exp.brewMethod} onChange={e => p.setExp({ ...p.exp, brewMethod: e.target.value })}>
          <option>Filter</option>
          <option>V60</option>
          <option>French Press</option>
          <option>AeroPress</option>
          <option>Cold brew</option>
          <option>Tea</option>
          <option>Other</option>
        </select>
        <select value={p.exp.rating} onChange={e => p.setExp({ ...p.exp, rating: Number(e.target.value) })}>
          <option value="5">★★★★★ Loved it</option>
          <option value="4">★★★★ Great</option>
          <option value="3">★★★ Okay</option>
          <option value="2">★★ Needs work</option>
          <option value="1">★ Nope</option>
        </select>
      </div>
      <textarea style={{ marginTop: 'var(--space-3)' }} value={p.exp.notes} onChange={e => p.setExp({ ...p.exp, notes: e.target.value })} placeholder="What changed in the cup? sweetness, acidity, body…" />
      <button className="btn" style={{ marginTop: 'var(--space-4)' }} onClick={p.saveExperiment}>Log brew</button>

      <p className="narrative science-note" style={{ marginTop: 'var(--space-16)' }}>
        Ion concentrations are calculated from your four stated 50 ml stock recipes and 20 drops/ml. RO TDS is treated as a separate baseline because TDS alone cannot reveal its mineral composition. Hardness is expressed as CaCO₃. Alkalinity comes from the bicarbonate stocks.
      </p>
    </section>
  );
}

function ionSymbol(key: keyof Minerals) {
  return { mg: 'Mg', ca: 'Ca', k: 'K', na: 'Na' }[key];
}

function Tube({ name, value, onChange }: { name: string; value: number; onChange: (v: number) => void }) {
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowRight')) { e.preventDefault(); onChange(Math.min(30, value + 5)); }
    else if (e.shiftKey && (e.key === 'ArrowDown' || e.key === 'ArrowLeft')) { e.preventDefault(); onChange(Math.max(0, value - 5)); }
  }
  return (
    <div className="tube">
      {value > 0 && (
        <div className="tube-fill" style={{ height: `${(value / 30) * 100}%` }}>
          <div className="meniscus" />
        </div>
      )}
      <input
        className="tube-range"
        type="range"
        min="0"
        max="30"
        value={value}
        aria-label={`${name} drops, currently ${value} of 30`}
        onChange={e => onChange(Number(e.target.value))}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}

function AnnotationLine({ label, value, unit }: { label: string; value: number; unit: string }) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 300);
      return () => clearTimeout(t);
    }
  }, [value]);
  return (
    <div className="annotation-line">
      <span className="annot-label">{label}</span>
      <span className={flash ? 'annot-value flash' : 'annot-value'}>{fmt(value)} {unit}</span>
    </div>
  );
}
