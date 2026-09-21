
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p), 'utf8');
const assert = (cond,msg) => { if(!cond) throw new Error(msg); };

const sourceFiles = [
  'assets/auth.js','assets/app.js','assets/data.js','admin.html','login.html',
  'change-password.html','netlify/functions/_firebase.js',
  'netlify/functions/auth-login.js','netlify/functions/auth-create-user.js',
  'netlify/functions/auth-update-user.js','netlify/functions/auth-reset-password.js',
  'netlify/functions/auth-change-password.js','netlify/functions/auth-session.js',
  'netlify/functions/auth-list-users.js'
];

for (const file of sourceFiles) {
  const s = read(file);
  assert(!/\bpassword\s*:\s*['"][^'"]+['"]/i.test(s), `${file}: plaintext password literal found`);
  assert(!/temporaryPassword\s*:\s*['"][^'"]+['"]/i.test(s), `${file}: temporary password literal found`);
}

const admin = read('admin.html');
const p26ui = read('assets/user-access-p26.js');
assert(p26ui.includes('id=\"p26Email\"'), 'P26 user form missing email');
assert(p26ui.includes('id=\"p26Password\"'), 'P26 user form missing temporary password');
assert(p26ui.includes('id=\"p26PasswordConfirm\"'), 'P26 user form missing password confirmation');

const create = read('netlify/functions/auth-create-user.js');
assert(create.includes("role === 'Super Admin'"), 'Super Admin creation guard missing');
assert(create.includes('hasUserManagementPermission'), 'Create User permission guard missing');
assert(create.includes('mustChangePassword: true'), 'mustChangePassword not set on create');
assert(create.includes('auth.deleteUser(created.uid)'), 'Auth compensation rollback missing');
assert(create.includes('usernameIndex'), 'Username index missing');

const change = read('netlify/functions/auth-change-password.js');
assert(change.includes('profile.mustChangePassword'), 'Forced password-change guard missing');
assert(change.includes('mustChangePassword: false'), 'Password-change completion flag missing');

const reset = read('netlify/functions/auth-reset-password.js');
assert(reset.includes('mustChangePassword: true'), 'Reset must require password change');
assert(reset.includes('RESET_PASSWORD'), 'Reset audit action missing');

const update = read('netlify/functions/auth-update-user.js');
assert(update.includes("role === 'Super Admin'"), 'Super Admin assignment guard missing');
assert(update.includes("current.role === 'Super Admin'"), 'Existing Super Admin protection missing');
for (const action of ['DISABLE_USER','ENABLE_USER','CHANGE_ROLE','CHANGE_SCOPE']) assert(update.includes(action), `${action} audit action missing`);

const netlify = read('netlify.toml');
assert(netlify.includes('from = "/api/*"'), 'API redirect missing');

const shell = read('assets/portal-shell.js');
assert(shell.includes("item('planning-workspace.html','Planning Workspace'"), 'Planning Workspace nav missing');
assert(shell.includes('PLANNING_TABS'), 'Planning tabs missing');
assert(!shell.includes("item('lounge-list.html','Lounge/Tenant Planning'"), 'Legacy Lounge/Tenant sidebar entry still present');
assert(!shell.includes("item('branch-office-planning.html','Branch Office Planning'"), 'Legacy Branch Office sidebar entry still present');
assert(!shell.includes("item('gaso-planning.html','GASO Planning'"), 'Legacy GASO sidebar entry still present');
assert(shell.includes("['lounge-list.html','Lounge / Tenant','lounge']"), 'Lounge workspace tab missing');
assert(shell.includes("['branch-office-planning.html','Branch Office','branch']"), 'Branch workspace tab missing');
assert(shell.includes("['gaso-planning.html','GASO','gaso']"), 'GASO workspace tab missing');
assert(p26ui.includes("ROLE_VALUES=['Management','Head Office','Branch Office']"), 'Management target role missing');
assert(!read('admin.html').includes('<option>Super Admin</option>'), 'Super Admin must not be a normal creatable target');
assert(read('assets/user-access-p26.js').includes("ROLE_VALUES=['Management','Head Office','Branch Office']"), 'P26 organizational role contract missing');
assert(read('assets/user-access-p26.js').includes('p26ImportModal'), 'P26 CSV import modal missing');
assert(read('assets/user-access-p26.js').includes('p26UserModal'), 'P26 user modal missing');
assert(read('assets/page-identity-v28.js').includes('account-access-management'), 'P28 Account page identity missing');
assert(read('assets/page-identity-v28.js').includes('journey-touchpoint'), 'P28 Journey page identity missing');
assert(read('assets/overlay-v30.js').includes('2147483000'), 'P30 overlay layer missing');
assert(read('assets/overlay-v30.js').includes('focusMemory'), 'P30 focus management missing');
assert(read('assets/portal-shell.js').includes("if(r==='super admin'||r==='superadmin')return 'superadmin';"), 'Legacy Admin must not map to Super Admin POV');
console.log('REGRESSION_AUDIT_PASS');
