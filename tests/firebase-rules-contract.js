'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const assert = (c,m) => { if (!c) throw new Error(m); };
const rules = read('firestore.rules');
const required = [
  "rules_version = '2';",
  "function signedIn() { return request.auth != null; }",
  "function me() { return get(/databases/$(database)/documents/users/$(request.auth.uid)); }",
  "function active() { return signedIn() && me().data.status == 'Active'; }",
  "function manager() { return active() && me().data.role in ['Super Admin', 'Admin']; }",
  'match /users/{uid}',
  'allow read: if signedIn() && request.auth.uid == uid;',
  'allow read: if active();',
  'allow create: if signedIn() && request.auth.uid == uid;',
  'allow update, delete: if manager();',
  'match /portalData/{group}/{document=**}',
  'allow read: if active();',
  'allow write: if manager();',
  'match /portalMetadata/{document=**}',
  'allow read: if active();',
  'allow write: if manager();'
];
for (const x of required) assert(rules.includes(x), `Firebase rules contract missing: ${x}`);
assert(!rules.includes('usernameIndex'), 'Existing rules must not be expanded with usernameIndex.');
assert(!rules.includes('auditLogs/{id}'), 'Existing rules must not be expanded with auditLogs.');
const data = read('netlify/functions/edition1-data.js');
assert(data.includes("db.collection('portalData')"), 'Edition 1 data adapter must target portalData.');
assert(data.includes("collection('records')"), 'Edition 1 data adapter must target the existing records level.');
const client = read('assets/firebase-client.js');
assert(!client.includes("s.db.collection('initiatives')"), 'Client must not directly read top-level initiatives under locked rules.');
assert(!client.includes("s.db.collection('inbox')"), 'Client must not directly read top-level inbox under locked rules.');
console.log('FIREBASE_RULES_CONTRACT_PASS');
