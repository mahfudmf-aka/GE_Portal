'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = process.cwd();
const required = [
  'package.json','package-lock.json','netlify.toml','firebase.json','firestore.rules',
  'assets/auth.js','assets/firebase-client.js','assets/portal-shell.js','assets/dashboard-pov.js',
  'assets/lounge-planning-v29.js','assets/overlay-v30.js','assets/access-assistance-p32.js',
  'assets/profile-p27.js','assets/password-p27.js','netlify/functions/_firebase.js',
  'netlify/functions/auth-session.js','netlify/functions/auth-change-password.js',
  'netlify/functions/auth-reset-password.js','netlify/functions/auth-update-self-profile.js',
  'netlify/functions/auth-complete-password-change.js'
];
const frozen = {
  'assets/auth.js':'2624398450a3385a487559b0d93fa81633130b94abbc95b0c1cd7ddd0d75b49c',
  'assets/firebase-client.js':'433fc3f068d3d55d1b64dcf126101306d8acd147e39ef888d1c2a5fa35cdcb89',
  'assets/portal-shell.js':'d38bda36ef572d69cf96c92ef681f1efcd7aee03508e3e583358523f82717cda',
  'assets/dashboard-pov.js':'fc155e455330d1484fe6f938614157f29992370d323829bc54bad35677c6f8c2',
  'assets/lounge-planning-v29.js':'eedb2b3975352bf3393f78e9ce6bbf43abbcc7b5090bedc2b9b81eda0876e78f',
  'assets/overlay-v30.js':'f14886d3a7b0ec10880159fb99c9a252cf3db20130af5ce5a86e67968dc29d4c',
  'assets/access-assistance-p32.js':'9081faf058324a1a417c5ddbd6be74ca62e784ba1a5534764afdacff0fbedfd1',
  'firestore.rules':'cfacd60f63284009780291530b8aced754c7fc269b19527c1261c6faabecccef'
};

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function sha(rel){ return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, rel))).digest('hex'); }
function assert(cond,msg){ if(!cond) throw new Error(msg); }

for (const rel of required) assert(exists(rel), `REQUIRED_FILE_MISSING ${rel}`);
const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
assert(pkg.scripts.dev === 'netlify dev', 'DEV_SCRIPT_NOT_NETLIFY_DEV');
assert(pkg.scripts['package:deploy'] === 'node tools/package-deploy.mjs', 'DEPLOY_SCRIPT_MISSING');
assert(pkg.scripts['verify:repo'] === 'node tests/p38-repository-hygiene.js', 'REPO_VERIFY_SCRIPT_MISSING');
const toml = fs.readFileSync(path.join(root,'netlify.toml'),'utf8');
assert(/\[dev\]/.test(toml) && /framework\s*=\s*"#static"/.test(toml) && /port\s*=\s*8888/.test(toml), 'NETLIFY_DEV_CONFIG_INVALID');
const gi = fs.readFileSync(path.join(root,'.gitignore'),'utf8');
for (const x of ['node_modules/','.netlify/','.env','!.env.example','artifacts/']) assert(gi.includes(x), `GITIGNORE_MISSING ${x}`);
for (const [rel, expected] of Object.entries(frozen)) {
  if (!exists(rel)) throw new Error(`FROZEN_FILE_MISSING ${rel}`);
  assert(sha(rel) === expected, `FROZEN_HASH_MISMATCH ${rel}`);
}
for (const rel of ['.env','.env.local','.netlify']) assert(!exists(rel), `LOCAL_STATE_PRESENT ${rel}`);
console.log('P38_REPOSITORY_HYGIENE_PASS');
