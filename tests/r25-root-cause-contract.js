const fs=require('fs');
const css=fs.readFileSync('assets/portal.css','utf8');
const users=fs.readFileSync('assets/user-access-p26.js','utf8');
const api=fs.readFileSync('netlify/functions/auth-update-user.js','utf8');
const asset=fs.readFileSync('assets/asset-facility-p39.js','utf8');
const runtime=fs.readFileSync('assets/edition1-business-runtime.js','utf8');
function ok(x,m){if(!x)throw new Error(m)}
ok(css.includes('R25 — canonical combobox geometry'),'dropdown canonical geometry missing');
ok(!users.includes("id=\"p26Username\" required ${isEdit?'readonly':''}"),'edit username remains readonly');
ok(users.includes('Username baru harus 3–64'),'legacy username edit validation missing');
ok(api.includes("USERNAME_EXISTS")&&api.includes("username: username || current.username"),'backend username update missing');
ok(asset.includes('config timeout')&&asset.includes('Loading Asset & Facility data'),'asset bounded config load missing');
ok(runtime.includes('AAP:[-0.3744,117.2494]')&&runtime.includes("['lounges','serviceProcurement','stationMaterials','airportSystems','facilities','assets']"),'airport marker fallback/union missing');
console.log('R25_ROOT_CAUSE_CONTRACT_PASS');
