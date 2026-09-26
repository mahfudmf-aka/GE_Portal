const fs=require('fs');
function must(v,m){if(!v)throw new Error(m)}
const fc=fs.readFileSync('assets/firebase-client.js','utf8');
const as=fs.readFileSync('netlify/functions/auth-session.js','utf8');
const login=fs.readFileSync('login.html','utf8');
const css=fs.readFileSync('assets/portal.css','utf8');
must(fc.includes('Auth.Persistence.LOCAL'),'Firebase auth must remain LOCAL persistent');
must(fc.includes('getIdToken(attempt===1)'),'profile lookup must retry with refreshed ID token');
must(fc.includes("collection('users').doc(String(authUser.uid)).get()"),'signed-in own-profile Firestore fallback missing');
must(!as.includes('verifyIdToken(token, true)'),'session endpoint must not perform revocation lookup on every restore');
must(as.includes('verifyIdToken(token)'),'session endpoint must still cryptographically verify ID token');
must(login.includes('firebase-client.js?v=3'),'login must bust stale auth client cache');
must(css.includes('.login-submit{background:#0b356b!important;color:#fff!important'),'login action must use canonical navy/white styling');
console.log('R21_AUTH_PERSISTENCE_CONTRACT_PASS');
