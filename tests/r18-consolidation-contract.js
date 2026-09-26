const fs=require('fs');const assert=(c,m)=>{if(!c)throw new Error(m)};
const sh=fs.readFileSync('assets/portal-shell.js','utf8'), st=fs.readFileSync('assets/edition1-store.js','utf8'), reg=fs.readFileSync('assets/clean-page-registry.js','utf8'), api=fs.readFileSync('netlify/functions/edition1-data.js','utf8'), mr=fs.readFileSync('assets/master-reference.js','utf8'), rt=fs.readFileSync('assets/edition1-business-runtime.js','utf8');
assert(sh.includes('Master Data & Partners'),'Sidebar must expose consolidated Master Data & Partners.');
assert(!sh.includes("item('station-360.html','Station Profile / 360','⌾')]),\n  group('READINESS & STANDARDS'"),'Station Profile must not remain redundant top-level beside Airport Network.');
['airlines','groundHandlers','serviceAlignments'].forEach(k=>{assert(st.includes(k+':[]'),`Store missing ${k}`);assert(api.includes(`'${k}'`),`API missing ${k}`)});
assert(reg.includes('Airline & Partner')&&reg.includes('Ground Handling Agent')&&reg.includes('Partner Service Alignment'),'Master Data partner tabs missing.');
assert(mr.includes("GEStore.hydrate(['airlines','groundHandlers','serviceAlignments'])"),'Partner master must hydrate Firestore collections.');
assert(rt.includes('const GEO={CGK:'),'Airport map must provide coordinate fallback for known station master rows without coordinates.');
console.log('R18_CONSOLIDATION_CONTRACT_PASS');
