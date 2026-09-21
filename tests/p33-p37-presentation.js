/* P33-P37 static/contract validation. No production data access. */
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pres=read('assets/p33-p37-presentation.js');
const css=read('assets/portal.css');

assert(pres.includes('GX_SEMANTIC_STATUS_V34'),'P34 semantic status API missing');
assert(pres.includes('gx-table-standard'),'P33 table standard missing');
assert(pres.includes('snapshotLounge'),'P36 Lounge Provider mapping missing');
assert(pres.includes('snapshotContractPending'),'P36 Contract Follow-up mapping missing');
assert(pres.includes('snapshotAirport'),'P36 Airport/BO mapping missing');
assert(pres.includes('snapshotPlanningMaster'),'P36 Planning Master mapping missing');
assert(pres.includes('geContractNeedsFollowup'),'P36 must reuse existing follow-up predicate');
assert(pres.includes('planningCard=contract-followup'),'P36 filter context missing');
assert(css.includes('.gx-status-positive')&&css.includes('.gx-status-warning')&&css.includes('.gx-status-critical')&&css.includes('.gx-status-process')&&css.includes('.gx-status-neutral'),'P34 status families incomplete');
assert(css.includes('>.footer')&&css.includes('--r103-side-c')&&css.includes('min-height:calc(100vh - var(--r103-header) - 58px)'),'P37 footer geometry missing');

const identity=read('assets/page-identity-v28.js');
for(const id of ['dashboard','planning-overview','planning-workspace','planning-documents','account-access-management','journey-touchpoint']) assert(identity.includes("pageId:'"+id+"'"),'missing pageId '+id);
assert(identity.includes('cfg.pages[reg.pageId]'),'page config must save by stable pageId');
assert(identity.includes('cfg?.pages?.[pageId]||cfg?.pages?.[r]'),'legacy same-route fallback missing');

const service=read('service-planning.html');
assert(service.includes('id="planning-master"'),'Planning Master anchor missing');
assert(/snapshotLounge/.test(read('assets/app.js'))&&/snapshotContractPending/.test(read('assets/app.js'))&&/snapshotAirport/.test(read('assets/app.js'))&&/snapshotPlanningMaster/.test(read('assets/app.js')),'P36 provenance source missing');

const admin=read('admin.html');
assert(admin.includes('Account &amp; Access Management'),'P35 admin title correction missing');


const crypto=require('crypto');
const frozenHashes={
 'assets/auth.js':'2624398450a3385a487559b0d93fa81633130b94abbc95b0c1cd7ddd0d75b49c',
 'assets/firebase-client.js':'433fc3f068d3d55d1b64dcf126101306d8acd147e39ef888d1c2a5fa35cdcb89',
 'netlify/functions/auth-session.js':'abc2053bf75cb87c02c16924ff26f85125e5fc79e33dea1ed95581052a68cb08',
 'netlify/functions/auth-change-password.js':'37d3b8213054e0f04a1e2736413f4e132f58204decf8251659543148f89030c3',
 'netlify/functions/auth-reset-password.js':'2504a5e5809bb3fa034771b5f28f5ce3cbf32d0b3f28f33dacc7a3e98d909aac',
 'assets/lounge-planning-v29.js':'eedb2b3975352bf3393f78e9ce6bbf43abbcc7b5090bedc2b9b81eda0876e78f',
 'assets/overlay-v30.js':'f14886d3a7b0ec10880159fb99c9a252cf3db20130af5ce5a86e67968dc29d4c',
 'assets/access-assistance-p32.js':'9081faf058324a1a417c5ddbd6be74ca62e784ba1a5534764afdacff0fbedfd1',
 'assets/portal-shell.js':'d38bda36ef572d69cf96c92ef681f1efcd7aee03508e3e583358523f82717cda',
 'netlify/functions/_firebase.js':'cc686a8ccc12b71310b78f7e85852c4ec0e38b8baf8f51025bfdaa4c74435648'
};
for(const [f,expected] of Object.entries(frozenHashes)){
 const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');
 assert.strictEqual(actual,expected,'Frozen P32 file changed: '+f);
}

const frozen=['assets/auth.js','assets/firebase-client.js','netlify/functions/auth-session.js','netlify/functions/auth-change-password.js','netlify/functions/auth-reset-password.js','assets/lounge-planning-v29.js','assets/overlay-v30.js','assets/access-assistance-p32.js'];
for(const f of frozen) assert(fs.existsSync(path.join(root,f)), 'frozen file missing: '+f);

console.log('P33_P34_P35_P36_P37_PRESENTATION_CONTRACT_PASS');
