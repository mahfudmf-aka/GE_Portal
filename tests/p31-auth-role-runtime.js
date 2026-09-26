'use strict';
const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const shell=fs.readFileSync('assets/portal-shell.js','utf8');
const m=shell.match(/function dashboardPOV\(s\)\{[\s\S]*?\n\}\nwindow\.GXDashboardPOV/);
if(!m)throw new Error('dashboardPOV resolver not found');
const ctx={};vm.createContext(ctx);vm.runInContext(m[0].replace(/\nwindow\.GXDashboardPOV[\s\S]*$/,'')+';this.dashboardPOV=dashboardPOV;',ctx);
const cases={
  'Super Admin':'superadmin',
  'Management':'management',
  'Head Office':'ge-team',
  'HeadOffice':'ge-team',
  'Branch Office':'branch',
  'BranchOffice':'branch',
  'Admin':'admin',
  'Unknown':'unresolved'
};
for(const [role,want] of Object.entries(cases))assert.strictEqual(ctx.dashboardPOV({role}),want,role);
assert.strictEqual(ctx.dashboardPOV({role:'Management',accessLevel:'Admin'}),'management');
assert.strictEqual(ctx.dashboardPOV({role:'Head Office',accessLevel:'Admin'}),'ge-team');
assert.strictEqual(ctx.dashboardPOV({role:'Branch Office',accessLevel:'Admin',airports:['DPS']}),'branch');
console.log('P31_ROLE_POV_RUNTIME_PASS');
