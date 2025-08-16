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

## Admin Tips

- Use the ⚙️ button to manage staff and zones.
- Theme toggle (🌓) persists across sessions.
- Search by name, RF number, role or notes from the top bar.
- Search by name, Hospital ID, RF number, role or notes from the top bar.
- Export/Import data via browser dev tools using localStorage key `staffboard_v2`.
- If the app crashes, an overlay offers **Reload** or **Reset Local Data** (clears `staffboard_v2`).

## Hospital ID

Each nurse can have a unique numeric Hospital ID. When adding a nurse without an ID, the app assigns a temporary 6-digit code. IDs must be 4–10 digits and unique across all staff. Edit IDs from Settings or the nurse menu; validation errors are shown inline.
