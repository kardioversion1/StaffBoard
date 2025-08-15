import { $, $$, debug } from './utils.js';
import { DB, KS } from './db.js';
import { STATE } from './state.js';
import { renderAll } from './render.js';

// -------- UI helpers
function setTheme(theme){
  STATE.theme = theme;
  document.documentElement.dataset.theme = (theme === 'light') ? 'light' : 'dark';
  $('#themeToggle').textContent = theme === 'light' ? 'Dark Mode' : 'Light Mode';
  debug('Theme set to ' + theme);
}
function setAccent(name){
  STATE.accent = name;
  document.documentElement.style.setProperty('--accent', {
    blue:'#0090ff', green:'#28c990', orange:'#f5a524', purple:'#b259d0', pink:'#ff5b9a'
  }[name] || '#0090ff');
  $('#accentSel').value = name;
  debug('Accent set to ' + name);
}
function formatDateLabel(iso){
  const d = new Date(iso + 'T12:00:00'); // force midday to avoid TZ roll
  return d.toLocaleDateString(undefined, { weekday:'long', month:'short', day:'numeric', year:'numeric' });
}

// -------- Event wiring
async function wireControls(){
  // Tabs
  $$('.tab').forEach(tab=>{
    tab.addEventListener('click', ()=>{
      $$('.tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const name = tab.dataset.tab;
      $('#tab-main').style.display = (name === 'main') ? '' : 'none';
      $('#tab-settings').style.display = (name === 'settings') ? '' : 'none';
    });
  });

  // Date controls
  const picker = $('#datePicker');
  picker.value = STATE.date;
  picker.addEventListener('change', async (e)=>{
    STATE.date = e.target.value;
    $('#dateLabel').textContent = formatDateLabel(STATE.date);
    debug('Date changed to ' + STATE.date);
    await renderAll().catch(err => debug('Render error: ' + err.message));
  });
  $('#prevDay').addEventListener('click', async ()=>{
    const d = new Date(STATE.date); d.setDate(d.getDate() - 1);
    STATE.date = d.toISOString().slice(0,10);
    picker.value = STATE.date;
    $('#dateLabel').textContent = formatDateLabel(STATE.date);
    debug('Prev day to ' + STATE.date);
    await renderAll().catch(err => debug('Render error: ' + err.message));
  });
  $('#nextDay').addEventListener('click', async ()=>{
    const d = new Date(STATE.date); d.setDate(d.getDate() + 1);
    STATE.date = d.toISOString().slice(0,10);
    picker.value = STATE.date;
    $('#dateLabel').textContent = formatDateLabel(STATE.date);
    debug('Next day to ' + STATE.date);
    await renderAll().catch(err => debug('Render error: ' + err.message));
  });

  // Theme toggle
  $('#themeToggle').addEventListener('click', ()=>{
    setTheme(STATE.theme === 'light' ? 'dark' : 'light');
    DB.set(KS.CONFIG, { theme: STATE.theme, accent: STATE.accent })
      .catch(e => debug('Config save error: ' + e.message));
  });

  // Accent selector (settings tab)
  $('#accentSel').addEventListener('change', (e)=>{
    setAccent(e.target.value);
    DB.set(KS.CONFIG, { theme: STATE.theme, accent: STATE.accent })
      .catch(e => debug('Config save error: ' + e.message));
  });

  // Print
  $('#printBtn').addEventListener('click', ()=> window.print());
  debug('Controls wired');
}

// -------- Clock (optional small helper)
function startClock(){
  function tick(){
    const now = new Date();
    const s = now.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    $('#timeWeather').textContent = s; // room for weather later
  }
  tick();
  setInterval(tick, 60_000);
  debug('Clock started');
}

// -------- Init
async function init(){
  const cfg = await DB.get(KS.CONFIG).catch(e => {
    debug('Config load error: ' + e.message);
    return null;
  });
  setTheme(cfg?.theme || STATE.theme || 'dark');
  setAccent(cfg?.accent || STATE.accent || 'blue');

  $('#dateLabel').textContent = formatDateLabel(STATE.date);
  $('#datePicker').value = STATE.date;

  await wireControls();
  startClock();

  await renderAll().catch(e => debug('Render error: ' + e.message));
  debug('Init complete');
}
window.addEventListener('DOMContentLoaded', init);
