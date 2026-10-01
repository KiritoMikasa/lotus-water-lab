'use client';
import { useState } from 'react';
import type { Minerals } from '@/lib/chemistry';
import type { Profile } from './WaterLab';

type Preset = { name: string; drops: Minerals; note: string };

type Props = {
  profiles: Profile[];
  presets: Preset[];
  onLoad: (p: { name: string; drops: Minerals; note: string; ro_tds?: number; id?: number }) => void;
  onDelete: (id: number) => void;
};

export default function ProfilesTab({ profiles, presets, onLoad, onDelete }: Props) {
  return (
    <section>
      <h2 className="section-heading">The five starting points</h2>
      <div className="index-list">
        {presets.map(p => (
          <IndexRow
            key={p.name}
            kind="STARTER"
            name={p.name}
            note={p.note}
            drops={p.drops}
            onClick={() => onLoad({ ...p, id: 0, ro_tds: 12 })}
          />
        ))}
      </div>
      <hr className="hairline" style={{ margin: '48px 0' }} />
      <h2 className="section-heading">Your recipes</h2>
      {profiles.length === 0 ? (
        <p className="narrative empty-line">Save your first mix from the builder.</p>
      ) : (
        <div className="index-list saved-list">
          {profiles.map(p => (
            <IndexRow
              key={p.id}
              kind="SAVED"
              name={p.name}
              note={p.note}
              drops={p.drops}
              onClick={() => onLoad(p)}
              onDelete={() => onDelete(p.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function IndexRow({
  kind, name, note, drops, onClick, onDelete,
}: {
  kind: 'STARTER' | 'SAVED';
  name: string;
  note: string;
  drops: Minerals;
  onClick: () => void;
  onDelete?: () => void;
}) {
  const [flash, setFlash] = useState(false);
  function handleLoad() {
    setFlash(true);
    setTimeout(() => { setFlash(false); onClick(); }, 400);
  }
  return (
    <div className={flash ? 'index-row flash' : 'index-row'}>
      <span className={kind === 'SAVED' ? 'edge-tab saved' : 'edge-tab'} />
      <span className="row-kind">{kind}</span>
      <button className="row-body" onClick={handleLoad} style={{ textAlign: 'left', background: 'none', border: 0, cursor: 'pointer' }}>
        <p className="row-name">{name}</p>
        <p className="row-note">{note || 'No note yet.'}</p>
      </button>
      <span className="row-stats">{drops.mg} Mg · {drops.ca} Ca · {drops.k} K · {drops.na} Na</span>
      {onDelete && <button className="row-remove text-link" onClick={onDelete}>remove</button>}
    </div>
  );
}
