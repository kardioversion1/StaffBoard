import { BoardState } from '../types';

export function checkHardRules(
  state: BoardState,
  nurseId: string,
  newAssign: { date: string; start: string; end: string }
): string[] {
  const violations: string[] = [];
  // TODO: implement min rest, max consecutive days, and overlap checks
  return violations;
}
