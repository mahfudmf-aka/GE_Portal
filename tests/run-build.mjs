import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const tests = [
  'tests/clean-draft-regression.js',
  'tests/firebase-rules-contract.js',
  'tests/p29-lounge-planning.js',
  'tests/p31-auth-role-runtime.js',
  'tests/p31b-login-access-assistance.js',
  'tests/p32-access-assistance-runtime.js',
  'tests/r15-functional-contract.js',
  'tests/upload-template-contract.js',
  'tests/r18-consolidation-contract.js',
  'tests/r19-ui-consolidation-contract.js',
  'tests/r20-consolidated-browser-contract.js',
  'tests/r21-auth-persistence-contract.js',
  'tests/r22-runtime-contract.js',
  'tests/r23-cumulative-fix-contract.js'
];

const netlify = process.argv.includes('--netlify');
function run(file) {
  if (!existsSync(file)) throw new Error(`Missing test: ${file}`);
  const r = spawnSync(process.execPath, [file], { stdio: 'inherit', cwd: process.cwd(), env: process.env });
  if (r.status !== 0) throw new Error(`Build test failed: ${file}`);
}

try {
  for (const file of tests) run(file);
  console.log(netlify ? 'NETLIFY_BUILD_CHAIN_PASS' : 'LOCAL_BUILD_CHAIN_PASS');
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}

await import('./r25-root-cause-contract.js');
await import('./r26-data-lifecycle-contract.js');
await import('./r27-airport-marker-contract.js');
await import('./r28-firestore-cache-contract.js');
await import('./r29-instant-cache-contract.js');
await import('./r30-role-scope-firestore-contract.js');

await import('./r31-admin-firestore-contract.js');
await import('./r31-1-partner-scope-contract.js');

await import('./r32-pov-permission-map-contract.js');

await import('./r38-master-save-contract.js');

await import('./r38-1-master-table-actions-contract.js');

await import('./r38-2-master-edit-modal-contract.js');

await import('./r39-p1-p8-dashboard-cost-contract.js');
