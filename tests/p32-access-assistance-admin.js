'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const admin = read('admin.html');
const fn = read('netlify/functions/access-assistance-admin.js');
const submit = read('netlify/functions/access-assistance-request.js');
const p32 = read('assets/access-assistance-p32.js');
const schema = read('firebase-schema.md');
const shell = read('assets/portal-shell.js');
const auth = read('assets/auth.js');
const firebaseClient = read('assets/firebase-client.js');
const login = read('login.html');

assert(fs.existsSync(path.join(root, 'netlify/functions/access-assistance-admin.js')), 'P32 admin function missing.');
assert(fs.existsSync(path.join(root, 'assets/access-assistance-p32.js')), 'P32 admin UI module missing.');
assert(admin.includes('id="p32AccessAssistancePanel"'), 'P32 must reuse the existing Admin inbox surface.');
assert(admin.includes('Pesan Masuk'), 'Existing inbox surface must remain present.');
assert(admin.includes('Bantuan Akses Akun'), 'Admin Access Assistance surface missing.');
assert(!admin.includes('id="accessAssistanceNav"'), 'P32 must not add a new top-level navigation menu.');

assert(submit.includes("db.collection('accessAssistanceRequests').doc()"), 'Existing canonical request collection must remain the source.');
assert(submit.includes("db.collection('inbox').doc(`access-assistance-"), 'Existing inbox must receive notification references.');
assert(submit.includes('accessAssistanceRequestId: ref.id'), 'Inbox notification must reference the canonical request.');
assert(submit.includes("status: 'UNREAD'"), 'New notification must start UNREAD.');
assert(!submit.includes('loginPass') && !submit.includes('password:'), 'Request submission must never handle passwords.');

assert(fn.includes("const REQUEST_COLLECTION = 'accessAssistanceRequests'"), 'Admin workflow must use canonical request collection.');
assert(fn.includes("where('recipientUserIds', 'array-contains', String(actor.id))"), 'Request visibility must be recipient-scoped server-side.');
assert(fn.includes("actor.role === 'Super Admin'"), 'Super Admin authorization missing.');
assert(fn.includes("actor.role === 'Admin' && hasUserManagementPermission(actor)"), 'Authorized legacy Admin permission guard missing.');
assert(fn.includes("['read', 'process', 'resolve']"), 'Allowed workflow actions missing.');
assert(fn.includes("status: 'IN_PROGRESS'"), 'IN_PROGRESS transition missing.');
assert(fn.includes("status: 'RESOLVED'"), 'RESOLVED transition missing.');
assert(fn.includes('handledBy: actorInfo') && fn.includes('handledAt: now'), 'Handling metadata missing.');
assert(fn.includes('resolvedBy: actorInfo') && fn.includes('resolvedAt: now'), 'Resolution metadata missing.');
assert(fn.includes('runTransaction'), 'Status mutation must be transaction-protected.');
assert(fn.includes('REQUEST_ALREADY_IN_PROGRESS'), 'Concurrent claim protection missing.');
assert(fn.includes('targetRequestId'), 'Access Assistance audit metadata missing.');
assert(fn.includes("status: 'READ'") && fn.includes('readAt'), 'Notification read state mutation missing.');
assert(!fn.includes('auth.updateUser'), 'P32 must not add password reset logic.');
assert(!fn.includes('getUser('), 'P32 must not retrieve authentication credentials.');
assert(!/\b(temporaryPassword|newPassword|confirmNewPassword)\b/i.test(fn), 'P32 admin workflow must not reference password credential fields.');
assert(!/\bpassword\s*[:=]/i.test(fn), 'P32 admin workflow must not assign a password field.');

assert(p32.includes("const API='/api/access-assistance-admin'"), 'P32 UI endpoint missing.');
assert(p32.includes('notificationStatus'), 'Notification read state must be distinct from request status.');
assert(p32.includes('Proses') && p32.includes('Selesaikan'), 'Admin workflow actions missing.');
assert(p32.includes('Bantuan Akses Akun'), 'Operational notification wording missing.');
assert(p32.includes('statusPill'), 'Human-readable status mapping missing.');
assert(p32.includes('Permintaan baru') && p32.includes('Sedang diproses') && p32.includes('Selesai'), 'Human-readable status labels missing.');
assert(!p32.includes('accessAssistanceRequests') && !p32.includes('recipientUserIds') && !p32.includes('Netlify Function'), 'Operational UI must not expose implementation terms.');
assert(!p32.includes('Firebase Authentication') && !p32.includes('Firestore'), 'Operational UI must not expose implementation terms.');
assert(!p32.includes('idToken') && !p32.includes('service account'), 'Operational UI must not expose security implementation details.');

assert(schema.includes('## accessAssistanceRequests/{requestId}'), 'P32 data model documentation missing.');
assert(schema.includes("accessAssistanceRequestId"), 'Inbox reference schema missing.');
assert(schema.includes("'UNREAD'"), 'Unread notification state documentation missing.');

assert(login.includes('Lupa password?'), 'P31 user-facing assistance entry must remain.');
assert(firebaseClient.includes('signInWithEmailAndPassword'), 'Firebase Authentication must remain intact.');
assert(auth.includes('function gxApi'), 'Existing secure API helper must remain.');
assert(shell.includes("if(r==='super admin'||r==='superadmin')return 'superadmin';"), 'Existing SuperAdmin POV mapping must remain.');
assert(!shell.includes("if(r==='super admin'||r==='superadmin'||r==='admin')return 'superadmin'"), 'Legacy Admin must not map to SuperAdmin.');

const htmlFiles = fs.readdirSync(root).filter(name => name.endsWith('.html'));
const withShell = htmlFiles.filter(name => name !== 'login.html' && read(name).includes('assets/portal-shell.js'));
assert(withShell.length > 0, 'Portal shell pages missing.');
assert(withShell.filter(name => !read(name).includes('assets/access-assistance-p32.js')).length === 0, 'All portal-shell pages must expose the existing notification integration.');
assert(!login.includes('access-assistance-p32.js'), 'Login must remain free of admin workflow module.');

console.log('P32_ACCESS_ASSISTANCE_ADMIN_PASS');
