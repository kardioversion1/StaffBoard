# StaffBoard

Digital greaseboard for ER nurse staffing and patient flow.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Board layout & History

- Zones render in a 3-row grid with Charge and Triage pinned to the top.
- Nurse tiles show badges for break, student, and DTO states.
- Employment type can be set for each nurse and appears on the board.
- Nurse assignment history is tracked; Shift Builder shows the last five shifts.

## Weather

Uses the [Open-Meteo](https://open-meteo.com/) API (no key) for live conditions. Defaults to **Jewish Hospital, Louisville** but can be customized in Settings.

## Admin Tips

- Use the ⚙️ button to manage staff and zones.
- Tabs in the top bar switch between Board, **Settings** (staff manager with import/export) and **Shift Builder**.
- Right-click a nurse tile for quick actions like DTO, student tag, or RF edit.
- Theme toggle (🌓) persists across sessions.
- Search by name, RF number, role or notes from the top bar.
- Search by name, Hospital ID, RF number, role or notes from the top bar.
- Export/Import data via browser dev tools using localStorage key `staffboard_v3`.
- If the app crashes, an overlay offers **Reload** or **Reset Local Data** (clears `staffboard_v3`).

## Hospital ID

Each nurse can have a unique numeric Hospital ID. When adding a nurse without an ID, the app assigns a temporary 6-digit code. IDs must be 4–10 digits and unique across all staff. Edit IDs from Settings or the nurse menu; validation errors are shown inline.

## Shift Planner (v2.6)

An experimental planner for building daily or weekly coverage. Drag nurses into zone/role cells, review the last five assignments and publish days to append to history. Includes basic rule checks, optional self-scheduling windows and a lightweight swap request queue.
