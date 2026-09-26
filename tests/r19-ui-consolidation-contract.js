const fs=require('fs');
const assert=(x,m)=>{if(!x)throw new Error(m)};
const rt=fs.readFileSync('assets/edition1-business-runtime.js','utf8');
const css=fs.readFileSync('assets/portal.css','utf8');
for(const f of ['assets/portal-shell.js','assets/edition1-portal-shell-entry.js']){
 const s=fs.readFileSync(f,'utf8');
 const m=s.match(/const planning=\[([\s\S]*?)\n \];/);assert(m,`${f}: planning nav missing`);assert(m[1].includes('planning-workspace.html'),`${f}: workspace missing`);assert(!m[1].includes('service-planning.html'),`${f}: overview still redundant in sidebar`);assert(!m[1].includes('planning-documents.html'),`${f}: documents still redundant in sidebar`);
}
assert(rt.includes("window.geSetLoungeViewR6=setLoungeView"),'canonical lounge view missing');
assert(rt.includes("window.geSetInitiativeViewR19=setInitiativeView"),'canonical initiative view missing');
assert(rt.includes("'openPlanningRecordModal'"),'planning handler export missing');
assert(rt.includes("'openServiceProcurementModalV243'"),'service handler export missing');
assert(css.includes('.ge-combo-menu-r12{z-index:10060!important'),'lounge dropdown layer fix missing');
assert(css.includes('.ge-combo-input-r12{height:44px!important'),'lounge compact field fix missing');
console.log('R19_UI_CONSOLIDATION_CONTRACT_PASS');
