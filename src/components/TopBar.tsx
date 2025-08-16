import React, { useState } from 'react';
import { useStore } from '../store';
import { displayName } from '../utils/name';

interface Props {
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onToggleTvMode: () => void;
  tvMode: boolean;
}

const TopBar: React.FC<Props> = ({ onOpenSettings, onToggleTheme, onToggleTvMode, tvMode }) => {
  const [query, setQuery] = useState('');
  const nurses = useStore((s) => Object.values(s.nurses));
  const view = useStore((s) => s.ui.view);
  const setUi = useStore((s) => s.setUi);

  const results = query
    ? nurses.filter((n) =>
        [
          displayName(n, 'full'),
          n.rfNumber,
          (n as any).hospitalId, // safe if you've added hospitalId to types
          n.role,
          n.notes,
        ]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <header className={`topbar ${tvMode ? 'tv' : ''}`}>
      {!tvMode && (
        <nav className="nav-tabs">
          <button
            className={view === 'board' ? 'active' : ''}
            onClick={() => setUi({ view: 'board' })}
          >
            Board
          </button>
          <button
            className={view === 'settings' ? 'active' : ''}
            onClick={() => setUi({ view: 'settings' })}
          >
            Settings
          </button>
          <button
            className={view === 'shift' ? 'active' : ''}
            onClick={() => setUi({ view: 'shift' })}
          >
            Shift Builder
          </button>
        </nav>
      )}

      {!tvMode && <button onClick={onOpenSettings}>⚙️</button>}

      {!tvMode && (
        <input
          className="search"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}

      <button onClick={onToggleTheme}>🌓</button>
      <button onClick={onToggleTvMode}>{tvMode ? '↩️' : '📺'}</button>

      {!tvMode && query && (
        <div className="search-results">
          {results.map((n) => (
            <div key={n.id}>{displayName(n, 'full')}</div>
          ))}
        </div>
      )}
    </header>
  );
};

export default TopBar;
