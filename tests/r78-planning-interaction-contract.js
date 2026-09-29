const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const plan=read('assets/planning-domains.js'), runtime=read('assets/edition1-business-runtime.js'), reg=read('assets/clean-page-registry.js'), ref=read('assets/master-reference.js'), css=read('assets/portal.css');
const checks=[
 ['P78_NO_CURRENT_ROWS_RUNTIME_ERROR',!plan.includes('currentRows(')],
 ['P78_PLANNING_MODAL_BODY_LEVEL',plan.includes('document.body.appendChild(el)')],
 ['P78_DELETE_CONFIRMATION',plan.includes('geConfirmDeleteV234')&&plan.includes('confirmLabel')],
 ['P78_DELETE_RED_CLASS',plan.includes('ge-btn danger')],
 ['P78_GHA_MULTI_STATION_SPLIT',plan.includes("collection==='groundHandlers'&&Array.isArray(target.stations)")],
 ['P78_GHA_MASTER_MULTI_STATION_SPLIT',ref.includes('if(!x&&o.stations.length>1)')],
 ['P78_STATION_SOURCE_AIRPORT_MASTER',ref.includes("const stations=()=>uniq((state.airports||[]).filter(x=>x.status!=='Inactive')")],
 ['P78_LOUNGE_MODAL_BODY_LEVEL',runtime.includes('if(modal.parentElement!==document.body)document.body.appendChild(modal)')],
 ['P78_LOUNGE_SERVICE_PROVIDER_BUTTON',reg.includes('← Service &amp; Provider')],
 ['P78_LOUNGE_WARNING_AMBER',css.includes('.lounge-expiry-warning,.lounge-expiry-warning.compact')&&css.includes('#fff4cf')],
 ['P78_MODAL_ABOVE_SHELL',css.includes('z-index:2147482000!important')],
 ['P78_DELETE_FILLED_RED_WHITE',css.includes('.planning-row-actions .ge-btn.danger')&&css.includes('color:#fff!important')],
 ['P78_RUNTIME_CACHE_BUST',reg.includes('edition1-business-runtime.js?v=r78')],
];
let bad=checks.filter(([,ok])=>!ok);for(const [n,ok] of checks)console.log(`${n}: ${ok?'PASS':'FAIL'}`);if(bad.length)process.exit(1);console.log('R78_PLANNING_INTERACTION_CONTRACT_PASS');
