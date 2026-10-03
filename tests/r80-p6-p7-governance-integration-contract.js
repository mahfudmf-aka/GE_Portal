'use strict';
const fs=require('fs'),assert=require('assert');
const auth=fs.readFileSync('assets/auth.js','utf8');
const permission=fs.readFileSync('assets/permission-v257.js','utf8');
const app=fs.readFileSync('app.html','utf8');
const rules=fs.readFileSync('firestore.rules','utf8');
const dataApi=fs.readFileSync('netlify/functions/edition1-data.js','utf8');

// P6: role/access/scope remains a governance layer, not a new business-data engine.
assert(permission.includes('Effective Access = Role + Scope + Domain + Action + Sensitivity + Business Authority.'),'P6 permission foundation missing');
assert(permission.includes('function scopeAllowed'),'P6 scope enforcement missing');
assert(permission.includes("grant.scope==='STATION'"),'P6 station scope contract missing');
assert(permission.includes("const businessActions=['Verify','Publish','Assess','Record Direction','Authorize']"),'P6 business-authority gate missing');
assert(auth.includes('function gxEnforcePageAccess()'),'P7 direct URL enforcement function missing');
assert(auth.includes('const GX_PAGE_PERMISSION_MAP='),'P7 page permission registry missing');
assert(auth.includes('if(permission&&!gxHasPermission(permission))'),'P7 direct URL permission check missing');
assert(auth.includes('function gxApplyNavigation()'),'P7 navigation permission enforcement missing');
assert(app.includes("if(['portal-management','audit-log'].includes(route)&&window.gxGetSession?.()?.role!=='Super Admin')"),'Super Admin direct route protection missing');
assert(app.includes("if(route==='attention-settings'&&!window.gxHasPermission?.('attention-settings'))"),'Attention settings route protection missing');

// P7: Firebase remains the existing nested data boundary; writes are manager-gated.
assert(rules.includes('match /users/{uid}'),'Existing users security boundary missing');
assert(rules.includes('match /portalData/{group}/{document=**}'),'Existing portalData security boundary missing');
assert(rules.includes('allow write: if manager();'),'portalData manager write gate missing');
assert(rules.includes('match /portalMetadata/{document=**}'),'Existing portalMetadata security boundary missing');
assert(dataApi.includes('auditLogs'),'Existing audit trail data path must remain available');

// No second governance/business-data engine is introduced by this contract.
assert(!permission.includes("collection('"),'Permission foundation must not introduce Firestore collections');
assert(!permission.includes('portalData/'),'Permission foundation must not create a parallel business-data path');

console.log('R80_P6_P7_GOVERNANCE_INTEGRATION_CONTRACT_PASS');
