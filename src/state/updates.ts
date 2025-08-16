import { BoardState, Nurse } from '../types';
import { v4 as uuid } from 'uuid';

export function addStaff(
  state: BoardState,
  nurse: Omit<Nurse, 'id'> & { id?: string },
  zoneId: string
): { state: BoardState; id: string } {
  const id = nurse.id ?? uuid();
  if (state.nurses[id]) {
    console.warn('addStaff: duplicate id', id);
    return { state, id };
  }
  const zoneExists = state.zones.some((z) => z.id === zoneId);
  if (!zoneExists) {
    console.warn('addStaff: invalid zone', { zoneId });
    return { state, id };
  }
  const newNurse: Nurse = { status: 'active', ...nurse, id };
  return {
    state: {
      ...state,
      nurses: { ...state.nurses, [id]: newNurse },
      zones: state.zones.map((z) =>
        z.id === zoneId ? { ...z, nurseIds: [...z.nurseIds, id] } : z
      ),
    },
    id,
  };
}

export function moveStaff(
  state: BoardState,
  staffId: string,
  toZoneId: string,
  toIndex?: number
): BoardState {
  const nurse = state.nurses[staffId];
  const toZone = state.zones.find((z) => z.id === toZoneId);
  if (!nurse || !toZone) {
    console.warn('moveStaff: invalid refs', { staffId, toZoneId });
    return state;
  }
  const zones = state.zones.map((z) => {
    let ids = z.nurseIds.filter((id) => id !== staffId);
    if (z.id === toZoneId) {
      if (toIndex === undefined || toIndex < 0 || toIndex > ids.length)
        ids.push(staffId);
      else ids.splice(toIndex, 0, staffId);
    }
    return { ...z, nurseIds: ids };
  });
  return { ...state, zones };
}

export function removeStaff(state: BoardState, staffId: string): BoardState {
  if (!state.nurses[staffId]) return state;
  const { [staffId]: _removed, ...rest } = state.nurses;
  const zones = state.zones.map((z) => ({
    ...z,
    nurseIds: z.nurseIds.filter((id) => id !== staffId),
  }));
  const scheduledShifts = state.scheduledShifts.filter(
    (s) => s.staffId !== staffId
  );
  return { ...state, nurses: rest, zones, scheduledShifts };
}
