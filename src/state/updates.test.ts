import { describe, it, expect } from 'vitest';
import { addStaff, moveStaff, removeStaff } from './updates';
import { BoardState } from '../types';

const base: BoardState = {
  zones: [
    { id: 'a', name: 'A', order: 0, nurseIds: [] },
    { id: 'b', name: 'B', order: 1, nurseIds: [] },
  ],
  nurses: {},
  scheduledShifts: [],
  ancillary: [],
  settings: {
    theme: 'dark',
    tvMode: false,
    showSeconds: true,
    clock24h: false,
    weatherEnabled: false,
    weatherProvider: 'open-meteo',
    weatherLocationLabel: 'Jewish Hospital, Louisville',
    weatherLat: 0,
    weatherLon: 0,
    weatherRefreshMinutes: 10,
    autoPromoteIncoming: false,
    retainOffgoingMinutes: 30,
  },
  weather: { location: '' },
  privacy: { mainBoardNameFormat: 'first-lastInitial' },
  ui: { density: 'comfortable' },
  version: 2,
};

describe('updates', () => {
  it('addStaff generates unique id', () => {
    const { state, id } = addStaff(base, { firstName: 'A', lastName: 'B', role: 'RN' }, 'a');
    expect(id).toBeTruthy();
    expect(state.nurses[id]).toBeTruthy();
    expect(state.zones[0].nurseIds).toContain(id);
  });

  it('moveStaff no-ops on bad zone', () => {
    const { state, id } = addStaff(base, { firstName: 'A', lastName: 'B', role: 'RN' }, 'a');
    const moved = moveStaff(state, id, 'missing');
    expect(moved).toEqual(state);
  });

  it('removeStaff cleans scheduled shifts', () => {
    const { state, id } = addStaff(base, { firstName: 'A', lastName: 'B', role: 'RN' }, 'a');
    const withShift: BoardState = {
      ...state,
      scheduledShifts: [{ staffId: id, start: '1', end: '2' }],
    };
    const cleaned = removeStaff(withShift, id);
    expect(cleaned.scheduledShifts.length).toBe(0);
    expect(cleaned.nurses[id]).toBeUndefined();
  });
});
