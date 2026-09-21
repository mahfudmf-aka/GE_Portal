'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = process.cwd();
const fail = [];
const exists = rel => fs.existsSync(path.join(root, rel));
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const sha = rel => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, rel))).digest('hex');
const pass = m => console.log(m);
const bad = m => fail.push(m);

const frozen = {
  'assets/auth.js':'2624398450a3385a487559b0d93fa81633130b94abbc95b0c1cd7ddd0d75b49c',
  'assets/firebase-client.js':'433fc3f068d3d55d1b64dcf126101306d8acd147e39ef888d1c2a5fa35cdcb89',
  'assets/portal-shell.js':'d38bda36ef572d69cf96c92ef681f1efcd7aee03508e3e583358523f82717cda',
  'assets/dashboard-pov.js':'fc155e455330d1484fe6f938614157f29992370d323829bc54bad35677c6f8c2',
  'assets/lounge-planning-v29.js':'eedb2b3975352bf3393f78e9ce6bbf43abbcc7b5090bedc2b9b81eda0876e78f',
  'assets/overlay-v30.js':'f14886d3a7b0ec10880159fb99c9a252cf3db20130af5ce5a86e67968dc29d4c',
  'assets/access-assistance-p32.js':'9081faf058324a1a417c5ddbd6be74ca62e784ba1a5534764afdacff0fbedfd1',
  'assets/profile-p27.js':'80d1eb21ca1c042929a34ef30b797f15de24cea4df1268266e52a70562c05a8d',
  'assets/password-p27.js':'16bcf6bb1c5a72e93d4a1f9f8a928edad478c70d2a8029328931dad685f29919',
  'netlify/functions/auth-session.js':'abc2053bf75cb87c02c16924ff26f85125e5fc79e33dea1ed95581052a68cb08',
  'netlify/functions/auth-change-password.js':'37d3b8213054e0f04a1e2736413f4e132f58204decf8251659543148f89030c3',
  'netlify/functions/auth-reset-password.js':'2504a5e5809bb3fa034771b5f28f5ce3cbf32d0b3f28f33dacc7a3e98d909aac',
  'netlify/functions/_firebase.js':'cc686a8ccc12b71310b78f7e85852c4ec0e38b8baf8f51025bfdaa4c74435648',
  'firestore.rules':'cfacd60f63284009780291530b8aced754c7fc269b19527c1261c6faabecccef',
  'package.json':'2734a47e3fdeb2c6705fadb6f2bdbadf7e0d2c022554c3c61c52067e3c3aca3f',
  'package-lock.json':'58bf92231a8dde9730d3c006db0611c182f43c907333dfe075834fa7e98083a0',
  'netlify.toml':'fbd3643c86b9c3a3719184c4d230b1a3b2dc54949087bb24ac35a8ba8384fb85'
};

for (const [rel, expected] of Object.entries(frozen)) {
  if (!exists(rel)) bad(`Missing frozen file: ${rel}`);
  else if (sha(rel) !== expected) bad(`Frozen file changed: ${rel}`);
}

const required = [
  'asset-facility.html',
  'assets/asset-facility-p39.js',
  'assets/p39-asset-config.json',
  'netlify/functions/asset-facility.js',
  'service-locations.html',
  'docs/P39_ASSET_FACILITY_REPORT.md'
];
required.forEach(x => { if (!exists(x)) bad(`Missing P39 file: ${x}`); });

if (exists('assets/p39-asset-config.json')) {
  const cfg = JSON.parse(read('assets/p39-asset-config.json'));
  for (const k of ['facilityTypes','ownership','categories','conditions','operationalStatuses','trackingModes','units']) {
    if (!Array.isArray(cfg[k]) || !cfg[k].length) bad(`P39 taxonomy missing: ${k}`);
  }
}

const api = read('netlify/functions/asset-facility.js');
[
  "collection('geAssets')",
  "collection('geFacilities')",
  "collection('lounges')",
  'verifyIdToken(token, true)',
  'scopeType',
  'accessLevel',
  'RETIRE_ASSET',
  'DUPLICATE_ASSET_TAG',
  'P39_ASSET_FACILITY'
].forEach(x => { if (!api.includes(x)) bad(`P39 API contract missing: ${x}`); });
if (/seed|mock|dummy/i.test(api)) bad('P39 API must not contain seed/mock/dummy asset behavior.');

const page = read('asset-facility.html');
[
  'Asset & Facility Management',
  'Existing Lounge',
  'Readiness / Capability formulas are not changed'
].forEach(x => { if (!page.includes(x)) bad(`P39 UI contract missing: ${x}`); });

const assetModule = read('assets/asset-facility-p39.js');
['No local asset seed or mock data is used','Individual Tracking','Quantity Tracking'].forEach(x => { if (!assetModule.includes(x)) bad(`P39 UI contract missing: ${x}`); });

const locations = read('service-locations.html');
if (!locations.includes('asset-facility.html')) bad('Service Location context link to P39 is missing.');

const config = read('assets/asset-facility-p39.js');
if (/const CATEGORY=\[|const OWNERSHIP=\[|const CONDITION=\[|const STATUS=\[/.test(config)) bad('P39 taxonomies must come from the single JSON configuration source.');

if (fail.length) {
  fail.forEach(x => console.error(`P39_REPOSITORY_FAIL ${x}`));
  process.exit(1);
}
pass('P39_ASSET_FACILITY_CONTRACT_PASS');
pass('P39_FROZEN_BASELINE_INTEGRITY_PASS');
