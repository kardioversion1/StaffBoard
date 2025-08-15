
import { $, nurseTile } from './utils.js';
import { DB, KS } from './db.js';
import { STATE, getById } from './state.js';

export async function renderAll(){
  await renderMain();
  await renderPending();
  renderSettings();
}

export async function renderMain(){
  const act = await DB.get(KS.ACTIVE(STATE.date, STATE.shift)) || {zones:Object.fromEntries(STATE.zones.map(z=>[z,[]]))};
  const zc = $('#zoneContainer');
  zc.innerHTML='';
  STATE.zones.forEach(z=>{
    zc.appendChild(renderZone(z, act.zones[z]||[]));
  });
}

function renderZone(name, assignments){
  const wrap=document.createElement('div');
  wrap.className='zone-card';
  wrap.innerHTML=`<div class="zone-title"><span class="name">${name}</span></div><div class="zone-body"></div>`;
  const body=wrap.querySelector('.zone-body');
  assignments.forEach(a=>{
    const div=document.createElement('div');
    div.className='slot';
    div.innerHTML=nurseTile(getById(a.nurseId));
    body.appendChild(div);
  });
  return wrap;
}

export async function renderPending(){
  const nextShift = STATE.shift==='day'?'night':'day';
  const p = await DB.get(KS.PENDING(STATE.date, nextShift)) || {zones:Object.fromEntries(STATE.zones.map(z=>[z,[]]))};
  renderRoster();
  ['charge','triage'].forEach(role=>renderRoleDrop(role,p,nextShift));
  renderPendingZones(p,nextShift);
}

function renderRoster(){
  const q = ($('#rosterSearch').value||'').toLowerCase();
  const sort = $('#rosterSort').value;
  const items = STATE.staff.filter(s=>!q || s.name.toLowerCase().includes(q) || String(s.id).includes(q) || String(s.rf||'').includes(q));
  items.sort((a,b)=>{
    if(sort==='name') return a.name.localeCompare(b.name);
    if(sort==='class') return (a.class||'').localeCompare(b.class||'') || a.name.localeCompare(b.name);
    if(sort==='id') return String(a.id).localeCompare(String(b.id));
    return 0;
  });
  const roster = $('#pendingRoster');
  roster.innerHTML='';
  items.forEach(s=>{
    const it=document.createElement('div');
    it.className='item';
    it.textContent=`${s.name} (ID ${s.id}${s.rf?(' • RF '+s.rf):''})`;
    it.setAttribute('draggable','true');
    it.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', s.id); e.dataTransfer.effectAllowed='move'; });
    roster.appendChild(it);
  });
}

function renderRoleDrop(role,p,nextShift){
  const el = document.querySelector(`.slot[data-pending="${role}"]`);
  el.ondragenter = e=>{ e.preventDefault(); el.classList.add('drop-hover'); };
  el.ondragover  = e=>{ e.preventDefault(); e.dataTransfer.dropEffect='move'; };
  el.ondragleave = ()=> el.classList.remove('drop-hover');
  el.ondrop = async e=>{
    e.preventDefault(); el.classList.remove('drop-hover');
    const id = e.dataTransfer.getData('text/plain'); if(!id) return;
    p[role] = {nurseId:id}; await DB.set(KS.PENDING(STATE.date, nextShift), p);
    renderPending();
  };
  const nurse = getById(p[role]?.nurseId||'');
  el.innerHTML = `<span class="pill">${role[0].toUpperCase()+role.slice(1)}</span> ${nurse? nurseTile(nurse):''}`;
}

function renderPendingZones(p,nextShift){
  const container = $('#pendingZones'); container.innerHTML='';
  STATE.zones.forEach(z=>{
    container.appendChild(pendingZoneCard(z,p,nextShift));
  });
}

function pendingZoneCard(z,p,nextShift){
  const card=document.createElement('div'); card.className='zone-card';
  card.innerHTML=`<div class="zone-title"><span class="name">${z}</span></div><div class="zone-body drop" data-zone="${z}"></div>`;
  const body=card.querySelector('.zone-body');
  (p.zones[z]||[]).forEach(a=>{
    const d=document.createElement('div'); d.className='slot'; d.innerHTML=nurseTile(getById(a.nurseId)); body.appendChild(d);
  });
  body.ondragenter = e=>{ e.preventDefault(); body.classList.add('drop-hover'); };
  body.ondragover  = e=>{ e.preventDefault(); e.dataTransfer.dropEffect='move'; };
  body.ondragleave = ()=> body.classList.remove('drop-hover');
  body.ondrop = async e=>{
    e.preventDefault(); body.classList.remove('drop-hover');
    const id = e.dataTransfer.getData('text/plain'); if(!id) return;
    Object.keys(p.zones).forEach(k=> p.zones[k] = (p.zones[k]||[]).filter(x=>x.nurseId!==id));
    p.zones[z] = p.zones[z]||[]; p.zones[z].push({nurseId:id});
    await DB.set(KS.PENDING(STATE.date, nextShift), p);
    renderPending();
  };
  return card;
}

export function renderSettings(){
  const nl = $('#nurseList'); nl.innerHTML='';
  STATE.staff.forEach(s=>{
    const it=document.createElement('div'); it.className='item';
    it.textContent=`${s.name} • ${s.class||'other'} • RF ${s.rf||'—'} • id: ${s.id}`;
    nl.appendChild(it);
  });
}
