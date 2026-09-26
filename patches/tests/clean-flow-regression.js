#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const assert=(c,m)=>{if(!c)throw new Error(m)};

const html=fs.readdirSync(root).filter(x=>x.endsWith('.html')).sort();
assert(JSON.stringify(html)==JSON.stringify(['app.html','login.html']),`Clean architecture must remain 2 HTML files; found: ${html.join(', ')}`);

const app=read('app.html');
assert(app.includes('class="top"'),'app.html must expose the final reference top shell mount.');
assert(app.includes('class="shell"'),'app.html must expose the shared shell mount.');
assert(app.includes('assets/clean-shell-runtime.js'),'app.html must load the single Clean shell runtime.');
assert(app.includes("const indexMode=route==='index'"),'app.html must own the index route explicitly.');
assert(app.includes('assets/clean-dashboard-management.js'),'index route must load the reference Management Dashboard runtime.');
assert(!app.includes('assets/e1-canonical.css'),'e1-canonical.css must not override the supplied reference shell geometry.');
assert(!app.includes('assets/portal-shell.js'),'app.html must not directly load legacy portal-shell.js.');

const registry=read('assets/clean-page-registry.js');
assert(registry.includes('window.P40_CLEAN_PAGES='),'Canonical page registry missing.');
assert(registry.includes('window.P40_CLEAN_ALIASES='),'Canonical route aliases missing.');
for(const legacy of ['assets/portal-shell.js','assets/edition1-portal-shell-entry.js','assets/edition1-portal-route-adapter.js']){
  assert(!registry.includes(legacy),`Clean registry still loads legacy shell runtime: ${legacy}`);
}
assert(!registry.includes("location.href='station-360.html?stationId=${encodeURIComponent(x.stationId)}'"),'Programmatic Station 360 navigation bypasses Clean routing.');
assert(!registry.includes("location.replace('index.html#service-experience')"),'Service redirect still targets legacy index.html.');

const adapter=read('assets/clean-route-adapter.js');
assert(adapter.includes("params.set('page',route)"),'Clean route adapter must resolve routes into app.html.');
assert(adapter.includes('var hash='),'Clean route adapter must preserve hash fragments.');

const boot=read('assets/edition1-page-boot.js');
assert(boot.includes("const cleanRoute="),'Edition 1 boot must read the Clean query route.');
assert(boot.includes("'inisiatif':'e1-inisiatif.html'"),'Initiative query route mapping missing.');
assert(boot.includes("'calendar':'e1-calendar.html'"),'Calendar query route mapping missing.');
assert(boot.includes("'admin':'e1-admin.html'"),'Admin query route mapping missing.');
assert(boot.includes('window.p40CleanRoute'),'Access fallback must return to a Clean route.');

const shell=read('assets/clean-shell-runtime.js');
assert(shell.includes("document.body.classList.add('final-v257','final-shell-r5')"),'Reference final shell classes missing.');
assert(shell.includes('class="ge-sidebar-toggle"'),'Collapse control must exist in the sidebar.');
assert(shell.includes('>Collapse</span>'),'Sidebar control label must be Collapse.');
assert(shell.includes('GE_CLEAN_SIDEBAR_COLLAPSED'),'Collapse state persistence missing.');
assert(shell.includes('class="ge-user-menu"'),'User menu must be one integrated control.');
assert(shell.includes('class="avatar"'),'SA avatar must remain inside user control.');
assert(shell.includes('class="chev"'),'User chevron must be inside the SA user control.');
assert(shell.includes("hrefFor('profile')"),'User popup must link to canonical Profile route.');
assert(!shell.includes("item('service-capability'"),'Empty service-capability page must not be exposed as a navigation destination.');

const dash=read('assets/clean-dashboard-management.js');
assert(dash.includes('Management Dashboard'),'Reference Management Dashboard content missing.');
assert(dash.includes('AIRPORT EXPERIENCE NETWORK'),'Reference dashboard network panel missing.');
assert(dash.includes('INITIATIVE & IMPROVEMENT'),'Reference dashboard initiative panel missing.');
assert(dash.includes('COST INTELLIGENCE'),'Reference dashboard cost panel missing.');
assert(dash.includes('BUDGET & FINANCIAL'),'Reference dashboard budget panel missing.');
assert(dash.includes('GEStore.hydrate'),'Management Dashboard must hydrate the shared Firestore store before render.');

const css=read('assets/clean-shell.css');
assert(css.includes('.ge-user-menu .chev'),'Integrated user chevron styling missing.');

const portal=read('assets/portal.css');
assert(portal.includes('body.final-v257'),'Final-v257 visual layer must remain available.');
assert(portal.includes('.airport-map'),'Functional map CSS must remain available.');
assert(portal.includes('.login-page'),'Login CSS must remain available.');

const routes=Object.keys(JSON.parse(registry.slice(
  registry.indexOf('window.P40_CLEAN_PAGES=')+'window.P40_CLEAN_PAGES='.length,
  registry.indexOf('window.P40_CLEAN_ALIASES=')
).trim().replace(/;$/,'')));
assert(routes.length===56,`Expected 56 Clean registry routes; found ${routes.length}`);

console.log(`CLEAN_FLOW_REGRESSION_PASS HTML=${html.length} ROUTES=${routes.length}`);
