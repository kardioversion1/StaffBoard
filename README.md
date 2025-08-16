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
- Tabs in the top bar switch between Board, **Settings** (staff manager with import/export) and **Shift Builder**.
- Right-click a nurse tile for quick actions like DTO, student tag, or RF edit.
- Theme toggle (🌓) persists across sessions.
- Search by name, RF number, role or notes from the top bar.
- Export/Import data via browser dev tools using localStorage key `staffboard_v2`.
- If the app crashes, an overlay offers **Reload** or **Reset Local Data** (clears `staffboard_v2`).
