const fs=require('fs');
const form=fs.readFileSync('assets/form-management.js','utf8');
const registry=fs.readFileSync('assets/clean-page-registry.js','utf8');
const master=fs.readFileSync('assets/master-reference.js','utf8');
function must(s,needle,label){if(!s.includes(needle))throw new Error(`Missing ${label}: ${needle}`)}
must(form,'renderForm(draft,formValues,false)','interactive form preview renderer');
must(form,'if(preview)formValues={}','preview state reset');
must(form,"['Yes','No','N/A']",'Yes/No/N/A response model');
must(form,"source:'monitoring-assessment'",'monitoring source identity');
must(registry,'data-master-group=\\\"types\\\"','canonical Master Data group: types');
must(registry,'data-master-group=\\\"masters\\\"','canonical Master Data group: masters');
for(const id of ['geMasterKind','geMasterSearch','geMasterAdd','geMasterTemplate','geMasterUpload','geMasterUploadFile'])must(registry,id,`canonical Master Data control ${id}`);
must(registry,'assets/master-reference.js?v=r80','canonical master-reference runtime');
if(registry.includes('reference-id-catalog.js'))throw new Error('Legacy reference-id-catalog.js must not be loaded by canonical Master Data');
for(const needle of ['geMasterTemplate','geMasterUpload','geMasterUploadFile','function downloadTemplate','function openUpload'])must(master,needle,`Master Data runtime contract ${needle}`);
console.log('R82_FORM_PREVIEW_MASTER_DATA_CONTRACT_PASS');
