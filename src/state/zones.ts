import { BoardState } from '../types';

export function ensurePinnedZones(state: BoardState): BoardState {
  let zones = [...state.zones];
  const hasCharge = zones.some((z) => z.id === 'charge');
  const hasTriage = zones.some((z) => z.id === 'triage');
  if (!hasCharge) zones.push({ id: 'charge', name: 'Charge', order: 0, nurseIds: [] });
  if (!hasTriage) zones.push({ id: 'triage', name: 'Triage', order: 1, nurseIds: [] });

  zones = zones.map((z) =>
    z.id === 'charge' ? { ...z, order: 0 } : z.id === 'triage' ? { ...z, order: 1 } : z
  );

  let order = 2;
  zones = zones
    .sort((a, b) => a.order - b.order)
    .map((z) =>
      z.id === 'charge' || z.id === 'triage' ? z : { ...z, order: order++ }
    );

  return { ...state, zones };
}
