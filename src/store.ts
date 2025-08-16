import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BoardState, Nurse, Zone } from './types';
import { v4 as uuid } from 'uuid';

const now = Date.now();

const demoState: BoardState = {
  zones: [
    { id: 'unassigned', name: 'Unassigned', order: 0, nurseIds: ['n1', 'n2'] },
    { id: 'triage', name: 'Triage', order: 1, nurseIds: ['n3'] },
    { id: 'charge', name: 'Charge', order: 2, nurseIds: ['n4'] },
    { id: 'fast', name: 'Fast Track', order: 3, nurseIds: [] },
    { id: 'mainA', name: 'Main A', order: 4, nurseIds: ['n5', 'n6'] },
    { id: 'mainB', name: 'Main B', order: 5, nurseIds: ['n7'] },
    { id: 'hall', name: 'Hallway', order: 6, nurseIds: ['n8'] },
    { id: 'obs', name: 'Obs', order: 7, nurseIds: ['n9', 'n10'] }
  ],
  nurses: {
    n1: { id: 'n1', firstName: 'Alice', lastName: 'Smith', rfNumber: '101', role: 'RN', status: 'active', offAt: new Date(now + 45 * 60000).toISOString() },
    n2: { id: 'n2', firstName: 'Bob', lastName: 'Jones', role: 'RN', status: 'active' },
    n3: { id: 'n3', firstName: 'Carla', lastName: 'White', role: 'LPN', status: 'active', studentTag: 'S' },
    n4: { id: 'n4', firstName: 'Dan', lastName: 'Brown', role: 'Charge', status: 'active' },
    n5: { id: 'n5', firstName: 'Eve', lastName: 'Miller', role: 'Tech', status: 'active', offAt: new Date(now + 30 * 60000).toISOString() },
    n6: { id: 'n6', firstName: 'Frank', lastName: 'Wilson', role: 'RN', status: 'active' },
    n7: { id: 'n7', firstName: 'Grace', lastName: 'Taylor', role: 'RN', status: 'active', studentTag: 'S' },
    n8: { id: 'n8', firstName: 'Hank', lastName: 'Anderson', role: 'Tech', status: 'active' },
    n9: { id: 'n9', firstName: 'Ivy', lastName: 'Thomas', role: 'RN', status: 'active' },
    n10:{ id: 'n10', firstName: 'John', lastName: 'Lee', role: 'UnitSecretary', status: 'active' }
  },
  theme: 'dark',
  privacy: { mainBoardNameFormat: 'first-lastInitial' },
  ui: { density: 'comfortable' },
  version: 1
};

interface Store extends BoardState {
  addNurse: (nurse: Omit<Nurse, 'id'> & { id?: string }, zoneId?: string) => string;
  updateNurse: (id: string, data: Partial<Nurse>) => void;
  moveNurse: (id: string, toZone: string, index?: number) => void;
  removeNurse: (id: string) => void;
  addZone: (name: string) => void;
  updateZone: (id: string, data: Partial<Zone>) => void;
  setTheme: (t: 'dark' | 'light') => void;
}

export const useStore = create<Store>()(persist((set, get) => ({
  ...demoState,
  addNurse: (nurse, zoneId = 'unassigned') => {
    const id = nurse.id ?? uuid();
    const n: Nurse = { status: 'active', ...nurse, id };
    set((state) => {
      state.nurses[id] = n;
      const zone = state.zones.find((z) => z.id === zoneId);
      zone?.nurseIds.push(id);
    });
    return id;
  },
  updateNurse: (id, data) => set((state) => { state.nurses[id] = { ...state.nurses[id], ...data }; }),
  moveNurse: (id, toZone, index) => set((state) => {
    const fromZone = state.zones.find((z) => z.nurseIds.includes(id));
    if (fromZone) fromZone.nurseIds = fromZone.nurseIds.filter((nid) => nid !== id);
    const zone = state.zones.find((z) => z.id === toZone);
    if (zone) {
      if (index === undefined) zone.nurseIds.push(id); else zone.nurseIds.splice(index, 0, id);
    }
  }),
  removeNurse: (id) => set((state) => {
    delete state.nurses[id];
    state.zones.forEach((z) => z.nurseIds = z.nurseIds.filter((nid) => nid !== id));
  }),
  addZone: (name) => set((state) => {
    const id = uuid();
    state.zones.push({ id, name, order: state.zones.length, nurseIds: [] });
  }),
  updateZone: (id, data) => set((state) => {
    const z = state.zones.find((z) => z.id === id);
    if (z) Object.assign(z, data);
  }),
  setTheme: (t) => set(() => ({ theme: t }))
}), {
  name: 'staffboard',
  version: 1,
  migrate: (state) => state as BoardState
}));
