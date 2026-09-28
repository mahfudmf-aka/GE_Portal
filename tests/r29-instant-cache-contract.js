const fs=require('fs');
function need(c,m){if(!c)throw new Error(m)}
const store=fs.readFileSync('assets/edition1-store.js','utf8');
const reg=fs.readFileSync('assets/clean-page-registry.js','utf8');
const app=fs.readFileSync('app.html','utf8');
need(store.includes('stale-while-revalidate'),'R29 cache must return before network validation');
need(store.includes("Promise.resolve().then(async()=>"),'R29 background refresh missing');
need(store.includes("function cacheAllowed(){return !!String(session().uid"),'R29 authenticated cache must include Super Admin');
need(reg.includes('edition1-store.js?v=r32'),'registry still requests stale store revision');
need(!app.includes("attempt(src.split('?')[0],false)")&&app.includes('script.src=src'),'asset loader must use only the canonical versioned URL');
need(app.includes('edition1-business-runtime.js')&&app.includes('?45000:20000'),'large runtime must have a bounded load window');
console.log('R29_INSTANT_CACHE_CONTRACT_PASS');
