'use strict';
const fs=require('fs');const path=require('path');const assert=require('assert');
const root=process.cwd();
const pages=['standar','inisiatif','service-planning','calendar','planning-documents','data','admin','berita','kontak','lounge-list','branch-office-planning','gaso-planning'];
const required=['assets/edition1-store.js','assets/edition1-files.js','assets/edition1-business-runtime.js','assets/edition1-page-boot.js','netlify/functions/edition1-data.js','netlify/functions/edition1-file.js'];
for(const f of required)assert(fs.existsSync(path.join(root,f)),`Missing Edition 1 Firebase file: ${f}`);
for(const p of pages){
 const f=path.join(root,`e1-${p}.html`);assert(fs.existsSync(f),`Missing replacement page: ${p}`);const s=fs.readFileSync(f,'utf8');
 for(const bad of ['assets/data.js','assets/app.js','assets/compatibility-v257.js','assets/v254-project.js','assets/v2544-modal-fix.js','assets/v2554-stability.js','assets/files.js'])assert(!s.includes(bad),`${p}: legacy business runtime loaded: ${bad}`);
 for(const good of ['assets/auth.js','assets/edition1-store.js','assets/edition1-business-runtime.js','assets/edition1-page-boot.js'])assert(s.includes(good),`${p}: missing canonical Firebase runtime asset ${good}`);
 assert(s.includes('Firebase / Firestore Production Data'),`${p}: not marked as Firebase/Firestore production-data page`);
}
const store=fs.readFileSync(path.join(root,'assets/edition1-store.js'),'utf8');
assert(!/localStorage\.(getItem|setItem|removeItem)/.test(store),'Edition1 store must not persist business data in localStorage');
assert(store.includes("'/api/edition1-data?collections='"),'Edition1 store does not read through Firebase API');
const api=fs.readFileSync(path.join(root,'netlify/functions/edition1-data.js'),'utf8');
assert(api.includes("source:'Firestore'"),'Edition1 data API must identify Firestore as source');
assert(api.includes("auth.verifyIdToken(token,true)"),'Edition1 data API must verify Firebase ID token');
const runtime=fs.readFileSync(path.join(root,'assets/edition1-business-runtime.js'),'utf8'); assert(!/\b(?:localStorage|sessionStorage)\b/.test(runtime),'Edition1 business runtime must not use browser storage for business or UI state'); const auth=fs.readFileSync(path.join(root,'assets/auth.js'),'utf8'); const boot=fs.readFileSync(path.join(root,'assets/edition1-page-boot.js'),'utf8'); const combined=runtime+'\n'+auth+'\n'+boot;
const handlers=[...new Set([...runtime.matchAll(/(?:^|[;{}])function\s+([A-Za-z_$][\w$]*)\s*\(/gm)].map(m=>m[1]))];
for(const p of pages){const s=fs.readFileSync(path.join(root,`e1-${p}.html`),'utf8');const names=[...s.matchAll(/onclick="([^"]+)"/g)].flatMap(m=>[...m[1].matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)].map(x=>x[1]));for(const n of names){if(['alert','confirm','close','replace','setTimeout','event','this','remove','add','toggle','focus','preventDefault','classList','getElementById','querySelector','querySelectorAll'].includes(n))continue;assert(combined.includes(`function ${n}(`)||combined.includes(`window.${n}=`)||combined.includes(`${n}=`),`${p}: inline handler function not found in consolidated runtime: ${n}`)}}
console.log('P40_FIREBASE_EDITION1_FUNCTIONAL_CONTRACT_PASS');

for(const p of pages){const s=fs.readFileSync(path.join(root,`e1-${p}.html`),'utf8');assert(s.includes('assets/firebase-config.js'),'Firebase config preload missing for '+p);assert(s.includes('assets/firebase-client.js'),'Firebase client preload missing for '+p);assert(s.includes('assets/edition1-portal-shell-entry.js'),'Edition 1 page is not using the portal-shell entrypoint: '+p);}
assert(fs.existsSync(path.join(root,'assets/portal-shell.js')),'Locked portal shell missing');
assert(fs.existsSync(path.join(root,'assets/edition1-portal-shell-entry.js')),'Edition 1 portal-shell entrypoint missing');
assert(fs.existsSync(path.join(root,'assets/edition1-portal-route-adapter.js')),'Edition 1 route adapter missing');
assert(fs.existsSync(path.join(root,'assets/edition1-overlay-manager.js')),'Edition 1 overlay manager missing');
console.log('P40_V2_CANONICAL_SHELL_PASS');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const bad of ['assets/data.js','assets/core-v257.js','assets/relationships-v257.js','assets/network-v257.js','assets/readiness-v257.js','assets/customer-experience-v257.js','assets/improvement-v257.js','assets/budget-cost-v257.js','assets/management-outcome-v257.js'])assert(!index.includes(bad),`index.html: legacy local business runtime loaded: ${bad}`);
for(const good of ['assets/firebase-config.js','assets/firebase-client.js','assets/edition1-store.js','assets/dashboard-firestore.js','assets/portal-shell.js'])assert(index.includes(good),`index.html: missing canonical Firebase/dashboard asset ${good}`);
const shell=fs.readFileSync(path.join(root,'assets/portal-shell.js'),'utf8');
const e1entry=fs.readFileSync(path.join(root,'assets/edition1-portal-shell-entry.js'),'utf8');
for(const requiredPage of ['e1-inisiatif.html','e1-calendar.html','e1-standar.html','e1-admin.html']) assert(e1entry.includes(requiredPage),`Edition 1 portal-shell entrypoint does not admit ${requiredPage}`);
for(const p of pages){const s=fs.readFileSync(path.join(root,`e1-${p}.html`),'utf8');assert(!s.includes('assets/edition1-canonical-shell.js'),'Edition 1 page still loads a second shell implementation: '+p);}
console.log('P40_CANONICAL_DASHBOARD_FIRESTORE_PASS');

