const fs=require('fs');
const assert=(c,m)=>{if(!c)throw new Error(m)};
const s=fs.readFileSync('assets/edition1-business-runtime.js','utf8');
assert(s.includes(".replace(/\\*/g,'')"),'Template header normalizer must accept required-field asterisks.');
assert(s.includes("'harga / m² / bulan'")&&s.includes("'provider*'"),'Space template aliases must match the distributed CSV template.');
assert(s.includes('async function geConfirmImportPersistedV240'),'Bulk import must verify Firestore persistence.');
assert(s.includes('await window.GEStore.flush()'),'Bulk import success must wait for Firestore flush.');
assert(s.includes("notice('Import Gagal'"),'Lounge/Tenant import must expose Firestore failure.');
console.log('UPLOAD_TEMPLATE_CONTRACT_PASS');
