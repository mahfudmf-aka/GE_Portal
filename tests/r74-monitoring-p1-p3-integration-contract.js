const fs=require('fs');
const src=fs.readFileSync('assets/form-management.js','utf8');
const must=[
  "source:'monitoring-assessment'",
  'sourceFormId:t.id||\'\'',
  'sourceFormVersion:Number(t.currentVersion)||0',
  "status:'Open'",
  'assessmentContext:{formId:',
  'journeyScopes:Array.isArray(t.journeyScopes)',
  'touchpointIds:Array.isArray(t.touchpointIds)',
  'assessmentIndicator:t.assessmentIndicator||\'\''
];
for(const x of must) if(!src.includes(x)) throw new Error(`Canonical Monitoring integration marker missing: ${x}`);
if(!src.includes("requirementRef:f.requirementRef||''")) throw new Error('Finding must preserve Requirement reference.');
if(!src.includes("touchpointId:f.touchpointId||''")) throw new Error('Finding must preserve Touch Point reference.');
if(!src.includes("journey:f.journey||''")) throw new Error('Finding must preserve Journey reference.');
if(!src.includes("pillar:f.pillar||''")) throw new Error('Finding must preserve Pillar reference.');
console.log('R74_MONITORING_P1_P3_INTEGRATION_CONTRACT_PASS');
