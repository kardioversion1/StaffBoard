/* bundled board script */
(function(){
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const pad2 = n => String(n).padStart(2,'0');
  const todayISO = () => new Date().toISOString().slice(0,10);
  function badge(c){
    const m={jewish:'j',travel:'t',float:'f',other:'o'};
    const code=m[c]||'o';
    const map={j:'J',t:'T',f:'F',o:'O'};
    return `<span class="badge ${code}">${map[code]}</span>`;
  }
  function nurseTile(n){
    if(!n) return '<div class="name">—</div>';
    return `<div class="tile"><div class="name">${n.name}</div><div class="rf">${n.rf?('RF '+n.rf):''}</div></div>`;
  }
  const DB_NAME='edb-v28', STORE='kv';
  let dbp;
  function getDB(){
    if(dbp) return dbp;
    dbp=new Promise((res,rej)=>{
      const r=indexedDB.open(DB_NAME,1);
      r.onupgradeneeded=e=>e.target.result.createObjectStore(STORE);
      r.onsuccess=e=>res(e.target.result);
      r.onerror=e=>rej(e.target.error);
    });
    return dbp;
  }
  async function dbGet(key){
    const db=await getDB();
    return new Promise((res,rej)=>{
      const r=db.transaction(STORE,'readonly').objectStore(STORE).get(key);
      r.onsuccess=()=>res(r.result);
      r.onerror=()=>rej(r.error);
    });
  }
  async function dbSet(key,val){
    const db=await getDB();
    return new Promise((res,rej)=>{
      const r=db.transaction(STORE,'readwrite').objectStore(STORE).put(val,key);
      r.onsuccess=()=>res(true);
      r.onerror=()=>rej(r.error);
    });
  }
  const DB={get:dbGet,set:dbSet};
  const KS={CONFIG:'config',STAFF:'staff',ACTIVE:(d,s)=>`active:${d}:${s}`,PENDING:(d,s)=>`pending:${d}:${s}`};
  const STATE={date:todayISO(),shift:'day',locked:true,zones:['Beds 1–3','Beds 4–7','Beds 8–10','Fast Track'],staff:[],pin:'4911'};
  const getById=id=>STATE.staff.find(s=>s.id===id);
  async function renderAll(){ await renderMain(); await renderPending(); renderSettings(); }
  async function renderMain(){
    const act=await DB.get(KS.ACTIVE(STATE.date,STATE.shift))||{zones:Object.fromEntries(STATE.zones.map(z=>[z,[]]))};
    ['charge','triage'].forEach(role=>{
      const el=document.querySelector(`.slot[data-role="${role}"]`);
      if(el) el.innerHTML=nurseTile(getById(act[role]?.nurseId));
    });
    const zc=$('#zoneContainer');
    zc.innerHTML='';
    STATE.zones.forEach(z=>{ zc.appendChild(renderZone(z,act.zones[z]||[])); });
  }
  function renderZone(name,assignments){
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
  async function renderPending(){
    const nextShift=STATE.shift==='day'?'night':'day';
    const p=await DB.get(KS.PENDING(STATE.date,nextShift))||{zones:Object.fromEntries(STATE.zones.map(z=>[z,[]]))};
    renderRoster();
    ['charge','triage'].forEach(role=>renderRoleDrop(role,p,nextShift));
    renderPendingZones(p,nextShift);
  }
  function renderRoster(){
    const q=($('#rosterSearch').value||'').toLowerCase();
    const sort=$('#rosterSort').value;
    const items=STATE.staff.filter(s=>!q||s.name.toLowerCase().includes(q)||String(s.id).includes(q)||String(s.rf||'').includes(q));
    items.sort((a,b)=>{
      if(sort==='name') return a.name.localeCompare(b.name);
      if(sort==='class') return (a.class||'').localeCompare(b.class||'')||a.name.localeCompare(b.name);
      if(sort==='id') return String(a.id).localeCompare(String(b.id));
      return 0;
    });
    const roster=$('#pendingRoster');
    roster.innerHTML='';
    items.forEach(s=>{
      const it=document.createElement('div');
      it.className='item';
      it.textContent=`${s.name} (ID ${s.id}${s.rf?(' • RF '+s.rf):''})`;
      it.setAttribute('draggable','true');
      it.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',s.id);e.dataTransfer.effectAllowed='move';});
      roster.appendChild(it);
    });
  }
  function renderRoleDrop(role,p,nextShift){
    const el=document.querySelector(`.slot[data-pending="${role}"]`);
    el.ondragenter=e=>{e.preventDefault();el.classList.add('drop-hover');};
    el.ondragover=e=>{e.preventDefault();e.dataTransfer.dropEffect='move';};
    el.ondragleave=()=>el.classList.remove('drop-hover');
    el.ondrop=async e=>{
      e.preventDefault();el.classList.remove('drop-hover');
      const id=e.dataTransfer.getData('text/plain'); if(!id) return;
      p[role]={nurseId:id}; await DB.set(KS.PENDING(STATE.date,nextShift),p);
      renderPending();
    };
    const nurse=getById(p[role]?.nurseId||'');
    el.innerHTML=`<span class="pill">${role[0].toUpperCase()+role.slice(1)}</span> ${nurse?nurseTile(nurse):''}`;
  }
  function renderPendingZones(p,nextShift){
    const container=$('#pendingZones'); container.innerHTML='';
    STATE.zones.forEach(z=>{ container.appendChild(pendingZoneCard(z,p,nextShift)); });
  }
  function pendingZoneCard(z,p,nextShift){
    const card=document.createElement('div'); card.className='zone-card';
    card.innerHTML=`<div class="zone-title"><span class="name">${z}</span></div><div class="zone-body drop" data-zone="${z}"></div>`;
    const body=card.querySelector('.zone-body');
    (p.zones[z]||[]).forEach(a=>{
      const d=document.createElement('div'); d.className='slot'; d.innerHTML=nurseTile(getById(a.nurseId)); body.appendChild(d);
    });
    body.ondragenter=e=>{e.preventDefault();body.classList.add('drop-hover');};
    body.ondragover=e=>{e.preventDefault();e.dataTransfer.dropEffect='move';};
    body.ondragleave=()=>body.classList.remove('drop-hover');
    body.ondrop=async e=>{
      e.preventDefault();body.classList.remove('drop-hover');
      const id=e.dataTransfer.getData('text/plain'); if(!id) return;
      Object.keys(p.zones).forEach(k=>p.zones[k]=(p.zones[k]||[]).filter(x=>x.nurseId!==id));
      p.zones[z]=p.zones[z]||[]; p.zones[z].push({nurseId:id});
      await DB.set(KS.PENDING(STATE.date,nextShift),p);
      renderPending();
    };
    return card;
  }
  function renderSettings(){
    const nl=$('#nurseList'); nl.innerHTML='';
    STATE.staff.forEach(s=>{
      const it=document.createElement('div'); it.className='item';
      it.textContent=`${s.name} • ${s.class||'other'} • RF ${s.rf||'—'} • id: ${s.id}`;
      nl.appendChild(it);
    });
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
    const search=$('#rosterSearch'); if(search) search.oninput=renderPending;
    const sort=$('#rosterSort'); if(sort) sort.onchange=renderPending;
  }
  async function init(){
    const cfg=await DB.get(KS.CONFIG); if(cfg) Object.assign(STATE,cfg);
    const staff=await DB.get(KS.STAFF); if(staff) STATE.staff=staff;
    const dp=$('#datePicker'); if(dp) dp.value=STATE.date;
    const sh=$('#shiftSel'); if(sh) sh.value=STATE.shift;
    bindTabs(); bindPending();
    renderAll();
  }
  window.addEventListener('DOMContentLoaded',init);
  (async()=>{
    if(!(await DB.get(KS.STAFF))){
      const seed=[
        {id:'100',name:'Alex Reed',rf:'55222172',class:'jewish'},
        {id:'200',name:'Zara Zuniga',rf:'24426223',class:'float'},
        {id:'300',name:'Ray Shah',rf:'09380780',class:'float'}
      ];
      await DB.set(KS.STAFF,seed); STATE.staff=seed;
    }
  })();
})();
