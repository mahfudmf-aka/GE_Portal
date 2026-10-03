const fs=require('fs'),assert=require('assert');
const M=fs.readFileSync('assets/master-reference.js','utf8');
assert(M.includes("host.dataset.saving='0';host.innerHTML="),'modal must reset stale saving state before every open');
assert(M.includes("host.dataset.saving='1'"),'modal save must enter busy state');
assert(M.includes('save.disabled=true'),'modal save must disable duplicate submission');
assert(M.includes('role="status" aria-live="polite"'),'modal status must be accessible');
console.log('R38_2_MASTER_EDIT_MODAL_CONTRACT_PASS');
