const fs=require('fs');
const read=f=>fs.readFileSync(f,'utf8');
const planning=read('assets/planning-domains.js');
const master=read('assets/master-reference.js');
const lounge=read('assets/edition1-business-runtime.js');
const registry=read('assets/clean-page-registry.js');
const css=read('assets/portal.css');
const checks=[
  ['Airport master uses existing airports collection',master.includes("state.airports")&&master.includes("kind==='airports'")],
  ['Airport master has CRUD modal',master.includes('function addAirport')&&master.includes("upsert('airports'")],
  ['Airport master tab is injected into existing Master Data tabs',master.includes('data-ref-tab=\"airports\"')&&master.includes('Airport / Station')],
  ['Planning categories remain driven by referenceCatalog',planning.includes("referenceCatalog).filter(x=>x.kind===def.kind")],
  ['Planning has reusable agreement/revision action',planning.includes('Record / Agreement Action')&&planning.includes('Amendment')&&planning.includes('Extension / Perpanjangan')],
  ['Planning revisions preserve superseded records',planning.includes('supersedesId')&&planning.includes('state[collection].push(base)')],
  ['Planning station selection uses active Airport Master',planning.includes('airportOptions')&&planning.includes("status!=='Inactive'")],
  ['Lounge Station field is a dropdown sourced from Airport Master',lounge.includes('<label>Station<select id="${prefix}Airport"')&&lounge.includes('data?.airports'),],
  ['Lounge page return control is in page header',registry.includes('planning-service-return-r75')&&registry.includes('lounge-master-title-v230')],
  ['Planning tables support horizontal scrolling',css.includes('.planning-domain-page .ge-table-wrap')&&css.includes('overflow-x:auto')],
  ['Lounge expiry warning is not full red',css.includes('.lounge-expiry-warning{')&&css.includes('background:#fff4d6')],
  ['Lounge row action label is Edit',lounge.includes('openLoungeEdit(${Number(x.id)})">Edit</button>')]
];
const failed=checks.filter(([,ok])=>!ok);
if(failed.length){failed.forEach(([name])=>console.error('FAIL',name));process.exit(1)}
console.log('R75_PLANNING_DATA_MODEL_PASS');
