import { BoardState, Role } from '../types';

export function suggestCandidates(
  state: BoardState,
  zoneId: string,
  role: Role
): string[] {
  // placeholder implementation: return all nurse IDs
  return Object.values(state.nurses)
    .filter((n) => n.role === role)
    .map((n) => n.id);
}
