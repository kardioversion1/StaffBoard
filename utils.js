
+export const $ = s => document.querySelector(s);
+export const $$ = s => Array.from(document.querySelectorAll(s));
+export const pad2 = n => String(n).padStart(2,'0');
+export const todayISO = () => new Date().toISOString().slice(0,10);
+
+export function badge(c){
+  const m={jewish:'j',travel:'t',float:'f',other:'o'};
+  const code=m[c]||'o';
+  const map={j:'J',t:'T',f:'F',o:'O'};
+  return `<span class="badge ${code}">${map[code]}</span>`;
+}
+
+export function nurseTile(n){
+  if(!n) return '<div class="name">—</div>';
+  return `<div class="tile"><div class="name">${n.name}</div><div class="rf">${n.rf?('RF '+n.rf):''}</div></div>`;
+}
 
EOF
)
