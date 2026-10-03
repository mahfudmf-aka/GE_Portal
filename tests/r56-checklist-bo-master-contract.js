'use strict';
const fs=require('fs'),assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8');
const checklist=read('assets/form-management.js');
for(const type of ['short_text','long_text','number','currency','single_choice','multiple_choice','dropdown','yes_no','rating','numeric_scale','score','pass_fail','date','time','datetime','file','photo','url','person','location','email','phone','repeatable_group'])assert(checklist.includes(`'${type}'`),`Field type ${type} missing`);
for(const key of ['versions','formSnapshot','showIf','weight','touchpointId','monitoringWorks','formSubmissions'])assert(checklist.includes(key),`${key} missing`);
const dashboard=read('assets/dashboard-firestore.js');const names=['MY TASKS & ACTION','STATION READINESS','CAPABILITY VS REQUIREMENT','USAGE & PERFORMANCE','CUSTOMER EXPERIENCE — ${scope}','OPEN ISSUES','INITIATIVE & ACTION — ${scope}','BUDGET & COST','RECENT ACTIVITY'];const part=dashboard.slice(dashboard.indexOf('function branch('),dashboard.indexOf('function admin('));let last=-1;for(const n of names){const at=part.indexOf(n);assert(at>last,n+' out of BO order');last=at}
const app=read('app.html'),master=read('assets/master-reference.js'),reg=read('assets/clean-page-registry.js');assert(app.includes("'master-data','attention-settings'])")&&app.includes("if(route==='master-data')await window.GXMasterReference?.init()"));assert(master.includes('JENIS &amp; REFERENSI')&&master.includes('ID &amp; MASTER REFERENSI'));assert(master.includes('Position / Jabatan'));assert(!reg.includes('reference-id-catalog.js'));
console.log('R56_CHECKLIST_BO_MASTER_CONTRACT_PASS');
