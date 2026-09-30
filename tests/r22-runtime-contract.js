const fs=require('fs'); const assert=require('assert');
const R='assets/';
const master=fs.readFileSync(R+'master-reference.js','utf8'); const asset=fs.readFileSync(R+'asset-facility-p39.js','utf8'); const css=fs.readFileSync(R+'portal.css','utf8');
assert(master.includes('geGlobalRefModal'),'Master modal must use global overlay host');
assert(asset.includes("GEStore.hydrate(['assets','facilities','lounges'])")&&asset.includes('Firestore load timeout'),'Asset page must have bounded Firestore loading');
assert(css.includes('#geGlobalRefModal')&&css.includes('2147483000'),'Global modal must render above shell/header/sidebar');
assert(css.includes('.ge-initiative-list-r4 th{position:relative!important;resize:horizontal'),'Initiative list columns must be horizontally resizable');
console.log('R22_RUNTIME_CONTRACT_PASS');
