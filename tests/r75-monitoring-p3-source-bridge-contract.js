/* P106 — Monitoring Assessment -> existing P3.1 source bridge contract. */
'use strict';
const fs=require('fs');
const fm=fs.readFileSync('assets/form-management.js','utf8');
const p3=fs.readFileSync('assets/improvement-v257.js','utf8');
const mustFm=["source:'monitoring-assessment'","sourceFormId:t.id||''","assessmentContext:{formId:","journeyScopes:Array.isArray(t.journeyScopes)","touchpointIds:Array.isArray(t.touchpointIds)","assessmentIndicator:t.assessmentIndicator||''","status:'Open'"];
const mustP3=["sourceType:'Monitoring Assessment Finding'","source:'P2 Monitoring & Assessment'","sourceFormId:f.sourceFormId||ctx.formId||s.templateId||''","assessmentId:s.id","assessmentContext:{formId:ctx.formId||s.templateId||''","function stationIdFor(code)","function importSources()","function sourceSnapshot(x)","x.sourceType==='Monitoring Assessment Finding'"];
for(const s of mustFm) if(!fm.includes(s)) throw new Error('FORM_CONTRACT_MISSING: '+s);
for(const s of mustP3) if(!p3.includes(s)) throw new Error('P3_BRIDGE_CONTRACT_MISSING: '+s);
if(!/const sourceId=`\$\{s\.id\}:\$\{f\.id\}`/.test(p3)) throw new Error('P3_BRIDGE_SOURCE_ID_NOT_STABLE');
if(!/existing\.has\(k\)/.test(p3)) throw new Error('P3_BRIDGE_DEDUP_GUARD_MISSING');
console.log('R75_MONITORING_P3_SOURCE_BRIDGE_CONTRACT_PASS');
