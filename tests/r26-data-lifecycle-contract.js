const fs=require('fs');
const m=fs.readFileSync('assets/master-reference.js','utf8');
const b=fs.readFileSync('assets/edition1-business-runtime.js','utf8');
const st=fs.readFileSync('assets/edition1-store.js','utf8');
const sh=fs.readFileSync('assets/portal-shell.js','utf8');
const au=fs.readFileSync('netlify/functions/auth-update-user.js','utf8');
const css=fs.readFileSync('assets/portal.css','utf8');
function ok(c,msg){if(!c)throw new Error(msg)}
ok(m.includes('Preview Upload Data')&&m.includes('Upload berhasil:'),'upload must preview and confirm persistence');
ok(m.includes('data-delete')&&m.includes('Hapus Terpilih'),'row and multi delete required');
ok(m.includes("field('Cabin F'")&&m.includes("field('Cabin C'")&&m.includes("field('Cabin Y'")&&m.includes('Total Configuration'),'aircraft cabin configuration required');
ok(st.includes('const previous=pending.catch(()=>undefined)'),'save queue must recover after failed write');
ok(b.includes("geAirportVisibleRows():airports()"),'canonical map must render union station rows');
ok(b.includes('data-initiative-list-r26')&&b.includes("th.onclick=()=>"),'initiative list headers must sort');
ok(sh.includes("'asset-facility.html'"),'asset facility must be canonical shell page');
ok(au.includes('const roleChanged')&&au.includes('!roleChanged'),'unchanged legacy role must be editable');
ok(css.includes('.ge-ref-toast')&&css.includes('.ge-upload-preview'),'data feedback UI required');
console.log('R26_DATA_LIFECYCLE_CONTRACT_PASS');
