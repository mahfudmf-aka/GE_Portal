/* Edition 1 Firebase Store — Firestore is the only business-data source of truth.
 * This object is an in-memory working set only; it is never seeded from local data
 * and is never persisted to localStorage. All reads/writes go through /api/edition1-data.
 */
(function(){
  'use strict';
  const state={
    airports:[],initiatives:[],news:[],touchpoints:[],documents:[],events:[],
    flightSchedule:[],loungePurchases:[],loungeVisitors:[],stationMaterials:[],boSpaces:[],serviceProcurement:[],
    airportSystems:[],skyPriority:[],touchpointStandards:[],gasoMaster:[],gasoServiceSupport:[],gasoPlanningService:[],
    personnel:[],articles:[],announcements:[],faqs:[],inbox:[],auditLogs:[],users:[],lounges:[],
    standardContent:{},portalManagerR2:{},contactMessages:[],guestbook:[]
  };
  const baseline={}; let hydrated=false; let pending=Promise.resolve();
  const MAP={events:'projectEvents',projectEvents:'projectEvents'};
  const clone=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
  function collKey(k){if(k==='portalManagerR2')return 'portalManager';return MAP[k]||k}
  function normalizeCollection(key,rows){
    if(key==='standardContent') return Array.isArray(rows)?(rows[0]||{}):{};
    if(key==='portalManagerR2') return Array.isArray(rows)?(rows[0]||{}):{};
    const out=Array.isArray(rows)?rows.map(x=>{const y={...x};if(typeof y.id==='string'&&/^\d+$/.test(y.id))y.id=Number(y.id);return y}):[];
    if(key==='events'||key==='projectEvents') return out;
    if(key==='touchpoints') return out.map(x=>typeof x==='string'?x:(x?.name||x?.title||x?.touchpoint||x));
    if(key==='documents') return out.map(x=>({...x,blobKey:x.blobKey||x.storagePath||x.documentKey||'',fileName:x.fileName||x.name||''}));
    return out;
  }
  async function token(){
    const u=await window.GXFirebase?.currentUser?.();
    if(!u) throw new Error('Authentication required.');
    return u.getIdToken();
  }
  async function apiGet(keys){
    const list=[...new Set(keys.map(collKey))];
    const t=await token();
    const r=await fetch('/api/edition1-data?collections='+encodeURIComponent(list.join(',')),{headers:{Authorization:'Bearer '+t},cache:'no-store'});
    const p=await r.json().catch(()=>({})); if(!r.ok)throw new Error(p.message||`Data request failed (${r.status}).`);
    return p.collections||{};
  }
  async function apiPost(body){
    const t=await token();
    const r=await fetch('/api/edition1-data',{method:'POST',headers:{Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify(body)});
    const p=await r.json().catch(()=>({})); if(!r.ok)throw new Error(p.message||`Save request failed (${r.status}).`); return p.result;
  }
  function indexById(rows){const m=new Map();(rows||[]).forEach(x=>m.set(String(x.id),x));return m}
  function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
  async function persistSnapshot(snapshot){
    const keys=Object.keys(snapshot);
    for(const key of keys){
      const collection=collKey(key);
      if(key==='standardContent'||key==='portalManagerR2'){
        const prev=baseline[key]||{}; const next=snapshot[key]||{};
        if(!same(prev,next)) await apiPost({collection,action:'UPDATE',id:'global',data:next});
        baseline[key]=clone(next); continue;
      }
      const prev=baseline[key]||[]; const next=snapshot[key]||[];
      const pm=indexById(prev), nm=indexById(next);
      for(const [id,row] of nm){
        if(!pm.has(id)) await apiPost({collection,action:'CREATE',id,data:row});
        else if(!same(pm.get(id),row)) await apiPost({collection,action:'UPDATE',id,data:row});
      }
      for(const id of pm.keys()) if(!nm.has(id)) await apiPost({collection,action:'DELETE',id,data:{}});
      baseline[key]=clone(next);
    }
  }
  function save(next){
    const snapshot={};
    // Only persist collections that this page actually hydrated. The runtime shares
    // one in-memory state object, so sending untouched empty arrays could otherwise
    // be interpreted as DELETE for collections that were never loaded on this page.
    for(const k of Object.keys(next||{})){
      if(!Object.prototype.hasOwnProperty.call(baseline,k)) continue;
      if(Array.isArray(next[k])||k==='standardContent'||k==='portalManagerR2')snapshot[k]=clone(next[k]);
    }
    pending=pending.then(()=>persistSnapshot(snapshot)).catch(err=>{console.error('[Edition1 Firebase Store]',err);window.dispatchEvent(new CustomEvent('gx-data-save-error',{detail:err}));throw err});
    return next;
  }
  async function hydrate(keys){
    const requested=[...new Set(keys)];
    const result=await apiGet(requested);
    for(const key of requested){
      const apiKey=collKey(key); const rows=normalizeCollection(key,result[apiKey]||[]);
      if(key==='projectEvents'){state.events=rows;baseline.events=clone(rows);} else {state[key]=rows;baseline[key]=clone(rows);}
    }
    hydrated=true;
    return state;
  }
  async function waitAuth(){
    const deadline=Date.now()+15000;
    while(!window.GXFirebase && Date.now()<deadline) await new Promise(r=>setTimeout(r,50));
    if(!window.GXFirebase) throw new Error('Firebase runtime unavailable after 15 seconds.');
    const u=await window.GXFirebase.currentUser();
    if(!u) throw new Error('Authentication required.');
    const sessionDeadline=Date.now()+10000;
    while(Date.now()<sessionDeadline){
      const s=typeof window.gxGetSession==='function'?(window.gxGetSession()||{}):window.GX_CURRENT_USER||{};
      if(s.uid && String(s.uid)===String(u.uid)) return;
      await new Promise(r=>setTimeout(r,100));
    }
  }
  window.data=state; window.GEStore={get:()=>state,save,hydrate,waitAuth,isHydrated:()=>hydrated,flush:()=>pending,source:'Firestore',projectId:window.GX_FIREBASE_CONFIG?.projectId||''};
  window.addEventListener('gx-data-save-error',e=>{if(e.detail?.message)console.error('Firestore save failed:',e.detail.message)});
})();
