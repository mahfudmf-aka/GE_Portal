'use strict';
const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const root=__dirname.replace(/\/tests$/,'');
const p3=fs.readFileSync(root+'/assets/improvement-v257.js','utf8');
const p4=fs.readFileSync(root+'/assets/budget-cost-v257.js','utf8');
const p5=fs.readFileSync(root+'/assets/management-outcome-v257.js','utf8');

assert(p3.includes("originTrace:{domain:'P3.3'"),'P3.3 conversion must retain canonical origin trace on the existing Initiative record.');
assert(p3.includes('legacy.initiatives.push(initiative)'),'P3.3 must reuse the existing GEStore Initiative collection.');
assert(p4.includes("function initiative(id){return (legacy().initiatives||[]).find(x=>String(x.id)===String(id))||null}"),'P4 must resolve Initiative from the existing GEStore source.');
assert(p5.includes("function initiative(id){return (legacy().initiatives||[]).find(x=>String(x.id)===String(id))||null}"),'P5 must resolve Initiative from the existing GEStore source.');
assert(!p4.includes('initiatives:[]'),'P4 must not create a duplicate Initiative collection.');
assert(!p5.includes('initiatives:[]'),'P5 must not create a duplicate Initiative collection.');

function makeStorage(seed){
  const store=new Map(Object.entries(seed||{}));
  return {getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
}
const initiatives=[{id:1001,name:'Converted Initiative',originTrace:{domain:'P3.3',opportunityId:'op-1'}}];
const storage=makeStorage({
  GE_V257_BUDGET_COST_P4:JSON.stringify({schemaVersion:'2.57-P4',budgets:[],costObjects:[{id:'co-1',initiativeId:'1001',name:'Cost Object'}],allocations:[{id:'a-1',costObjectId:'co-1',amount:120}],actuals:[{id:'ac-1',costObjectId:'co-1',amount:75}],adjustments:[]}),
  GE_V257_MANAGEMENT_OUTCOME_P5:JSON.stringify({schemaVersion:'2.57-P5',reviews:[{id:'r-1',initiativeId:'1001'}],outcomes:[{id:'o-1',initiativeId:'1001',target:90,actual:80}],conditionProposals:[{id:'p-1',outcomeId:'o-1'}],transformationItems:[{id:'t-1',initiativeId:'1001'}]})
});
const context={window:{GEStore:{get:()=>({initiatives})}},localStorage:storage,console};
context.window.window=context.window;
vm.runInNewContext(p4,context,{filename:'budget-cost-v257.js'});
vm.runInNewContext(p5,context,{filename:'management-outcome-v257.js'});
const fin=context.window.GEBudgetCost.financialForInitiative('1001');
assert(fin.initiative && String(fin.initiative.id)==='1001','P4 must resolve the converted Initiative by the canonical Initiative id.');
assert.strictEqual(fin.allocated,120,'P4 allocated cost must aggregate through Initiative-linked Cost Objects.');
assert.strictEqual(fin.actual,75,'P4 actual cost must aggregate through Initiative-linked Cost Objects.');
const view=context.window.GEManagementOutcome.initiativeView('1001');
assert(view.initiative && String(view.initiative.id)==='1001','P5 must resolve the same canonical Initiative id.');
assert.strictEqual(view.reviews.length,1,'P5 review must remain Initiative-linked.');
assert.strictEqual(view.outcomes.length,1,'P5 outcome must remain Initiative-linked.');
assert.strictEqual(view.transformation.length,1,'P5 transformation item must remain Initiative-linked.');
console.log('R77_P3_P4_P5_INTEGRATION_CONTRACT_PASS');
