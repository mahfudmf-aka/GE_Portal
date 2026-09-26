const fs=require('fs'),assert=require('assert');
const store=fs.readFileSync('assets/edition1-store.js','utf8');
const api=fs.readFileSync('netlify/functions/edition1-data.js','utf8');
const master=fs.readFileSync('assets/master-reference.js','utf8');
assert(store.includes("action:'BATCH'")&&store.includes('apiPostBatch(collection,changes)'),'bulk store persistence must use bounded batch requests');
assert(api.includes("if(action==='BATCH')")&&api.includes('changes.length>75'),'server batch endpoint/limit missing');
assert(master.includes('Menyimpan…')&&master.includes("host.dataset.saving='1'")&&master.includes('save.disabled=true'),'Master Data save must expose immediate busy state and prevent duplicate save');
assert(master.includes("Penyimpanan gagal:")&&master.includes('aria-live'),'Master Data save error/status feedback missing');
console.log('R38_MASTER_SAVE_CONTRACT_PASS');
