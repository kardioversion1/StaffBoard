// roles available on the board
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
  id: string;               // internal UUID
  firstName: string;
  lastName: string;
  role: Role;
  rfNumber?: string;        // radio frequency / badge number (separate from hospitalId)
  hospitalId?: string;      // numeric string, e.g. "328343"
  notes?: string;
}

export interface Nurse extends StaffBase {
  status: 'active' | 'off';
  studentTag?: string | null;
  /** Preferred new fields */
  shiftStart?: string | null; // ISO
  shiftEnd?: string | null;   // ISO
  /** Legacy field kept for backward compat with older saves */
  offAt?: string | null;      // ISO legacy
}

export interface ScheduledShift {
  staffId: string;
  start: string;   // ISO
  end: string;     // ISO
  zoneId?: string; // optional initial placement
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
  weatherProvider?: 'open-meteo' | 'custom';
  weatherLocationLabel?: string;        // default "Jewish Hospital, Louisville"
  weatherLat?: number;                  // default 38.2473
  weatherLon?: number;                  // default -85.7579
  weatherRefreshMinutes?: number;       // default 10
  weatherEndpoint?: string;
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
  updatedAt?: string; // ISO
}

export interface AncillaryItem {
  id: string;
  role: Role;
  names: string[];
  note?: string;
}

export interface BoardState {
  zones: Zone[];
  nurses: Record<string, Nurse>;
  scheduledShifts: ScheduledShift[]; // keep for RightRail (incoming/off-going)
  ancillary: AncillaryItem[];
  settings: Settings;
  weather: WeatherState;
  privacy: { mainBoardNameFormat: 'first-lastInitial' | 'full' };
  ui: {
    density: 'compact' | 'comfortable';
    // runtime-only (not persisted or only partially)
    view?: 'board' | 'settings' | 'shift';
    draggingNurseId?: string | null;
    dragTargetZoneId?: string | null;
    contextMenu?: { nurseId?: string; anchor?: DOMRect | null } | null;
  };
  version: number;
}
