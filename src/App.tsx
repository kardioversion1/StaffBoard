import React, { useEffect, useState } from 'react';
import Board from './components/Board';
import TopBar from './components/TopBar';
import Settings from './components/Settings';
import { useStore } from './store';

const App: React.FC = () => {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app">
      <TopBar onOpenSettings={() => setShowSettings(true)} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      <Board />
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default App;
