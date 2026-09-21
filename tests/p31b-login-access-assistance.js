'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const login = fs.readFileSync(path.join(root, 'login.html'), 'utf8');
const fn = fs.readFileSync(path.join(root, 'netlify/functions/access-assistance-request.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/portal.css'), 'utf8');

function assert(condition, message) { if (!condition) throw new Error(message); }

assert(login.includes('assets/garuda-indonesia.png'), 'Garuda Indonesia image logo missing from login.');
assert(login.includes('assets/danantara.png'), 'Danantara logo missing from login.');
assert(!login.includes('>GARUDA INDONESIA<'), 'Corporate logo must not be rendered as plain text.');
assert(login.includes('Lupa password?'), 'Forgot-password assistance link missing.');
assert(login.includes('/api/access-assistance-request'), 'Access assistance endpoint not wired.');
assert(login.includes('identifier,reason'), 'Access assistance request payload missing identifier/reason.');
const assistanceBlock = login.slice(login.indexOf('assistanceSubmit.addEventListener'), login.indexOf('</script>', login.indexOf('assistanceSubmit.addEventListener')));
assert(!assistanceBlock.includes('loginPass.value') && !assistanceBlock.includes('password:'), 'Password must never be sent in assistance request.');
assert(fn.includes("db.collection('accessAssistanceRequests').add(request)") || fn.includes("db.collection('accessAssistanceRequests').doc()"), 'Assistance request must be persisted server-side.');
assert(fn.includes("profile?.role === 'Super Admin'"), 'SuperAdmin recipient routing missing.');
assert(fn.includes("profile?.role !== 'Admin'"), 'Admin recipient routing guard missing.');
assert(fn.includes("['user-management', 'user_management', 'users', 'admin']"), 'Authorized Admin permission check missing.');
assert(!fn.includes('password'), 'Assistance function must not reference password fields.');
assert(css.includes('.login-forgot'), 'Forgot-password login styling missing.');
console.log('P31B_LOGIN_ACCESS_ASSISTANCE_PASS');
