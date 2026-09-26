const fs=require('fs');
const store=fs.readFileSync('assets/edition1-store.js','utf8');
const api=fs.readFileSync('netlify/functions/edition1-data.js','utf8');
function must(v,m){if(!v)throw new Error(m)}
must(store.includes("CACHE_DB='GE_E1_CACHE_V28'"),'persistent IndexedDB cache missing');
must(store.includes("function cacheAllowed(){return !!String(session().uid"),'Authenticated cache policy missing');
must(store.includes('/api/edition1-data?manifest=1'),'manifest check missing');
must(store.includes('cached data remains active'),'offline/quota cache fallback missing');
must(store.includes('indexedDB.open'),'IndexedDB cache missing');
must(!/localStorage\.(getItem|setItem|removeItem)/.test(store),'business cache must not use localStorage');
must(api.includes("doc('cacheState')"),'cacheState metadata missing');
must(api.includes('FieldValue.increment(1)'),'cache version bump missing');
must(api.includes("queryStringParameters?.manifest"),'manifest endpoint missing');
console.log('R28_FIRESTORE_CACHE_CONTRACT_PASS');
