import { Nurse } from '../types';

export function searchNurses(nurses: Nurse[], query: string): Nurse[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const isDigits = /^\d+$/.test(q);
  const results = nurses.filter((n) => {
    const fields = [
      n.firstName,
      n.lastName,
      n.lastName?.[0],
      n.hospitalId,
      n.rfNumber,
      n.role,
      n.notes,
    ]
      .filter(Boolean)
      .map((f) => f!.toString().toLowerCase());
    return fields.some((f) => f.includes(q));
  });
  if (isDigits) {
    results.sort((a, b) => {
      const aMatch = a.hospitalId === q ? 1 : 0;
      const bMatch = b.hospitalId === q ? 1 : 0;
      return bMatch - aMatch;
    });
  }
  return results;
}
