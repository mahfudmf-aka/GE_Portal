#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
const root=process.env.GE_PORTAL_ROOT||process.cwd();
const reg=fs.readFileSync(root+'/assets/clean-page-registry.js','utf8');
const improvement=fs.readFileSync(root+'/assets/improvement-v257.js','utf8');
const requiredFiles=['improvement-intake.html','initiative-conversion.html','initiative-traceability.html'];
const requiredRefs={
  'improvement-intake.html':['Sync P2 Finding &amp; Gap','Save Opportunity','Opportunity Review &amp; Disposition','Integrity &amp; Traceability'],
  'initiative-conversion.html':['Create Draft Initiative','Trace Before Conversion','Conversion Register','Integrity &amp; Guardrail'],
  'initiative-traceability.html':['Create Milestone','Create Draft Activity','End-to-End Trace','Integration Register','Integrity &amp; Projection Guardrail']
};
const ctx={window:{}}; vm.runInNewContext(reg,ctx); const pages=ctx.window.P40_CLEAN_PAGES||{};
for(const k of ['improvement-intake','initiative-conversion','initiative-traceability','action-scenario']) if(!pages[k]) throw new Error('Canonical P3 route missing: '+k);
const exports=['bootstrap','list','get','intake','opportunity','disposition','importSources','sourceSnapshot','integrity','stats','addAction','addScenario','setPreferredScenario','planningForOpportunity','conversions','candidateStatus','conversionDraft','createDraftInitiative','conversionIntegrity','trace','convertedInitiatives','actionCandidates','createMilestone','createDraftActivityFromAction','traceForInitiative','integrationIntegrity','p34stats','phaseIntegrity','phaseStats'];
for(const name of exports) if(!new RegExp('(?:window\\.GEImprovement|Object\\.assign\\(window\\.GEImprovement)[^\\n]*\\b'+name+'\\b|\\b'+name+'\\b').test(improvement)) throw new Error('Canonical P3 capability missing: '+name);
if(!/const KEY='GE_V257_IMPROVEMENT_P31'/.test(improvement)) throw new Error('Unexpected P3 storage key / possible duplicate engine');
if(!/window\.GEImprovement=/.test(improvement)) throw new Error('Canonical GEImprovement engine export missing');
if(/new (?:collection|engine)|firebase.*collection/i.test(improvement)) throw new Error('P3 implementation unexpectedly introduces another persistence engine');
for(const [route,markers] of Object.entries({'improvement-intake':requiredRefs['improvement-intake.html'],'initiative-conversion':requiredRefs['initiative-conversion.html'],'initiative-traceability':requiredRefs['initiative-traceability.html']})){const html=String(pages[route].html||'');for(const marker of markers) if(!html.includes(marker)) throw new Error(`Canonical P3 contract marker missing in ${route}: ${marker}`)}
console.log('R76_P3_HTML_BASELINE_CONTRACT_PASS');
