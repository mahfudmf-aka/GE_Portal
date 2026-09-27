import fs from 'node:fs';
const css=fs.readFileSync('assets/portal.css','utf8');
const dash=fs.readFileSync('assets/dashboard-firestore.js','utf8');
const app=fs.readFileSync('app.html','utf8');
const reg=fs.readFileSync('assets/clean-page-registry.js','utf8');
function ok(v,m){if(!v)throw new Error(m)}
ok(css.includes('html body.final-v257.final-shell-r5.e1-page>.shell>.side'),'R44 canonical sidebar selector missing');
ok(css.includes('background:rgba(255,255,255,.85)!important'),'R44 transparent sidebar missing');
ok(css.includes('.ge-nav-link.active')&&css.includes('inset 3px 0 0 #135397'),'R44 active sidebar treatment missing');
ok(dash.includes('Portal Control Center'),'R44 Super Admin control center missing');
ok(dash.includes('SYSTEM & PORTAL CONTROL'),'R44 portal control panel missing');
ok(dash.includes('USER & ACCESS HEALTH'),'R44 user/access panel missing');
ok(dash.includes('ENGINE READINESS'),'R44 engine readiness panel missing');
ok(dash.includes('DATA & MASTER COMPLETENESS'),'R44 data completeness panel missing');
ok(dash.includes('RECENT SYSTEM ACTIVITY'),'R44 recent activity panel missing');
ok(!dash.includes('class="ge-pov-dashboard superadmin-pov ge-ref-dashboard r43-superadmin"'),'R43 superadmin dashboard still active');
ok(/portal\.css\?v=r(?:44|45|51|52|53|54|56)/.test(app),'R44 CSS cache identity missing');
ok(/dashboard-firestore\.js\?v=r(?:44|50|51|52|53|54|56)/.test(reg),'R44 dashboard cache identity missing');
console.log('R44_SIDEBAR_SUPERADMIN_CONTRACT_PASS');
