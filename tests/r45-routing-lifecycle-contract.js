'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root='assets/';const shell=fs.readFileSync(root+'portal-shell.js','utf8');
const app=fs.readFileSync('app.html','utf8');const auth=fs.readFileSync(root+'auth.js','utf8');
const foundation=fs.readFileSync(root+'r43-airport-experience-foundation.js','utf8');
const w={};vm.runInNewContext(fs.readFileSync(root+'clean-page-registry.js','utf8'),{window:w});
const pages=w.P40_CLEAN_PAGES,aliases=w.P40_CLEAN_ALIASES;
for(const route of ['airport-experience','station-360','service-experience','capability-classification','monitoring-assessment']){
 assert(pages[route]?.html?.trim(),`${route}: registry renderer missing`);
 assert(shell.includes(`'${route}.html'`),`${route}: shell gate missing`);
 assert(auth.includes(`'${route}.html':'services'`),`${route}: access gate missing`);
}
assert(shell.includes("item('airport-experience.html','Network & Map'"),'Combined Network and Map navigation target missing');
assert(shell.includes('ge-airport-parent')&&shell.includes('const airportChildren='),'Airport parent must not be a clickable active route');
assert(!app.includes("outlet.querySelector('[data-section=map]')?.toggleAttribute('hidden'"),'Network and Map must remain visible in the same page');
assert(app.includes("await loadSrc('assets/r43-airport-experience-foundation.js?v=r45')")&&foundation.includes('window.geInitR43=boot'),'R43 page enhancer must boot explicitly');
assert(!foundation.includes("document.addEventListener('DOMContentLoaded',()=>setTimeout(boot"),'R43 enhancer must not depend on a synthetic page load');
for(const match of shell.matchAll(/item\('([^']+\.html(?:\?[^']*)?)'/g)){
 const u=new URL(match[1],'https://portal.invalid/');const requested=u.pathname.split('/').pop().replace(/\.html$/,'');
 const route=requested==='app'?u.searchParams.get('page')||'index':(aliases[requested]||requested).split('?')[0];
 assert(pages[route],`Sidebar target ${match[1]} has no renderer`);
}
for(const route of ['map','network-stations','airport-experience-map'])assert(aliases[route]==='airport-experience',`${route}: legacy alias missing`);
console.log('R45_ROUTING_LIFECYCLE_PASS');
