import { BoardState } from '../types';
import { ensurePinnedZones } from '../state/zones';

export const STORAGE_KEY = 'staffboard_v3';

export type PersistedState = {
  version: number;
  board: BoardState;
  updatedAt: string;
};

const CURRENT_VERSION = 3;

function isValid(obj: any): obj is PersistedState {
  return obj && typeof obj === 'object' && typeof obj.version === 'number' && obj.board;
}

export function safeLoad(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValid(parsed)) return null;
    if (parsed.version !== CURRENT_VERSION) {
      const migrated = migrate(parsed);
      if (migrated) return migrated;
      localStorage.setItem(`${STORAGE_KEY}_backup_${Date.now()}`, raw);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn('safeLoad failed', e);
    return null;
  }
}

export function safeSave(state: PersistedState): boolean {
  try {
    const txt = JSON.stringify(state);
    if (txt.length > 5_000_000) {
      console.warn('safeSave: state too large');
      return false;
    }
    localStorage.setItem(STORAGE_KEY, txt);
    return true;
  } catch (e) {
    console.warn('safeSave failed', e);
    return false;
  }
}

function migrate(old: PersistedState): PersistedState | null {
  try {
    if (old.version === 1) {
      const board = { ...old.board, version: 2 } as BoardState;
      const s: any = board.settings || {};
      if (typeof s.weatherEnabled === 'undefined') {
        s.weatherEnabled = false;
      } else {
        if (!s.weatherProvider) s.weatherProvider = s.weatherEndpoint ? 'custom' : 'open-meteo';
        if (!s.weatherLocationLabel) s.weatherLocationLabel = 'Jewish Hospital, Louisville';
        if (s.weatherLat === undefined) s.weatherLat = 38.2473;
        if (s.weatherLon === undefined) s.weatherLon = -85.7579;
        if (s.weatherRefreshMinutes === undefined) s.weatherRefreshMinutes = 10;
      }
      board.settings = s;
      return { version: CURRENT_VERSION, board, updatedAt: old.updatedAt };
    }
    if (old.version === 2) {
      let board = { ...old.board, version: 3 } as BoardState;
      // ensure employmentType and history
      board.nurses = Object.fromEntries(
        Object.entries(board.nurses).map(([id, n]) => [
          id,
          { ...n, employmentType: n.employmentType || 'home' },
        ])
      );
      board.history = board.history || {};
      board = ensurePinnedZones(board);
      return { version: CURRENT_VERSION, board, updatedAt: old.updatedAt };
    }
    return { ...old, version: CURRENT_VERSION };
  } catch {
    return null;
  }
}
