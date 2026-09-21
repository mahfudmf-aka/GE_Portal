'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('assets/lounge-planning-v29.js','utf8');
const sandbox={
  window:{addEventListener(){}},
  document:{getElementById(){return null},querySelectorAll(){return[]},querySelector(){return null},createElement(){return {}}},
  data:{airports:[{code:'CGK'},{code:'DPS'}],lounges:[]},
  geEsc:v=>String(v??''),
  geStorageNoticeV223(){},
  gePlanningCanAction(){return true},
  gxCanManage(){return true},
  geNormalizeDateUploadV223:v=>String(v??''),
  geReadTabularFileV223(){},
  geRowsToObjectsV223(){},
  fillAirportSelects(){},renderLounges(){},renderLoungeCardsV237(){},renderLoungePriceSummaryV243(){},
  URL:{createObjectURL(){return''},revokeObjectURL(){}},Blob:function(){},
  alert(){},console
};
sandbox.window.URL=sandbox.URL;sandbox.window.Blob=sandbox.Blob;
vm.runInNewContext(source,sandbox,{filename:'assets/lounge-planning-v29.js'});
const w=sandbox.window;

assert.equal(w.geP29ResolveLoungeServiceType({serviceCategory:'Lounge'}).value,'Lounge');
assert.equal(w.geP29ResolveLoungeServiceType({serviceType:'Tenant'}).value,'Tenant');
assert.equal(w.geP29ResolveLoungeServiceType({serviceCategory:'Lounge',serviceType:'Tenant'}).status,'REVIEW');


const templateRows=fs.readFileSync('templates/Template_Layanan_Lounge_Tenant_P29.csv','utf8').replace(/^#[^\n]*\n/gm,'').split(/\r?\n/).find(line=>line.trim());
const templateHeaders=templateRows.split(',').map(x=>x.replace(/^"|"$/g,'').replace(/""/g,'"'));
assert.deepEqual(templateHeaders,Array.from(w.geP29CSVContractHeaders()));
const csvLike=[{region:'WEST',station:'CGK',name:'Example Tenant',serviceType:'Tenant',pic:'PIC',currency:'',pricePerPax:'',startDate:'2026-01-01',endDate:'2028-12-31',documentNumber:'AG-001',documentType:'Perjanjian',documentStatus:'Valid',remarks:'',priceEffectiveFrom:'2026-01-01',priceEffectiveTo:'2026-12-31',price:120000,priceCurrency:'IDR',priceBasis:'pax',priceNote:''},{region:'WEST',station:'CGK',name:'Example Tenant',serviceType:'Tenant',pic:'PIC',currency:'',pricePerPax:'',startDate:'2026-01-01',endDate:'2028-12-31',documentNumber:'AG-001',documentType:'Perjanjian',documentStatus:'Valid',remarks:'',priceEffectiveFrom:'2027-01-01',priceEffectiveTo:'2027-12-31',price:125000,priceCurrency:'IDR',priceBasis:'pax',priceNote:''}];
const csvNormalized=w.geP29NormalizeCSVRows(csvLike);assert.equal(csvNormalized.groups.length,1);assert.equal(csvNormalized.groups[0].model.serviceType,'Tenant');assert.equal(csvNormalized.groups[0].model.priceSchedules.length,2);

const manualSingle=w.geP29NormalizeLoungeInput({region:'WEST',station:'CGK',name:'Parity Lounge',serviceType:'Lounge',pic:'PIC',currency:'IDR',pricePerPax:'120000',startDate:'2026-01-01',endDate:'2026-12-31',documentNumber:'AG-PARITY',documentType:'Perjanjian',documentStatus:'Valid',remarks:''});
const csvSingle=w.geP29NormalizeCSVRows([{region:'WEST',station:'CGK',name:'Parity Lounge',serviceType:'Lounge',pic:'PIC',currency:'IDR',pricePerPax:'120000',startDate:'2026-01-01',endDate:'2026-12-31',documentNumber:'AG-PARITY',documentType:'Perjanjian',documentStatus:'Valid',remarks:'',priceEffectiveFrom:'',priceEffectiveTo:'',price:'',priceCurrency:'',priceBasis:'',priceNote:''}]);
assert.equal(manualSingle.ok,true);assert.equal(csvSingle.groups.length,1);assert.deepEqual(JSON.parse(JSON.stringify(csvSingle.groups[0].model)),JSON.parse(JSON.stringify(manualSingle.model)));
const dataSource=fs.readFileSync('assets/data.js','utf8');
const match=dataSource.match(/lounges:\[(.*?)\]\};/s);
assert.ok(match,'Baseline Lounge master data should be discoverable');
const baselineLounges=JSON.parse('['+match[1]+']');
assert.equal(baselineLounges.length,49);
assert.ok(baselineLounges.every(x=>x.serviceCategory==='Lounge'));
assert.ok(baselineLounges.every(x=>w.geP29ResolveLoungeServiceType(x).value==='Lounge'));
assert.equal(w.geP29ResolveLoungeServiceType({serviceCategory:'Tenant',serviceType:'Tenant'}).value,'Tenant');
assert.equal(w.geP29ResolveLoungeServiceType({serviceCategory:'Bogus'}).status,'REVIEW');

const legacy=w.geP29ApplicableLoungePrice({pricePerPax:120000,currency:'IDR'},new Date('2026-06-01T12:00:00Z'));
assert.equal(legacy.status,'LEGACY');assert.equal(legacy.price,120000);

const multi={startDate:'2026-01-01',endDate:'2028-12-31',priceSchedules:[
  {effectiveFrom:'2026-01-01',effectiveTo:'2026-12-31',price:120000,currency:'IDR',priceBasis:'pax'},
  {effectiveFrom:'2027-01-01',effectiveTo:'2027-12-31',price:125000,currency:'IDR',priceBasis:'pax'},
  {effectiveFrom:'2028-01-01',effectiveTo:'2028-12-31',price:130000,currency:'IDR',priceBasis:'pax'}
]};
assert.equal(w.geP29ApplicableLoungePrice(multi,new Date('2027-06-01T12:00:00Z')).price,125000);
assert.equal(w.geP29ApplicableLoungePrice(multi,new Date('2029-01-01T12:00:00Z')).status,'NOT_APPLICABLE');
const overlap={...multi,priceSchedules:[...multi.priceSchedules,{effectiveFrom:'2026-06-01',effectiveTo:'2026-12-15',price:121000,currency:'IDR',priceBasis:'pax'}]};
assert.equal(w.geP29ApplicableLoungePrice(overlap,new Date('2026-07-01T12:00:00Z')).status,'INVALID');

const normalized=w.geP29NormalizeLoungeInput({station:'CGK',name:'Example Tenant',serviceType:'Tenant',startDate:'2026-01-01',endDate:'2028-12-31',priceSchedules:[
  {effectiveFrom:'2026-01-01',effectiveTo:'2026-12-31',price:120000,currency:'IDR',priceBasis:'pax'},
  {effectiveFrom:'2027-01-01',effectiveTo:'2027-12-31',price:125000,currency:'IDR',priceBasis:'pax'}
],documentStatus:'Valid'});
assert.equal(normalized.ok,true);assert.equal(normalized.model.serviceCategory,'Tenant');assert.equal(normalized.model.serviceType,'Tenant');assert.equal(normalized.model.priceSchedules.length,2);

const bad=w.geP29NormalizeLoungeInput({station:'NOPE',name:'Broken',serviceType:'Tenant',pricePerPax:'abc',currency:'IDR',documentStatus:'Valid'});
assert.equal(bad.ok,false);assert.ok(bad.errors.some(x=>/Station\/Airport/.test(x)));assert.ok(bad.errors.some(x=>/Harga Per Pax/.test(x)));

const badSchedule=w.geP29NormalizeLoungeInput({station:'CGK',name:'Broken Schedule',serviceType:'Tenant',startDate:'2026-01-01',endDate:'2026-12-31',priceSchedules:[{effectiveFrom:'2026-06-01',effectiveTo:'2026-05-01',price:'abc',currency:'ZZZ',priceBasis:'pax'}],documentStatus:'Valid'});
assert.equal(badSchedule.ok,false);assert.ok(badSchedule.errors.some(x=>/effectiveTo sebelum/.test(x)));assert.ok(badSchedule.errors.some(x=>/price harus numerik/.test(x)));assert.ok(badSchedule.errors.some(x=>/currency tidak valid/.test(x)));

const badDate=w.geP29NormalizeLoungeInput({station:'CGK',name:'Bad Date',serviceType:'Tenant',startDate:'2026-02-31',documentStatus:'Valid'});
assert.equal(badDate.ok,false);assert.ok(badDate.errors.some(x=>/Tanggal Mulai tidak valid/.test(x)));

console.log('P29_LOUNGE_PLANNING_PASS');
