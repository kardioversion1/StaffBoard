import { BoardState } from '../types';

export const STORAGE_KEY = 'staffboard_v2';

export type PersistedState = {
  version: number;
  board: BoardState;
  updatedAt: string;
};

const CURRENT_VERSION = 1;

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
    // no migrations yet
    return { ...old, version: CURRENT_VERSION };
  } catch {
    return null;
  }
}
