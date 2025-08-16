import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { BoardState, Nurse, Zone, Settings, WeatherState, Role } from './types';
import {
  addStaff,
  moveStaff,
  removeStaff,
  markOff,
  setRf,
  setStudentTag,
  setShiftEnd,
  setBreak,
} from './state/updates';
import { generateTempHospitalId } from './state/ids';

const now = Date.now();

/** Local UI shape extends BoardState.ui to include runtime-only fields */
type UiView = 'board' | 'settings' | 'shift';
interface UiState {
  density: 'compact' | 'comfortable';
  view: UiView;
  draggingNurseId: string | null;
  dragTargetZoneId: string | null;
  contextMenu: any; // shape owned by NurseMenu
}

/** Our Store extends BoardState but with richer ui */
interface Store extends Omit<BoardState, 'ui'> {
  ui: UiState;

  addNurse: (nurse: Omit<Nurse, 'id'> & { id?: string }, zoneId?: string) => string;
  updateNurse: (id: string, data: Partial<Nurse>) => void;
  moveNurse: (id: string, toZone: string, index?: number) => void;
  removeNurse: (id: string) => void;

  addZone: (name: string) => void;
  updateZone: (id: string, data: Partial<Zone>) => void;

  updateSettings: (data: Partial<Settings>) => void;
  setWeather: (w: Partial<WeatherState>) => void;
  addAncillary: (role: Role, names: string[], note?: string) => void;

  setUi: (ui: Partial<UiState>) => void;

  // Nurse menu actions
  markOffAction: (id: string) => void;
  setRfAction: (id: string, rf: string) => void;
  setStudentTagAction: (id: string, tag: string | null) => void;
  setShiftEndAction: (id: string, iso: string | null) => void;
  setBreakAction: (id: string, on: boolean, coverId?: string) => void;
}

const demoState: Omit<Store, keyof Store> & BoardState = {
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
    n1: {
      id: 'n1',
      firstName: 'Alice',
      lastName: 'Smith',
      rfNumber: '101',
      role: 'RN',
      status: 'active',
      offAt: new Date(now + 45 * 60000).toISOString(),
    },
    n2: { id: 'n2', firstName: 'Bob', lastName: 'Jones', role: 'RN', status: 'active' },
    n3: { id: 'n3', firstName: 'Carla', lastName: 'White', role: 'RN', status: 'active', studentTag: 'S' },
    n4: { id: 'n4', firstName: 'Dan', lastName: 'Brown', role: 'Charge RN', status: 'active' },
    n5: {
      id: 'n5',
      firstName: 'Eve',
      lastName: 'Miller',
      role: 'Tech',
      status: 'active',
      offAt: new Date(now + 30 * 60000).toISOString(),
    },
    n6: { id: 'n6', firstName: 'Frank', lastName: 'Wilson', role: 'RN', status: 'active' },
    n7: { id: 'n7', firstName: 'Grace', lastName: 'Taylor', role: 'RN', status: 'active', studentTag: 'S' },
    n8: { id: 'n8', firstName: 'Hank', lastName: 'Anderson', role: 'Tech', status: 'active' },
    n9: { id: 'n9', firstName: 'Ivy', lastName: 'Thomas', role: 'RN', status: 'active' },
    n10: { id: 'n10', firstName: 'John', lastName: 'Lee', role: 'Other', status: 'active' },
  },
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
  weather: { location: '' } as WeatherState,
  privacy: { mainBoardNameFormat: 'first-lastInitial' },
  // We'll fill ui via the Store default below
  ui: { density: 'comfortable' } as any,
  version: 1,
} as unknown as BoardState;

export const useStore = create<Store>((set, get) => ({
  ...demoState,
  // enrich UI defaults
  ui: {
    density: 'comfortable',
    view: 'board',
    draggingNurseId: null,
    dragTargetZoneId: null,
    contextMenu: null,
  },

  addNurse: (nurse, zoneId = 'unassigned') => {
    const state = get();
    const existing = new Set(
      Object.values(state.nurses)
        .map((n) => n.hospitalId)
        .filter(Boolean) as string[]
    );

    let hospitalId = nurse.hospitalId;
    if (hospitalId) {
      if (!/^\d{4,10}$/.test(hospitalId)) throw new Error('Hospital ID must be 4-10 digits');
      if (existing.has(hospitalId)) throw new Error('Hospital ID already in use');
    } else {
      hospitalId = generateTempHospitalId(existing);
    }

    const { state: next, id } = addStaff(state, { ...nurse, hospitalId }, zoneId);
    set(next);
    return id;
  },

  updateNurse: (id, data) => {
    const state = get();
    if ('hospitalId' in data) {
      const hospitalId = data.hospitalId;
      const existing = new Set(
        Object.values(state.nurses)
          .map((n) => n.hospitalId)
          .filter(Boolean) as string[]
      );
      // allow keeping the same value on the same nurse
      existing.delete(state.nurses[id]?.hospitalId!);
      if (hospitalId) {
        if (!/^\d{4,10}$/.test(hospitalId)) throw new Error('Hospital ID must be 4-10 digits');
        if (existing.has(hospitalId)) throw new Error('Hospital ID already in use');
      }
    }

    set({
      ...state,
      nurses: state.nurses[id]
        ? { ...state.nurses, [id]: { ...state.nurses[id], ...data } }
        : state.nurses,
    });
  },

  moveNurse: (id, toZone, index) => set((state) => moveStaff(state, id, toZone, index) as any),

  removeNurse: (id) => set((state) => removeStaff(state, id) as any),

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

  setUi: (ui) =>
    set((state) => ({
      ...state,
      ui: { ...state.ui, ...ui },
    })),

  // Nurse menu actions
  markOffAction: (nid) => set((state) => markOff(state, nid) as any),
  setRfAction: (nid, rf) => set((state) => setRf(state, nid, rf) as any),
  setStudentTagAction: (nid, tag) => set((state) => setStudentTag(state, nid, tag) as any),
  setShiftEndAction: (nid, iso) => set((state) => setShiftEnd(state, nid, iso) as any),
  setBreakAction: (nid, on, cover) => set((state) => setBreak(state, nid, on, cover) as any),
}));
