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
  const newNurse: Nurse = { id, ...nurse, status: nurse.status ?? 'active' };
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
    // remove from any zone it currently occupies
    let ids = z.nurseIds.filter((id) => id !== staffId);

    // insert into target zone at requested index
    if (z.id === toZoneId) {
      if (toIndex === undefined || toIndex < 0 || toIndex > ids.length) {
        ids.push(staffId);
      } else {
        ids = [...ids.slice(0, toIndex), staffId, ...ids.slice(toIndex)];
      }
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

  const scheduledShifts = (state.scheduledShifts ?? []).filter(
    (s) => s.staffId !== staffId
  );

  return { ...state, nurses: rest, zones, scheduledShifts };
}

/* -------- Additional pure helpers used by Nurse menu / actions -------- */

export function markOff(state: BoardState, nurseId: string): BoardState {
  if (!state.nurses[nurseId]) return state;
  const zones = state.zones.map((z) => ({
    ...z,
    nurseIds: z.nurseIds.filter((id) => id !== nurseId),
  }));
  return {
    ...state,
    zones,
    nurses: {
      ...state.nurses,
      [nurseId]: { ...state.nurses[nurseId], status: 'off' },
    },
  };
}

export function setRf(state: BoardState, nurseId: string, rf: string): BoardState {
  if (!state.nurses[nurseId]) return state;
  return {
    ...state,
    nurses: {
      ...state.nurses,
      [nurseId]: { ...state.nurses[nurseId], rfNumber: rf },
    },
  };
}

export function setStudentTag(
  state: BoardState,
  nurseId: string,
  tag: string | null
): BoardState {
  if (!state.nurses[nurseId]) return state;
  return {
    ...state,
    nurses: {
      ...state.nurses,
      [nurseId]: { ...state.nurses[nurseId], studentTag: tag },
    },
  };
}

export function setShiftEnd(
  state: BoardState,
  nurseId: string,
  iso: string | null
): BoardState {
  if (!state.nurses[nurseId]) return state;
  return {
    ...state,
    nurses: {
      ...state.nurses,
      [nurseId]: { ...state.nurses[nurseId], shiftEnd: iso },
    },
  };
}

export function setBreak(
  state: BoardState,
  nurseId: string,
  on: boolean,
  coverNurseId?: string
): BoardState {
  if (!state.nurses[nurseId]) return state;

  const note = state.nurses[nurseId].notes || '';
  // remove any existing [BREAK ...] tag
  const without = note.replace(/\[BREAK.*?\]/, '').trim();

  const coverInitial =
    coverNurseId && state.nurses[coverNurseId]
      ? state.nurses[coverNurseId].lastName?.[0] ?? ''
      : '';

  const tag = on
    ? `[BREAK${coverInitial ? ` cover:${coverInitial}` : ''}]`
    : '';

  const newNotes = (without + (tag ? ` ${tag}` : '')).trim();

  return {
    ...state,
    nurses: {
      ...state.nurses,
      [nurseId]: { ...state.nurses[nurseId], notes: newNotes },
    },
  };
}

/* Optional helper if you support Hospital ID editing in the menu/settings */
export function setHospitalId(
  state: BoardState,
  nurseId: string,
  hospitalId: string | undefined
): BoardState {
  if (!state.nurses[nurseId]) return state;
  return {
    ...state,
    nurses: {
      ...state.nurses,
      [nurseId]: { ...state.nurses[nurseId], hospitalId },
    },
  };
}
