
export const $ = s => document.querySelector(s);
export const $$ = s => Array.from(document.querySelectorAll(s));
export const pad2 = n => String(n).padStart(2,'0');
export const todayISO = () => new Date().toISOString().slice(0,10);

export function badge(c){
  const m={jewish:'j',travel:'t',float:'f',other:'o'};
  const code=m[c]||'o';
  const map={j:'J',t:'T',f:'F',o:'O'};
  return `<span class="badge ${code}">${map[code]}</span>`;
}

export function nurseTile(n){
  if(!n) return '<div class="name">—</div>';
  return `<div class="tile"><div class="name">${n.name}</div><div class="rf">${n.rf?('RF '+n.rf):''}</div></div>`;
}

export function debug(msg){
  const el=document.querySelector('#debugLog');
  if(!el) return;
  const div=document.createElement('div');
  div.textContent=msg;
  el.appendChild(div);
  el.scrollTop=el.scrollHeight;
}
