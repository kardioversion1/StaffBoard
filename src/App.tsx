import React, { useEffect, useRef, useState } from 'react';
import Board from './components/Board';
import TopBar from './components/TopBar';
import Settings from './components/Settings';
import RightRail from './components/RightRail';
import ViewportScaler from './components/ViewportScaler';
import { useStore } from './store';
import { safeLoad, safeSave } from './lib/storage';

import NurseMenu from './components/NurseMenu';
import SettingsStaff from './pages/SettingsStaff';
import ShiftBuilder from './pages/ShiftBuilder';

const App: React.FC = () => {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const view = useStore((s) => s.ui.view);

  const [showSettings, setShowSettings] = useState(false);
  const [showDev, setShowDev] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const lastSave = useRef<string | null>(null);
  const pending = useRef<number | null>(null);

  // Apply theme to <html data-theme="">
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  // Initial load from localStorage (safe) and normalize transient UI
  useEffect(() => {
    const persisted = safeLoad();
    if (persisted?.board) {
      useStore.setState({
        ...persisted.board,
        ui: {
          ...persisted.board.ui,
          // ensure runtime-only fields start clean
          view: 'board',
          draggingNurseId: null,
          dragTargetZoneId: null,
          contextMenu: null,
        },
      });
      lastSave.current = persisted.updatedAt ?? null;
    }
  }, []);

  // Debounced persistence on store changes (exclude transient UI)
  useEffect(() => {
    const unsub = useStore.subscribe((state) => {
      if (pending.current) window.clearTimeout(pending.current);
      pending.current = window.setTimeout(() => {
        pending.current = null;

        // Persist only durable UI pieces (e.g., density). Avoid saving view/drag state.
        const { ui, ...rest } = state as any;
        const payload = {
          version: state.version,
          board: { ...rest, ui: { density: ui?.density ?? 'comfortable' } },
          updatedAt: new Date().toISOString(),
        };

        const ok = safeSave(payload);
        if (!ok) setSaveError('Persist failed');
        lastSave.current = payload.updatedAt;
      }, 300) as unknown as number;
    });

    return () => {
      unsub();
      if (pending.current) {
        window.clearTimeout(pending.current);
        pending.current = null;
      }
    };
  }, []);

  // Dev panel toggle (F2)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2') setShowDev((v) => !v);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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

        {view === 'board' && (
          <div className="main-grid">
            <Board />
            <RightRail />
          </div>
        )}
        {view === 'settings' && <SettingsStaff />}
        {view === 'shift' && <ShiftBuilder />}

        {showSettings && <Settings onClose={() => setShowSettings(false)} />}

        {/* Global nurse context menu (portal/overlay) */}
        <NurseMenu />

        {saveError && <div className="toast">{saveError}</div>}

        {showDev && (
          <div className="dev-panel">
            <div>version {useStore.getState().version}</div>
            <div>staff {Object.keys(useStore.getState().nurses).length}</div>
            <div>zones {useStore.getState().zones.length}</div>
            <div>last save {lastSave.current ?? 'n/a'}</div>
            <div>pending {pending.current ? 'yes' : 'no'}</div>
          </div>
        )}
      </div>
    </ViewportScaler>
  );
};

export default App;

