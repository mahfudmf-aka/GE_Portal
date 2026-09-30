import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (p) => fs.readFileSync(p, 'utf8');
const exists = (p) => fs.existsSync(p);

assert(exists('netlify.toml'), 'netlify.toml missing');
assert(exists('firebase.json'), 'firebase.json missing');
assert(exists('firestore.rules'), 'firestore.rules missing');
assert(exists('netlify/functions/package.json'), 'Functions package manifest missing');
assert(exists('README.md'), 'README deployment documentation missing');
assert(exists('docs/DEPLOYMENT_AND_DATA_COMPATIBILITY.md'), 'deployment compatibility gate missing');
assert(exists('.env.example'), '.env.example missing');

const netlify = read('netlify.toml');
assert(netlify.includes('npm --prefix netlify/functions install --omit=dev --ignore-scripts && npm run test'), 'Netlify build must install Functions dependencies and run canonical tests');
assert(netlify.includes('publish = "."'), 'Netlify publish directory must remain repository root');
assert(netlify.includes('directory = "netlify/functions"'), 'Netlify Functions directory must remain canonical');
assert(netlify.includes('from = "/api/*"') && netlify.includes('to = "/.netlify/functions/:splat"'), 'API redirect missing');
assert(netlify.includes('from = "/"') && netlify.includes('to = "/login.html"'), 'root login route missing');

const firebase = read('firebase.json');
assert(firebase.includes('"rules": "firestore.rules"'), 'Firebase Rules must remain canonical');
const rules = read('firestore.rules');
assert(rules.includes("rules_version = '2'"), 'Firestore rules version mismatch');
assert(rules.includes('match /portalData/{group}/{document=**}'), 'portalData security boundary missing');
assert(rules.includes('allow write: if manager();'), 'manager-only portalData write gate missing');

const fnPkg = JSON.parse(read('netlify/functions/package.json'));
assert(fnPkg.dependencies?.['firebase-admin'], 'firebase-admin must remain Functions-owned dependency');

const env = read('.env.example');
assert(env.includes('FIREBASE_SERVICE_ACCOUNT_JSON') || env.includes('FIREBASE_CLIENT_EMAIL'), 'Firebase server environment variable template missing');
assert(!/-----BEGIN (?:RSA )?PRIVATE KEY-----/.test(env), 'Private key material must never be committed');

const trackedFiles = fs.readdirSync('.', { withFileTypes: true }).flatMap((e) => e.isDirectory() ? [] : [e.name]);
assert(!trackedFiles.some((n) => /^\.env$/.test(n)), 'Real .env must not be committed');
assert(!trackedFiles.some((n) => /service-account|credentials?\.json|private-key/i.test(n)), 'Credential artifact must not be committed at repository root');

const readme = read('README.md');
const deployment = read('docs/DEPLOYMENT_AND_DATA_COMPATIBILITY.md');
assert(/Deploy Preview/i.test(readme) && /rollback/i.test(readme), 'Deployment preview/rollback documentation missing');
assert(/previous successful production deploy/i.test(deployment), 'Rollback procedure missing');
assert(/Do not create a new Firebase project|Gunakan existing Firebase project/i.test(readme + '\n' + deployment), 'Existing Firebase project protection missing');
assert(/do not run database migrations|tidak menjalankan migrasi|Tidak ada migrasi database otomatis/i.test(readme + '\n' + deployment), 'Deployment must not perform automatic database migration');
assert(/Do not commit|Jangan commit|secret/i.test(readme + '\n' + deployment), 'Secret-handling guidance missing');

const build = read('package.json');
assert(/"test"\s*:\s*"node tests\/run-build\.mjs"/.test(build), 'Canonical npm test entrypoint missing');

console.log('R81_P8_PRODUCTION_DEPLOYMENT_CONTRACT_PASS');
