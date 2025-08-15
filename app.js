
import { $, $$ } from './utils.js';
import { DB, KS } from './db.js';
import { STATE } from './state.js';
import { renderAll, renderPending } from './render.js';

const ACCENTS={
  blue:'#0090ff',
  green:'#28c990',
  orange:'#f5a524',
  purple:'#b259d0',
  pink:'#ff5b9a'
};

function applyInterface(){
  document.documentElement.dataset.theme=STATE.theme;
  document.documentElement.style.setProperty('--accent', ACCENTS[STATE.accent]||ACCENTS.blue);
}

function saveConfig(){
  return DB.set(KS.CONFIG, {
    date: STATE.date,
    shift: STATE.shift,
    locked: STATE.locked,
    zones: STATE.zones,
    pin: STATE.pin,
    theme: STATE.theme,
    accent: STATE.accent
  });
}

function updateDateLabel(){
  const d = new Date(STATE.date);
  const opts = { weekday:'short', month:'short', day:'numeric', year:'numeric' };
  $('#dateLabel').textContent = `${d.toLocaleDateString(undefined, opts)} — ${STATE.shift === 'day' ? 'Day' : 'Night'}`;
}

function updateLockUI(){
  $('#lockState').textContent = STATE.locked ? 'Locked' : 'Unlocked';
  $('#unlockBtn').textContent = STATE.locked ? 'Unlock' : 'Lock';
}


function bindTabs(){
  $$('.tab').forEach(t=>t.addEventListener('click',()=>{
    $$('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    $('#tab-main').style.display=t.dataset.tab==='main'?'block':'none';
    $('#tab-pending').style.display=t.dataset.tab==='pending'?'block':'none';
    $('#tab-settings').style.display=t.dataset.tab==='settings'?'block':'none';
  }));
}

function bindPending(){
  $('#rosterSearch').oninput = renderPending;
  $('#rosterSort').onchange = renderPending;
}

function bindToolbar(){
  $('#prevDay').onclick = async ()=>{
    const d = new Date(STATE.date); d.setDate(d.getDate()-1);
    STATE.date = d.toISOString().slice(0,10);
    $('#datePicker').value = STATE.date;
    updateDateLabel();
    await saveConfig();
    renderAll();
  };
  $('#nextDay').onclick = async ()=>{
    const d = new Date(STATE.date); d.setDate(d.getDate()+1);
    STATE.date = d.toISOString().slice(0,10);
    $('#datePicker').value = STATE.date;
    updateDateLabel();
    await saveConfig();
    renderAll();
  };
  $('#datePicker').onchange = async e=>{
    STATE.date = e.target.value || STATE.date;
    updateDateLabel();
    await saveConfig();
    renderAll();
  };
  $('#shiftSel').onchange = async e=>{
    STATE.shift = e.target.value;
    updateDateLabel();
    await saveConfig();
    renderAll();
  };
  $('#unlockBtn').onclick = async ()=>{
    STATE.locked = !STATE.locked;
    updateLockUI();
    await saveConfig();
  };
  $('#startNewShiftBtn').onclick = async ()=>{
    const empty = { zones: Object.fromEntries(STATE.zones.map(z=>[z,[]])) };
    await DB.set(KS.ACTIVE(STATE.date, STATE.shift), empty);
    renderAll();
  };
}

function bindInterface(){
  $('#themeSel').value = STATE.theme;
  $('#accentSel').value = STATE.accent;
  $('#themeSel').onchange = async e=>{
    STATE.theme = e.target.value;
    applyInterface();
    await saveConfig();
  };
  $('#accentSel').onchange = async e=>{
    STATE.accent = e.target.value;
    applyInterface();
    await saveConfig();
  };
}


async function init(){
  const cfg=await DB.get(KS.CONFIG); if(cfg) Object.assign(STATE,cfg);
  const staff=await DB.get(KS.STAFF); if(staff) STATE.staff=staff;
  $('#datePicker').value=STATE.date; $('#shiftSel').value=STATE.shift;

  applyInterface();
  updateDateLabel();
  updateLockUI();
  bindTabs();
  bindPending();
  bindToolbar();
  bindInterface();

  bindTabs(); bindPending();

  renderAll();
}
window.addEventListener('DOMContentLoaded', init);

/* seed minimal staff if empty to test DnD */
(async ()=>{
  if (!(await DB.get(KS.STAFF))) {
    const seed=[{id:'100',name:'Alex Reed',rf:'55222172',class:'jewish'},
                {id:'200',name:'Zara Zuniga',rf:'24426223',class:'float'},
                {id:'300',name:'Ray Shah',rf:'09380780',class:'float'}];
    await DB.set(KS.STAFF, seed); STATE.staff = seed;
  }
})();
