const fs=require('fs');const path=require('path');const root=path.resolve(__dirname,'..');
function assert(c,m){if(!c)throw new Error(m)}
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const core=read('assets/core-v257.js'),cx=read('assets/customer-experience-v257.js'),imp=read('assets/improvement-v257.js'),budget=read('assets/budget-cost-v257.js'),outcome=read('assets/management-outcome-v257.js'),perm=read('assets/permission-v257.js'),net=read('netlify.toml'),fb=read('firebase.json'),rules=read('firestore.rules');
const baseline={
 P1:['organizations','airports','terminals','stations','serviceLocations','lounges','tenants','snackBoxes','journeys','touchpoints','services','serviceStandards','capabilities','users','periods','sources','masterCategories'],
 P2:['gap(actual,target)','achievement(actual,target)','delta(current,previous)','performanceStatus','stationPerformance'],
 P3:['Candidate for Initiative','createDraftInitiative','createMilestone','createDraftActivityFromAction','integrationIntegrity','phaseIntegrity'],
 P4:['variance(allocated,actual)','utilization(actual,allocated)','costPerImprovementPoint','financialSummary'],
 P5:['outcomeImprovement','targetAttainment','outcomeAchievement','outcomeStatus','evaluateOutcome'],
 P6:['assignedStations','assignedLounges','menuAccess','tabs','menuAllowed','effectiveScope'],
 P7:['Login','Firebase','Regression','UAT','Direct URL','Scope'],
 P8:['netlify/functions','NODE_VERSION','firestore.rules','/api/*','deploy-preview']
};
for(const k of baseline.P1)assert(core.includes(k),`P1 missing canonical foundation contract: ${k}`);
for(const k of baseline.P2)assert(cx.includes(k),`P2 missing calculation contract: ${k}`);
for(const k of baseline.P3)assert(imp.includes(k),`P3 missing planning contract: ${k}`);
for(const k of baseline.P4)assert(budget.includes(k),`P4 missing cost contract: ${k}`);
for(const k of baseline.P5)assert(outcome.includes(k),`P5 missing outcome contract: ${k}`);
for(const k of baseline.P6)assert(perm.includes(k),`P6 missing governance contract: ${k}`);
for(const k of baseline.P7)assert(['tests/run-build.mjs','tests/r55-regression-contract.js','assets/auth.js','assets/firebase-client.js'].every(f=>fs.existsSync(path.join(root,f))),`P7 missing regression/auth artifact`);
assert(net.includes('netlify/functions')&&net.includes('NODE_VERSION')&&net.includes('/api/*'),'P8 Netlify contract incomplete');
assert(fb.includes('firestore.rules')&&rules.includes('rules_version'),'P8 Firebase rules contract incomplete');
console.log('P1_P8_FUNCTIONAL_BASELINE_PASS');
