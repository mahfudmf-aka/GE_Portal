const fs=require('fs');
const rt=fs.readFileSync('assets/edition1-business-runtime.js','utf8');
const css=fs.readFileSync('assets/portal.css','utf8');
const reg=fs.readFileSync('assets/clean-page-registry.js','utf8');
function ok(v,m){if(!v)throw new Error(m)}
ok(rt.includes('R32 — Standalone Airport Map marker renderer'),'canonical standalone airport renderer missing');
ok(rt.includes('mapProviderTypeR32')&&rt.includes('Ground Handling Agent'),'provider type filter missing');
ok(rt.includes("provider-active")&&rt.includes("provider-expired"),'provider marker state missing');
ok(rt.includes('r27-selected-pointer'),'selected marker pointer missing');
ok(css.includes('.r32-marker.provider-active')&&css.includes('.r32-marker.provider-expired'),'provider marker colors missing');
ok(reg.includes('edition1-business-runtime.js?v=r32')&&reg.includes('portal.css?v=r32'),'map cache bust missing');
console.log('R27_AIRPORT_MARKER_CONTRACT_PASS');
