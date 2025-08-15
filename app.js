import { $, $$, debug } from './utils.js';
import { DB, KS } from './db.js';
import { STATE } from './state.js';
import { renderAll } from './render.js';

// -------- UI helpers
function setTheme(theme) {
  STATE.theme = theme;
  document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
  const btn = $('#themeToggle');
  if (btn) btn.textContent = theme === 'light' ? 'Dark Mode' : 'Light Mode';
  const sel = $('#themeSel');
  if (sel) sel.value = theme;
  debug('Theme set to ' + theme);
}

function setAccent(name) {
  STATE.accent = name;
  document.documentElement.style.setProperty(
    '--accent',
    {
      blue: '#0090ff',
      green: '#28c990',
      orange: '#f5a524',
      purple: '#b259d0',
      pink: '#ff5b9a'
    }[name] || '#0090ff'
  );
  const sel = $('#accentSel');
  if (sel) sel.value = name;
  debug('Accent set to ' + name);
}

function formatDateLabel(iso) {
  const d = new Date(iso + 'T12:00:00'); // force midday to avoid TZ roll
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// -------- Event wiring
async function wireControls() {
  // Tabs
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const name = tab.dataset.tab;
      const main = $('#tab-main');
      const settings = $('#tab-settings');
      if (main) main.style.display = name === 'main' ? '' : 'none';
      if (settings) settings.style.display = name === 'settings' ? '' : 'none';
    });
  });

  // Date controls
  const picker = $('#datePicker');
  if (picker) {
    picker.value = STATE.date;
    picker.addEventListener('change', async e => {
      STATE.date = e.target.value;
      const label = $('#dateLabel');
      if (label) label.textContent = formatDateLabel(STATE.date);
      debug('Date changed to ' + STATE.date);
      await renderAll().catch(err => debug('Render error: ' + err.message));
    });
  }

  const prev = $('#prevDay');
  if (prev) prev.addEventListener('click', async () => {
    const d = new Date(STATE.date);
    d.setDate(d.getDate() - 1);
    STATE.date = d.toISOString().slice(0, 10);
    if (picker) picker.value = STATE.date;
    const label = $('#dateLabel');
    if (label) label.textContent = formatDateLabel(STATE.date);
    debug('Prev day to ' + STATE.date);
    await renderAll().catch(err => debug('Render error: ' + err.message));
  });

  const next = $('#nextDay');
  if (next) next.addEventListener('click', async () => {
    const d = new Date(STATE.date);
    d.setDate(d.getDate() + 1);
    STATE.date = d.toISOString().slice(0, 10);
    if (picker) picker.value = STATE.date;
    const label = $('#dateLabel');
    if (label) label.textContent = formatDateLabel(STATE.date);
    debug('Next day to ' + STATE.date);
    await renderAll().catch(err => debug('Render error: ' + err.message));
  });

  // Theme toggle
  const toggle = $('#themeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      setTheme(STATE.theme === 'light' ? 'dark' : 'light');
      DB.set(KS.CONFIG, { theme: STATE.theme, accent: STATE.accent })
        .catch(e => debug('Config save error: ' + e.message));
    });
  }

  // Theme selector (settings tab)
  const themeSel = $('#themeSel');
  if (themeSel) {
    themeSel.addEventListener('change', e => {
      setTheme(e.target.value);
      DB.set(KS.CONFIG, { theme: STATE.theme, accent: STATE.accent })
        .catch(e => debug('Config save error: ' + e.message));
    });
  }

  // Accent selector (settings tab)
  const accentSel = $('#accentSel');
  if (accentSel) {
    accentSel.addEventListener('change', e => {
      setAccent(e.target.value);
      DB.set(KS.CONFIG, { theme: STATE.theme, accent: STATE.accent })
        .catch(e => debug('Config save error: ' + e.message));
    });
  }

  // Print
  const printBtn = $('#printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  debug('Controls wired');
}

// -------- Clock (optional small helper)
function startClock() {
  function tick() {
    const now = new Date();
    const s = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tw = $('#timeWeather');
    if (tw) tw.textContent = s; // room for weather later
  }
  tick();
  setInterval(tick, 60_000);
  debug('Clock started');
}

// -------- Init
async function init() {
  const cfg = await DB.get(KS.CONFIG).catch(e => {
    debug('Config load error: ' + e.message);
    return null;
  });
  setTheme(cfg?.theme || STATE.theme || 'dark');
  setAccent(cfg?.accent || STATE.accent || 'blue');

  const label = $('#dateLabel');
  if (label) label.textContent = formatDateLabel(STATE.date);
  const picker = $('#datePicker');
  if (picker) picker.value = STATE.date;

  await wireControls();
  startClock();

  await renderAll().catch(e => debug('Render error: ' + e.message));
  debug('Init complete');
}

window.addEventListener('DOMContentLoaded', init);
