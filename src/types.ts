export type Role =
  | 'RN'
  | 'Charge RN'
  | 'Tech'
  | 'MD'
  | 'APP'
  | 'RT'
  | 'Rad'
  | 'Transport'
  | 'Scribe'
  | 'Other';

export interface StaffBase {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  rfNumber?: string;
  notes?: string;
}

export interface Nurse extends StaffBase {
  status: 'active' | 'off';
  studentTag?: string | null;
  shiftStart?: string | null; // ISO
  shiftEnd?: string | null; // ISO
  offAt?: string | null; // legacy
}

export interface Zone {
  id: string;
  name: string;
  capacity?: number;
  order: number;
  nurseIds: string[];
}

export interface Settings {
  theme: 'dark' | 'light' | 'auto';
  tvMode: boolean;
  showSeconds: boolean;
  clock24h: boolean;
  weatherEnabled: boolean;
  weatherEndpoint?: string;
  weatherLocationLabel?: string;
  autoPromoteIncoming: boolean;
  retainOffgoingMinutes: number;
}

export interface WeatherState {
  location: string;
  tempC?: number;
  tempF?: number;
  condition?: 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Fog' | 'Wind' | 'Unknown';
  highF?: number;
  lowF?: number;
  updatedAt?: string;
}

export interface BoardState {
  zones: Zone[];
  nurses: Record<string, Nurse>;
  ancillary: { id: string; role: Role; names: string[]; note?: string }[];
  settings: Settings;
  weather: WeatherState;
  privacy: { mainBoardNameFormat: 'first-lastInitial' | 'full' };
  ui: { density: 'compact' | 'comfortable' };
  version: number;
}
