const fs=require('fs'),assert=require('assert');
const M=fs.readFileSync('assets/master-reference.js','utf8');
assert(M.includes("host.dataset.saving='0';host.innerHTML="),'modal must reset stale saving state before every open');
assert(M.includes('function closeRefModal()'),'canonical modal close helper missing');
assert(M.includes("host.dataset.saving='0';host.replaceChildren()"),'modal close must clear saving state');
assert(!M.includes("document.getElementById('geGlobalRefModal')?.replaceChildren()"),'raw close may leave stale saving state');
console.log('R38_2_MASTER_EDIT_MODAL_CONTRACT_PASS');
