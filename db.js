
import { debug } from './utils.js';

const DB_NAME='edb-v28', STORE='kv';
let dbp;
function getDB(){
  if(dbp) return dbp;
  dbp=new Promise((res,rej)=>{
    const r=indexedDB.open(DB_NAME,1);
    r.onupgradeneeded=e=>e.target.result.createObjectStore(STORE);
    r.onsuccess=e=>res(e.target.result);
    r.onerror=e=>{debug('DB open error: '+e.target.error);rej(e.target.error);};
  });
  return dbp;
}
export async function get(key){
  const db=await getDB();
  return new Promise((res,rej)=>{
    const r=db.transaction(STORE,'readonly').objectStore(STORE).get(key);
    r.onsuccess=()=>res(r.result);
    r.onerror=()=>{debug('DB get error: '+r.error);rej(r.error);};
  });
}
export async function set(key,val){
  const db=await getDB();
  return new Promise((res,rej)=>{
    const r=db.transaction(STORE,'readwrite').objectStore(STORE).put(val,key);
    r.onsuccess=()=>res(true);
    r.onerror=()=>{debug('DB set error: '+r.error);rej(r.error);};
  });
}
export const DB={get,set};
export const KS={CONFIG:'config',STAFF:'staff',ACTIVE:d=>`active:${d}`};
