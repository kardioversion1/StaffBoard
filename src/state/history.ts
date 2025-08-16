import { BoardState, HistoryEntry } from '../types';

export function pushHistory(
  state: BoardState,
  nurseId: string,
  entry: HistoryEntry,
  cap = 50
): BoardState {
  const arr = state.history[nurseId] ? [...state.history[nurseId]] : [];
  arr.unshift(entry);
  if (arr.length > cap) arr.length = cap;
  return { ...state, history: { ...state.history, [nurseId]: arr } };
}
