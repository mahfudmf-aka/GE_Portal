'use strict';
const fs=require('fs');
const path=require('path');
const assert=require('assert');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const firebaseClient=read('assets/firebase-client.js');
const auth=read('assets/auth.js');
const login=read('login.html');
const shell=read('assets/portal-shell.js');
const sessionFn=read('netlify/functions/auth-session.js');
const rules=read('firestore.rules');

// Firebase Authentication remains the primary credential check.
assert(login.includes('assets/firebase-client.js'), 'Firebase client must remain on login page');
assert(firebaseClient.includes('signInWithEmailAndPassword'), 'Email/password Firebase Authentication must remain');
assert(firebaseClient.includes("fetch('/api/auth-session'"), 'Post-auth profile lookup must use secure session endpoint');
assert(!firebaseClient.includes("collection('users').doc(String(uid)).get()"), 'Client must not read server-only user profiles directly');

// The identified root cause: client profile reads are blocked by the deployed rules.
assert(rules.includes("match /users/{uid} { allow read, write: if false; }"), 'Server-only users rule must remain intact');
assert(sessionFn.includes("db.collection('users').doc(decoded.uid).get()"), 'Server session endpoint must perform the profile lookup');
assert(sessionFn.includes("'PROFILE_NOT_FOUND'"), 'Missing profile must be distinguished');
assert(sessionFn.includes("'ACCOUNT_INACTIVE'"), 'Inactive account must be distinguished');

// Safe compatibility defaults: missing new metadata never escalates privileges.
assert(firebaseClient.includes("role==='Super Admin'?'Admin':'Viewer'"), 'Missing accessLevel must not default to Admin except Super Admin compatibility');
assert(firebaseClient.includes("permissions=Array.isArray(p.permissions)?p.permissions.map(String):[]"), 'Missing permissions must default to empty');
assert(firebaseClient.includes("authorizationState:"), 'Unknown/legacy profile must carry controlled review state');
assert(auth.includes("if(s.role==='Admin'){if(permission==='admin')return gxHasUserManagementPermission();"), 'Legacy Admin permission checks must fail closed');
assert(auth.includes("if(page==='index.html'&&s&&window.GXDashboardPOV&&window.GXDashboardPOV(s)==='unresolved')return;"), 'Unresolved role must not create an index/login redirect loop');

// Admin remains a legacy role and cannot become SuperAdmin through POV resolution.
assert(shell.includes("if(r==='super admin'||r==='superadmin')return 'superadmin';"), 'SuperAdmin POV mapping missing');
assert(shell.includes("return 'unresolved';"), 'Unknown/legacy roles must resolve to unresolved POV');
assert(!shell.includes("r==='admin')return 'superadmin'"), 'Legacy Admin must never map to SuperAdmin');

// P30 is not on the authentication page; overlay code remains portal-wide elsewhere.
assert(!login.includes('overlay-v30.js'), 'P30 overlay must not participate in login initialization');
assert(fs.existsSync(path.join(root,'assets/overlay-v30.js')), 'P30 overlay implementation must remain present');
assert(fs.existsSync(path.join(root,'assets/page-identity-v28.js')), 'P28 page identity implementation must remain present');
assert(fs.existsSync(path.join(root,'assets/user-access-p26.js')), 'P26 user management implementation must remain present');

// P29 business/data implementation remains untouched.
assert(fs.existsSync(path.join(root,'assets/lounge-planning-v29.js')), 'P29 lounge planning implementation must remain present');

console.log('P31_AUTHENTICATION_CONTRACT_PASS');
