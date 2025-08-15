
import { $, $$ } from './utils.js';
import { DB, KS } from './db.js';
import { STATE } from './state.js';
import { renderAll, renderPending } from './render.js';

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast?latitude=38.2527&longitude=-85.7585&current_weather=true&temperature_unit=fahrenheit';
const WEATHER_ICONS = {
  0:'☀️',1:'🌤️',2:'⛅',3:'☁️',
  45:'🌫️',48:'🌫️',
  51:'🌦️',53:'🌦️',55:'🌦️',
  56:'🌧️',57:'🌧️',
  61:'🌧️',63:'🌧️',65:'🌧️',
  66:'🌧️',67:'🌧️',
  71:'🌨️',73:'🌨️',75:'❄️',77:'🌨️',
  80:'🌦️',81:'🌧️',82:'🌧️',
  85:'🌨️',86:'🌨️',
  95:'⛈️',96:'⛈️',99:'⛈️'
};
let weatherDisplay='';

async function fetchWeather(){
  try{
    const res=await fetch(WEATHER_API);
    const data=await res.json();
    const w=data.current_weather;
    const icon=WEATHER_ICONS[w.weathercode]||'';
    weatherDisplay=`${icon} ${Math.round(w.temperature)}°F`;
  }catch(err){
    console.error('weather',err);
    weatherDisplay='';
  }
  renderTimeWeather();
}

function renderTimeWeather(){
  const time=new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  $('#timeWeather').textContent = weatherDisplay ? `${time} ${weatherDisplay}` : time;
}

function saveConfig(){
  return DB.set(KS.CONFIG, {
    date: STATE.date,
    shift: STATE.shift,
    zones: STATE.zones,
    pin: STATE.pin
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
  };
  $('#startNewShiftBtn').onclick = async ()=>{
    const empty = { zones: Object.fromEntries(STATE.zones.map(z=>[z,[]])) };
    await DB.set(KS.ACTIVE(STATE.date, STATE.shift), empty);
    renderAll();
  };
}


async function init(){
  const cfg=await DB.get(KS.CONFIG); if(cfg) Object.assign(STATE,cfg);
  const staff=await DB.get(KS.STAFF); if(staff) STATE.staff=staff;
  $('#datePicker').value=STATE.date; $('#shiftSel').value=STATE.shift;

  updateDateLabel();
  updateLockUI();
  bindTabs();
  bindPending();
  bindToolbar();

  bindTabs(); bindPending();

  renderTimeWeather();
  fetchWeather();
  setInterval(renderTimeWeather, 60*1000);
  setInterval(fetchWeather, 30*60*1000);

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
