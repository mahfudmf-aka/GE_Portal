'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

const client = read('assets/firebase-client.js');
const sessionFn = read('netlify/functions/auth-session.js');
const fnPkg = JSON.parse(read('netlify/functions/package.json'));
const netlify = read('netlify.toml');

// Firebase Authentication remains the credential authority; this test is only for the post-auth service.
assert(client.includes("fetch('/api/auth-session'"), 'Post-auth profile lookup must use auth-session');
assert(sessionFn.includes("db.collection('users').doc(decoded.uid).get()"), 'auth-session must resolve the existing UID profile');
assert(fnPkg.dependencies && fnPkg.dependencies['firebase-admin'], 'Function dependency manifest must declare firebase-admin');

// Netlify does not recursively install dependencies from nested function package manifests.
// The deployment build must therefore explicitly install the function dependency tree.
assert(netlify.includes('npm --prefix netlify/functions install --omit=dev --ignore-scripts'), 'Netlify build must install function dependencies before bundling');
assert(netlify.includes('directory = "netlify/functions"'), 'Netlify functions directory must remain configured');
assert(netlify.includes('from = "/api/*"') && netlify.includes('to = "/.netlify/functions/:splat"'), 'API rewrite must remain configured');

// The server-only profile rule remains intact; do not expose users/{uid} from the browser.
const rules = read('firestore.rules');
assert(rules.includes("match /users/{uid} { allow read, write: if false; }"), 'Users profile must remain server-only');
assert(!client.includes("collection('users').doc(String(uid)).get()"), 'Browser must not bypass server-only profile rules');

console.log('P31A_SESSION_PROFILE_SERVICE_PASS');
