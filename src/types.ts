export type Role = 'RN' | 'LPN' | 'Tech' | 'Charge' | 'UnitSecretary';

export interface Nurse {
  id: string;
  firstName: string;
  lastName: string;
  rfNumber?: string;
  role: Role;
  notes?: string;
  studentTag?: string | null;
  offAt?: string | null;      // ISO
  status: 'active' | 'off';
  shiftStart?: string | null; // ISO
  shiftEnd?: string | null;   // ISO
}

export interface Zone {
  id: string;
  name: string;
  color?: string;   // accent
  order: number;
  nurseIds: string[];
}

export interface BoardState {
  zones: Zone[];
  nurses: Record<string, Nurse>;
  theme: 'dark' | 'light';
  privacy: { mainBoardNameFormat: 'first-lastInitial' | 'full'; };
  ui: { density: 'compact' | 'comfortable'; };
  version: number;
}
