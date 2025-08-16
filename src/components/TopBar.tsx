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
  const results = query
    ? nurses.filter((n) =>
        [displayName(n, 'full'), n.rfNumber, n.role, n.notes]
          .filter(Boolean)
          .some((f) => f!.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

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
