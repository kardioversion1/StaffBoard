import React, { useEffect, useState } from 'react';
import Board from './components/Board';
import TopBar from './components/TopBar';
import Settings from './components/Settings';
import RightRail from './components/RightRail';
import ViewportScaler from './components/ViewportScaler';
import { useStore } from './store';

const App: React.FC = () => {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  return (
    <ViewportScaler width={1920} height={1080}>
      <div className={`app-root ${settings.tvMode ? 'tv-mode' : ''}`}>
        <TopBar
          tvMode={settings.tvMode}
          onToggleTvMode={() => updateSettings({ tvMode: !settings.tvMode })}
          onOpenSettings={() => setShowSettings(true)}
          onToggleTheme={() =>
            updateSettings({
              theme: settings.theme === 'dark' ? 'light' : 'dark',
            })
          }
        />
        <div className="main-grid">
          <Board />
          <RightRail />
        </div>
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </div>
    </ViewportScaler>
  );
};

export default App;
