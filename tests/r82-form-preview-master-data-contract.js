'use strict';
const fs=require('fs'),assert=require('assert');
const form=fs.readFileSync('assets/form-management.js','utf8');
const registry=fs.readFileSync('assets/clean-page-registry.js','utf8');
const master=fs.readFileSync('assets/master-reference.js','utf8');
function must(s,needle,label){if(!s.includes(needle))throw new Error(`Missing ${label}: ${needle}`)}
must(form,'renderForm(draft,formValues,false)','interactive form preview renderer');
must(form,'if(preview)formValues={}','preview state reset');
must(form,"['Yes','No','N/A']",'Yes/No/N/A response model');
must(form,"source:'monitoring-assessment'",'monitoring source identity');
for(const needle of ['JENIS &amp; REFERENSI','ID &amp; MASTER REFERENSI','id=\\"geMasterTemplate\\"','id=\\"geMasterUpload\\"','id=\\"geMasterUploadFile\\"'])must(registry,needle,'canonical Master Data control');
for(const label of ['Airline Partner','Aircraft Master','Currency / Exchange Rate','Touch Point','Station','Branch Office','Airport / Airport Master','Position / Jabatan'])must(master,label,`canonical Master Data group ${label}`);
assert(!registry.includes('reference-id-catalog.js'),'Legacy secondary reference renderer must not be loaded');
console.log('R82_FORM_PREVIEW_MASTER_DATA_CONTRACT_PASS');
