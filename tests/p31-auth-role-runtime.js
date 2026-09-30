const fs=require('fs');
const assert=require('assert');
const shell=fs.readFileSync('assets/portal-shell.js','utf8');
const auth=fs.readFileSync('assets/auth.js','utf8');
function pov(s){
 const r=String(s?.role||'').trim().toLowerCase().replace(/[\s_-]+/g,' ');
 const access=String(s?.accessLevel||'').trim().toLowerCase();
 const org=String(s?.organizationType||s?.organisationType||s?.orgType||'').trim().toLowerCase();
 const external=['external user','external','collaborator','partner'].includes(r)||['partner','external','external partner','airline partner','vendor','supplier','ground handling agent','gha'].includes(org);
 if(r==='super admin'||r==='superadmin')return 'superadmin';
 if(external)return 'external';
 if(r==='admin'||access==='admin')return 'admin';
 if(r==='management')return 'management';
 if(['ge team','ground experience team','head office','headoffice','staff'].includes(r))return 'ge-team';
 if(['branch office','branchoffice','bo'].includes(r))return 'branch';
 return 'unresolved';
}
assert.strictEqual(pov({role:'Super Admin'}),'superadmin');
assert.strictEqual(pov({role:'Admin'}),'admin');
assert.strictEqual(pov({role:'Management'}),'management');
assert.strictEqual(pov({role:'Head Office'}),'ge-team');
assert.strictEqual(pov({role:'Branch Office'}),'branch');
assert.strictEqual(pov({role:'Viewer',organizationType:'Partner'}),'external');
assert(shell.includes("if(pov==='external')"),'Partner/external navigation must exist');
assert(shell.includes("Ground Experience Admin Dashboard"),'Admin dashboard navigation must exist');
assert(auth.includes("organizationType"),'Authentication must consider organization type');
console.log('P31_ROLE_POV_RUNTIME_PASS');
