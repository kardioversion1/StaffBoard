import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store';
import { BoardState } from '../types';

const base: BoardState = {
  zones: [{ id: 'unassigned', name: 'Unassigned', order: 0, nurseIds: [] }],
  nurses: {},
  scheduledShifts: [],
  ancillary: [],
  settings: {
    theme: 'dark',
    tvMode: false,
    showSeconds: true,
    clock24h: false,
    weatherEnabled: false,
    autoPromoteIncoming: false,
    retainOffgoingMinutes: 30,
  },
  weather: { location: '' },
  privacy: { mainBoardNameFormat: 'first-lastInitial' },
  ui: { density: 'comfortable' },
  history: {},
  coverage: [],
  assignments: [],
  planner: { view: 'week', selectedDate: '', ruleConfig: {} },
  swapRequests: [],
  version: 1,
};

describe('hospitalId', () => {
beforeEach(() => {
  useStore.setState((s) => ({ ...s, ...base }) as any, true);
});

  it('auto assigns unique hospital id', () => {
    const add = useStore.getState().addNurse;
    const id1 = add({ firstName: 'A', lastName: 'B', role: 'RN', status: 'active' });
    const id2 = add({ firstName: 'C', lastName: 'D', role: 'RN', status: 'active' });
    const n1 = useStore.getState().nurses[id1];
    const n2 = useStore.getState().nurses[id2];
    expect(n1.hospitalId).toMatch(/^\d{6}$/);
    expect(n2.hospitalId).toMatch(/^\d{6}$/);
    expect(n1.hospitalId).not.toBe(n2.hospitalId);
  });

  it('rejects duplicate hospital id on update', () => {
    const { addNurse, updateNurse } = useStore.getState();
    const id1 = addNurse({ firstName: 'A', lastName: 'B', role: 'RN', status: 'active', hospitalId: '1234' });
    const id2 = addNurse({ firstName: 'C', lastName: 'D', role: 'RN', status: 'active', hospitalId: '5678' });
    expect(() => updateNurse(id2, { hospitalId: '1234' })).toThrow('Hospital ID already in use');
    // original hospitalId remains
    expect(useStore.getState().nurses[id2].hospitalId).toBe('5678');
  });
});
