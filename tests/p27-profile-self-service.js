'use strict';

const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const vm=require('vm');
const assert=require('assert');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const profile=read('profile.html');
const passwordPage=read('change-password.html');
const profileJs=read('assets/profile-p27.js');
const passwordJs=read('assets/password-p27.js');
const selfUpdate=read('netlify/functions/auth-update-self-profile.js');
const lifecycle=read('netlify/functions/auth-complete-password-change.js');
const create=read('netlify/functions/auth-create-user.js');
const reset=read('netlify/functions/auth-reset-password.js');
const auth=read('assets/auth.js');
const firebaseClient=read('assets/firebase-client.js');
const p32=read('assets/access-assistance-p32.js');
const p32Admin=read('netlify/functions/access-assistance-admin.js');
const p32Request=read('netlify/functions/access-assistance-request.js');
const overlay=read('assets/overlay-v30.js');
const shell=read('assets/portal-shell.js');

assert(profile.includes('My Profile'),'Profile title missing');
assert(profile.includes('assets/firebase-client.js'),'Profile must use existing Firebase client');
assert(profile.includes('assets/profile-p27.js'),'P27 profile layer missing');
assert(profileJs.includes("window.gxApi('/auth-update-self-profile'"),'Profile update must use authenticated API');
assert(profileJs.includes('fullName:name'),'Only safe personal field is submitted');
assert(!profileJs.includes('role:')&&!profileJs.includes('accessLevel:')&&!profileJs.includes('scopeType:')&&!profileJs.includes('permissions:'),'Profile client must not submit administrative access fields');
assert(profileJs.includes('Assigned Station(s)')&&profileJs.includes('Assigned Lounge(s)'),'Data scope presentation missing');
assert(profileJs.includes('Role')&&profileJs.includes('Access Level')&&profileJs.includes('Scope Type'),'Access summary missing');
assert(profileJs.includes('Legacy Account Configuration')&&profileJs.includes('Requires Review'),'Legacy review state missing');
assert(profileJs.includes("'Admin':'Admin (legacy)'"),'Legacy Admin must remain distinct from Super Admin');
assert(profileJs.includes("if(String(u?.role||'')==='Super Admin')return modules.map(x=>x[0]);"),'Super Admin permission presentation must not elevate other roles');

assert(selfUpdate.includes("decoded = await auth.verifyIdToken(token, true)"),'Self-profile update must verify authenticated token');
assert(selfUpdate.includes("db.collection('users').doc(decoded.uid)"),'Self-profile update must derive profile from authenticated UID');
assert(selfUpdate.includes("const allowedKeys = new Set(['fullName'])"),'Self-profile endpoint must allow only Employee Name');
assert(selfUpdate.includes('auth.updateUser(decoded.uid, { displayName: fullName })'),'Self-profile name update must synchronize Firebase display name');
assert(selfUpdate.includes("ref.update({ name: fullName"),'Self-profile Firestore write must update only safe metadata');
assert(selfUpdate.includes('UPDATE_SELF_PROFILE'),'Self-profile audit action missing');
assert(!selfUpdate.includes('body.role')&&!selfUpdate.includes('body.accessLevel')&&!selfUpdate.includes('body.scopeType')&&!selfUpdate.includes('body.airports')&&!selfUpdate.includes('body.loungeIds')&&!selfUpdate.includes('body.permissions'),'Self-profile endpoint must not accept administrative scope fields');

assert(passwordPage.includes('Current Password')&&passwordPage.includes('New Password')&&passwordPage.includes('Confirm New Password'),'Password form fields missing');
assert(passwordPage.includes('autocomplete="current-password"')&&passwordPage.includes('autocomplete="new-password"'),'Password autocomplete behavior missing');
assert(passwordJs.includes('EmailAuthProvider.credential'),'Firebase email credential reauthentication missing');
assert(passwordJs.includes('reauthenticateWithCredential'),'Current-password reauthentication missing');
assert(passwordJs.includes('updatePassword'),'Firebase password update missing');
assert(passwordJs.includes("'/api/auth-complete-password-change'"),'Password lifecycle completion endpoint missing');
for(const secret of ['passwordHash','temporaryPassword','refreshToken','accessToken','idToken']) assert(!passwordJs.includes(secret),'Password client must not handle/store '+secret);
assert(!passwordJs.includes("gxApi('/auth-change-password"),'Self-service password must not reuse forced-change-only endpoint');

assert(lifecycle.includes("decoded = await auth.verifyIdToken(token, true)"),'Lifecycle completion must verify token');
assert(lifecycle.includes('auth_time'),'Lifecycle completion must require recent authentication');
assert(lifecycle.includes("db.collection('users').doc(decoded.uid)"),'Lifecycle completion must derive UID from token');
assert(lifecycle.includes('mustChangePassword: false'),'Lifecycle flag must be cleared only after authenticated completion');
assert(lifecycle.includes('COMPLETE_PASSWORD_LIFECYCLE'),'Lifecycle audit action missing');

assert(create.includes('mustChangePassword: true'),'New P26-created users must carry explicit lifecycle flag');
assert(reset.includes('mustChangePassword: true'),'Admin reset must retain temporary-password lifecycle');
assert(auth.includes('function gxDefaultPage()'),'Existing auth pipeline remains present');
assert(firebaseClient.includes('signInWithEmailAndPassword'),'Existing Firebase login remains present');
assert(firebaseClient.includes("fetch('/api/auth-session'"),'Existing session profile service remains present');
assert(shell.includes('function dashboardPOV'),'Dashboard POV resolver remains present');
assert(p32Admin.includes('accessAssistanceRequests')&&p32Request.includes('accessAssistanceRequests'),'P32 Access Assistance collection remains present');
assert(overlay.includes('focusMemory'),'P30 overlay remains present');

function loadBrowserScript(source){
  const context={window:{},document:{readyState:'loading',addEventListener(){}},setTimeout(){},console,URLSearchParams};
  vm.runInNewContext(source,context,{filename:'p27-test.js'});
  return context.window;
}
const profileApi=loadBrowserScript(profileJs).GXP27;
assert.strictEqual(JSON.stringify(profileApi.permissionLabels({role:'Management',permissions:['home','planning','budget']})),JSON.stringify(['Dashboard','Improvement & Planning','Budget & Cost']));
assert.strictEqual(JSON.stringify(profileApi.permissionLabels({role:'Branch Office',permissions:[] ,tabs:['home','planning','data']})),JSON.stringify(['Dashboard','Improvement & Planning','Data Administration']));
assert.strictEqual(profileApi.scopeLabel({scopeType:'STATION'}),'Station');
assert.strictEqual(profileApi.scopeLabel({scopeType:'MULTI_STATION'}),'Multiple Stations');
assert.strictEqual(profileApi.scopeLabel({scopeType:'ALL'}),'All Area');
assert.strictEqual(profileApi.isLegacyReview({role:'Admin',accessLevel:'Admin',scopeType:'ALL',permissions:['home']}),true);
assert.strictEqual(profileApi.isLegacyReview({role:'Management',accessLevel:'Viewer',scopeType:'ALL',organizationType:'Internal',permissions:['home']}),false);
assert.strictEqual(profileApi.isLegacyReview({role:'Branch Office',airports:['CGK'],tabs:['home']}),true);

const passwordApi=loadBrowserScript(passwordJs).GXP27Password;
assert.strictEqual(passwordApi.validate('short','short','user','u@example.com'),'Password baru minimal 10 karakter.');
assert.strictEqual(passwordApi.validate('valid password','valid password','user','u@example.com'),'Password baru tidak boleh mengandung spasi.');
assert.strictEqual(passwordApi.validate('username','username','username','u@example.com'),'Password baru minimal 10 karakter.');
assert.strictEqual(passwordApi.validate('VeryStrongPass1','OtherStrong1','user','u@example.com'),'Password dan konfirmasi harus sama.');
assert.strictEqual(passwordApi.validate('VeryStrongPass1','VeryStrongPass1','user','u@example.com'),'');
assert.strictEqual(passwordApi.messageFor({code:'auth/wrong-password'}),'Current password tidak benar.');
assert.strictEqual(passwordApi.messageFor({code:'auth/requires-recent-login'}),'Session perlu reauthentication. Silakan coba lagi dengan current password.');
assert.strictEqual(passwordApi.messageFor({code:'auth/network-request-failed'}),'Perubahan password tidak dapat diselesaikan karena gangguan jaringan.');

// P31/P32/P33-P37 frozen foundation checks remain delegated to their existing contracts.
const frozen={
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
for(const [file,expected] of Object.entries(frozen)){
  const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
  assert.strictEqual(actual,expected,'Frozen foundation changed: '+file);
}

console.log('P27_PROFILE_SELF_SERVICE_CONTRACT_PASS');
