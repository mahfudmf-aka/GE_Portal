'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const dash=fs.readFileSync('assets/dashboard-firestore.js','utf8');
const dist=dash.match(/function boClassDistribution\(m\)[\s\S]*?\nfunction classificationViz/)?.[0];assert(dist,'Classification distribution missing');
const fn=vm.runInNewContext('const stationVals=x=>x.code?[x.code]:[];'+dist.slice(0,-'function classificationViz'.length)+'boClassDistribution');
const c=JSON.parse(JSON.stringify(fn({airports:[{code:'CGK',airportClass:'A'},{code:'DPS',boPerformanceClass:'BO B',classificationStatus:'Verified'},{code:'SUB',boPerformanceClass:'A',classificationStatus:'Draft'},{code:'UPG',boPerformanceClass:'D',classificationStatus:'Published'}]})));
assert.deepStrictEqual(c,{A:0,B:1,C:0,D:1,unknown:2},'Requirement class and unverified performance must not become BO grades');
const sync=dash.match(/async function syncPublishedLocalImports\(\)[\s\S]*?\nfunction customerExperience/)?.[0];assert(sync,'Published local migration missing');
const saved=[];const state={customerExperience:[]};const context={localStorage:{getItem:()=>JSON.stringify([{id:'aug',state:'Published',period:'2026-08',route:'All',csi:85.8,nps:57.2},{id:'old',state:'Superseded',csi:86}])},window:{GEStore:{get:()=>state,save:x=>saved.push(x.customerExperience.map(y=>({...y}))),flush:async()=>{} }},S:()=>({role:'Head Office',accessLevel:'Admin'})};
vm.runInNewContext(sync.slice(0,-'function customerExperience'.length)+'syncPublishedLocalImports()',context).then(()=>{
 assert.strictEqual(saved.length,1);assert.strictEqual(saved[0].length,1);assert.strictEqual(saved[0][0].csi,85.8);
 assert(dash.includes('await window.GEStore.hydrate(cols)'));assert(!dash.includes('for(const c of cols)'));
 assert(dash.includes('customerExperience||[],s'));assert(dash.includes('airportCosts||[],s'));
 const app=fs.readFileSync('app.html','utf8');assert(app.indexOf('outlet.innerHTML=def.html')<app.indexOf('  reveal();'));console.log('R51_DASHBOARD_SOURCE_CONTRACT_PASS');
}).catch(e=>{console.error(e);process.exitCode=1});
