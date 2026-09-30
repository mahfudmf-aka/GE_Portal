'use strict';
const fs=require('fs');
const form=fs.readFileSync('assets/form-management.js','utf8');
const registry=fs.readFileSync('assets/clean-page-registry.js','utf8');
const master=fs.readFileSync('assets/reference-id-catalog.js','utf8');
function must(s,needle,label){if(!s.includes(needle))throw new Error(`Missing ${label}: ${needle}`)}
must(form,'renderForm(draft,formValues,false)','interactive form preview renderer');
must(form,'if(preview)formValues={}','preview state reset');
must(form,"['Yes','No','N/A']",'Yes/No/N/A response model');
must(form,'source:\'monitoring-assessment\'','monitoring source identity');
must(registry,'data-ref-tab="jenis"','Jenis & Referensi group');
must(registry,'data-ref-tab="id"','ID & Master Referensi group');
must(registry,"assets/reference-id-catalog.js?v=r102",'canonical master data runtime');
const canonicalMaster=registry.slice(registry.lastIndexOf('Canonical Master Data groups')); if(canonicalMaster.includes('master-reference.js'))throw new Error('Canonical Master Data still loads legacy master-reference runtime');
for(const label of ['Airline Partner','Aircraft Master','Currency / Exchange Rate','Touch Point','Station Personnel','Station','Branch Office','Airport / Airport Master','Vendor / Supplier','Service Provider','Contract / Agreement Reference','Location / Area','Position / Jabatan'])must(master,label,`ID group ${label}`);
for(const collection of ['airlines','aircraftConfigs','touchpoints','personnel','airports','groundHandlers','serviceProcurement','boSpaces','airportSystems','lounges','facilities'])must(master,collection,`existing source collection ${collection}`);
console.log('R82_FORM_PREVIEW_MASTER_DATA_CONTRACT_PASS');
