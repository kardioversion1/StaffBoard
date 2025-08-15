<import { $, nurseTile, debug } from './utils.js';
import { DB, KS } from './db.js';
import { STATE, getById } from './state.js';

export async function renderAll() {
  debug('renderAll start');
  await renderMain().catch(e => debug('renderMain error: ' + e.message));
  renderSettings();
  debug('renderAll done');
}

export async function renderMain() {
  let act;
  try {
    act = await DB.get(KS.ACTIVE(STATE.date));
  } catch (e) {
    debug('Active load error: ' + e.message);
  }
  act = act || { zones: Object.fromEntries(STATE.zones.map(z => [z, []])) };

  // Charge / Triage roles
  ['charge', 'triage'].forEach(role => {
    const el = document.querySelector(`.slot[data-role="${role}"]`);
    if (el) {
      el.innerHTML = nurseTile(getById(act[role]?.nurseId));
      el.onclick = async () => {
        const id = prompt(`Nurse ID for ${role}:`, act[role]?.nurseId || '');
        if (!id) return;
        act[role] = { nurseId: id };
        await DB.set(KS.ACTIVE(STATE.date), act).catch(e => debug('Role save error: ' + e.message));
        renderMain().catch(e => debug('renderMain error: ' + e.message));
      };
    } else {
      debug(`Role slot not found for ${role}`);
    }
  });

  // Zones
  const zc = $('#zoneContainer');
  if (!zc) {
    debug('zoneContainer missing');
    return;
  }
  zc.innerHTML = '';
  STATE.zones.forEach(z => {
    zc.appendChild(renderZone(z, act.zones[z] || []));
  });

  // Add-to-zone click handlers
  zc.querySelectorAll('.zone-body').forEach(body => {
    body.onclick = async () => {
      const zone = body.dataset.zone;
      const id = prompt(`Nurse ID for ${zone}:`);
      if (!id) return;
      act.zones[zone] = act.zones[zone] || [];
      act.zones[zone].push({ nurseId: id });
      await DB.set(KS.ACTIVE(STATE.date), act).catch(e => debug('Zone save error: ' + e.message));
      renderMain().catch(e => debug('renderMain error: ' + e.message));
    };
  });
}

function renderZone(name, assignments) {
  const wrap = document.createElement('div');
  wrap.className = 'zone-card';
  wrap.innerHTML = `
    <div class="zone-title"><span class="name">${name}</span></div>
    <div class="zone-body" data-zone="${name}"></div>
  `;
  const body = wrap.querySelector('.zone-body');
  assignments.forEach(a => {
    const div = document.createElement('div');
    div.className = 'slot';
    div.innerHTML = nurseTile(getById(a.nurseId));
    body.appendChild(div);
  });
  return wrap;
}

export function renderSettings() {
  const nl = $('#nurseList');
  if (!nl) {
    debug('nurseList missing');
    return;
  }
  nl.innerHTML = '';
  (STATE.staff || []).forEach(s => {
    const it = document.createElement('div');
    it.className = 'item';
    it.textContent = `${s.name} • ${s.class || 'other'} • RF ${s.rf || '—'} • id: ${s.id}`;
    nl.appendChild(it);
  });
  debug('Settings rendered');
}
