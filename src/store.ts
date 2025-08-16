import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { BoardState, Nurse, Zone, Settings, WeatherState, Role } from './types';
import { addStaff, moveStaff, removeStaff } from './state/updates';

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
    { id: 'obs', name: 'Obs', order: 7, nurseIds: ['n9', 'n10'] },
  ],
  nurses: {
    n1: { id: 'n1', firstName: 'Alice', lastName: 'Smith', rfNumber: '101', role: 'RN', status: 'active', offAt: new Date(now + 45 * 60000).toISOString() },
    n2: { id: 'n2', firstName: 'Bob', lastName: 'Jones', role: 'RN', status: 'active' },
    n3: { id: 'n3', firstName: 'Carla', lastName: 'White', role: 'RN', status: 'active', studentTag: 'S' },
    n4: { id: 'n4', firstName: 'Dan', lastName: 'Brown', role: 'Charge RN', status: 'active' },
    n5: { id: 'n5', firstName: 'Eve', lastName: 'Miller', role: 'Tech', status: 'active', offAt: new Date(now + 30 * 60000).toISOString() },
    n6: { id: 'n6', firstName: 'Frank', lastName: 'Wilson', role: 'RN', status: 'active' },
    n7: { id: 'n7', firstName: 'Grace', lastName: 'Taylor', role: 'RN', status: 'active', studentTag: 'S' },
    n8: { id: 'n8', firstName: 'Hank', lastName: 'Anderson', role: 'Tech', status: 'active' },
    n9: { id: 'n9', firstName: 'Ivy', lastName: 'Thomas', role: 'RN', status: 'active' },
    n10:{ id: 'n10', firstName: 'John', lastName: 'Lee', role: 'Other', status: 'active' },
  },
  scheduledShifts: [],              // keep this; used by RightRail logic
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
  weather: { location: '' } as WeatherState,
  privacy: { mainBoardNameFormat: 'first-lastInitial' },
  ui: { density: 'comfortable' },
  version: 1,
};

interface Store extends BoardState {
  addNurse: (nurse: Omit<Nurse, 'id'> & { id?: string }, zoneId?: string) => string;
  updateNurse: (id: string, data: Partial<Nurse>) => void;
  moveNurse: (id: string, toZone: string, index?: number) => void;
  removeNurse: (id: string) => void;
  addZone: (name: string) => void;
  updateZone: (id: string, data: Partial<Zone>) => void;
  updateSettings: (data: Partial<Settings>) => void;
  setWeather: (w: Partial<WeatherState>) => void;
  addAncillary: (role: Role, names: string[], note?: string) => void;
}

export const useStore = create<Store>((set, get) => ({
  ...demoState,

  addNurse: (nurse, zoneId = 'unassigned') => {
    const { state: next, id } = addStaff(get(), nurse, zoneId); // pure helper returns new state + id
    set(next);
    return id;
  },

  updateNurse: (id, data) =>
    set((state) => ({
      ...state,
      nurses: state.nurses[id]
        ? { ...state.nurses, [id]: { ...state.nurses[id], ...data } }
        : state.nurses,
    })),

  moveNurse: (id, toZone, index) =>
    set((state) => moveStaff(state, id, toZone, index)), // pure, immutable

  removeNurse: (id) =>
    set((state) => removeStaff(state, id)), // pure, cleans zone refs

  addZone: (name) =>
    set((state) => ({
      ...state,
      zones: [...state.zones, { id: uuid(), name, order: state.zones.length, nurseIds: [] }],
    })),

  updateZone: (id, data) =>
    set((state) => ({
      ...state,
      zones: state.zones.map((z) => (z.id === id ? { ...z, ...data } : z)),
    })),

  updateSettings: (data) =>
    set((state) => ({ ...state, settings: { ...state.settings, ...data } })),

  setWeather: (w) =>
    set((state) => ({ ...state, weather: { ...state.weather, ...w } })),

  addAncillary: (role, names, note) =>
    set((state) => ({
      ...state,
      ancillary: [...state.ancillary, { id: uuid(), role, names, note }],
    })),
}));

