export default function RunningHead({ name, guest, onSignOut }: { name: string; guest: boolean; onSignOut: () => void }) {
  return (
    <p className="running-head">
      Lotus — {name} · <button onClick={onSignOut} className="text-link">sign out</button>
      {guest && <span className="footnote-inline"> · demo, clears automatically</span>}
    </p>
  );
}
