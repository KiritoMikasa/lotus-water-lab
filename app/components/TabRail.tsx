import type { Tab } from './WaterLab';

type Props = {
  tab: Tab;
  onSelect: (t: Tab) => void;
  counts: { profiles: number; experiments: number };
  isAdmin: boolean;
};

export default function TabRail({ tab, onSelect, counts, isAdmin }: Props) {
  return (
    <nav className="tab-rail">
      <button
        className={tab === 'lab' ? 'tab-handle active' : 'tab-handle'}
        aria-current={tab === 'lab' ? 'page' : undefined}
        onClick={() => onSelect('lab')}
      >
        <span>Builder</span>
      </button>
      <button
        className={tab === 'profiles' ? 'tab-handle active' : 'tab-handle'}
        aria-current={tab === 'profiles' ? 'page' : undefined}
        onClick={() => onSelect('profiles')}
      >
        <span>Profiles ({counts.profiles})</span>
      </button>
      <button
        className={tab === 'experiments' ? 'tab-handle active' : 'tab-handle'}
        aria-current={tab === 'experiments' ? 'page' : undefined}
        onClick={() => onSelect('experiments')}
      >
        <span>Journal ({counts.experiments})</span>
      </button>
      {isAdmin && (
        <a className="tab-handle" href="/admin">
          <span>Admin</span>
        </a>
      )}
    </nav>
  );
}
