import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const planning=read('assets/planning-domains.js');
const master=read('assets/master-reference.js');
const runtime=read('assets/edition1-business-runtime.js');
const registry=read('assets/clean-page-registry.js');

const must=(text,needle,label)=>{if(!text.includes(needle))throw new Error(`R77 missing: ${label}`)};

must(planning,'const currentRows=list=>Array.isArray(list)?list:[]','currentRows guard');
must(planning,'const airportOptions=(current=\'\')','planning station source');
must(planning,'Field Configuration','planning field configuration');
must(planning,'const revisionMeta=r=>','revision metadata guard');

must(registry,'data-ref-tab=\\"personnel\\"','Personnel Master tab');
must(registry,'data-ref-tab=\\"bo-classification\\"','BO Classification tab');
must(master,"kind==='boClassification'",'BO classification reference kind');
must(master,"state=await GEStore.hydrate(['airlines','groundHandlers','serviceAlignments','airportCosts','aircraftConfigs','airports','lounges','personnel'",'personnel hydration');
must(master,"PERSONNEL_FUNCTION_CODES=['AM','DM','GM','KK','SV','KG'",'personnel function codes');

must(runtime,'function geBOClassificationRules()','BO classification engine rules');
must(runtime,'function geBOClassificationForCount(n)','BO classification engine resolver');
must(runtime,'const classification=geBOClassificationForCount(n)','BO classification engine usage');

console.log('R77_PLANNING_MASTER_FIELD_CONFIG_PASS');
