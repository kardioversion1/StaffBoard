import React, { useState } from 'react';
import { useStore } from '../store';
import { displayName } from '../utils/name';
import { searchNurses } from '../utils/search';

interface Props {
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onToggleTvMode: () => void;
  tvMode: boolean;
}

const TopBar: React.FC<Props> = ({ onOpenSettings, onToggleTheme, onToggleTvMode, tvMode }) => {
  const [query, setQuery] = useState('');
  const nurses = useStore((s) => Object.values(s.nurses));
  const results = query ? searchNurses(nurses, query) : [];

  return (
    <header className={`topbar ${tvMode ? 'tv' : ''}`}>
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
