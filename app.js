
+import { $, $$ } from './utils.js';
+import { DB, KS } from './db.js';
+import { STATE } from './state.js';
+import { renderAll, renderPending } from './render.js';
+
+function bindTabs(){
+  $$('.tab').forEach(t=>t.addEventListener('click',()=>{
+    $$('.tab').forEach(x=>x.classList.remove('active'));
+    t.classList.add('active');
+    $('#tab-main').style.display=t.dataset.tab==='main'?'block':'none';
+    $('#tab-pending').style.display=t.dataset.tab==='pending'?'block':'none';
+    $('#tab-settings').style.display=t.dataset.tab==='settings'?'block':'none';
+  }));
+}
+
+function bindPending(){
+  $('#rosterSearch').oninput = renderPending;
+  $('#rosterSort').onchange = renderPending;
+}
+
+async function init(){
+  const cfg=await DB.get(KS.CONFIG); if(cfg) Object.assign(STATE,cfg);
+  const staff=await DB.get(KS.STAFF); if(staff) STATE.staff=staff;
+  $('#datePicker').value=STATE.date; $('#shiftSel').value=STATE.shift;
+  bindTabs(); bindPending();
+  renderAll();
+}
+window.addEventListener('DOMContentLoaded', init);
+
+/* seed minimal staff if empty to test DnD */
+(async ()=>{
+  if (!(await DB.get(KS.STAFF))) {
+    const seed=[{id:'100',name:'Alex Reed',rf:'55222172',class:'jewish'},
+                {id:'200',name:'Zara Zuniga',rf:'24426223',class:'float'},
+                {id:'300',name:'Ray Shah',rf:'09380780',class:'float'}];
+    await DB.set(KS.STAFF, seed); STATE.staff = seed;
+  }
+})();
 
EOF
)
