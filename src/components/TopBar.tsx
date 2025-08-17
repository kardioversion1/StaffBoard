import React, { useState } from 'react';
import { useStore } from '../store';
import { displayName } from '../utils/name';
import { searchNurses } from '../utils/search';

interface Props {
  onToggleTheme: () => void;
  onToggleTvMode: () => void;
  tvMode: boolean;
}

const TopBar: React.FC<Props> = ({ onToggleTheme, onToggleTvMode, tvMode }) => {
  const [query, setQuery] = useState('');
  const nurses = useStore((s) => Object.values(s.nurses));
  const view = useStore((s) => s.ui.view);
  const setUi = useStore((s) => s.setUi);

  const results = query ? searchNurses(nurses, query) : [];

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
            className={view === 'planner' ? 'active' : ''}
            onClick={() => setUi({ view: 'planner' })}
          >
            Shift Planner
          </button>
          <button
            className={view === 'shift' ? 'active' : ''}
            onClick={() => setUi({ view: 'shift' })}
          >
            Shift Builder
          </button>
        </nav>
      )}

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
