P40 CLEAN FLOW AUDIT + MANUAL PATCH V4
========================================

Repository: mahfudmf-aka/GE_Portal
Branch audited: test-1

IMPORTANT:
- This package does NOT write to GitHub.
- User applies/uploads changes manually.
- Do not upload the files under `patches/` as if they were application assets.
- `app.html` and the files under `assets/` are the actual replacement files.
- Registry changes are intentionally provided as a deterministic script + manual edit instructions because clean-page-registry.js is a 327 KB one-line generated registry.

ACTUAL FILES TO UPLOAD
----------------------
1. app.html
2. assets/clean-shell-runtime.js
3. assets/clean-route-adapter.js
4. assets/edition1-page-boot.js
5. tests/clean-flow-regression.js

MANUAL/TRANSFORMED EXISTING FILE
--------------------------------
6. assets/clean-page-registry.js
   Use either:
   - patches/REGISTRY-MANUAL-EDIT.txt
   - patches/assets/apply-p40-clean-registry-v4.py

TEST SEQUENCE
-------------
7. Apply patches/tests/run-build.mjs.patch
8. Apply patches/tests/clean-draft-regression.js.patch
9. Run: npm run test

DO NOT CHANGE IN THIS V4
------------------------
- assets/portal.css
- Firebase rules
- Firebase auth architecture
- business CRUD logic
- historical source deletion

Reason:
portal.css is mixed old-theme + functional + final-v257 CSS. A blind purge would break active page engines.

EXPECTED FIRST RESULT
---------------------
`/app.html?page=index` should no longer show the old blank `.top/.side` shell.
The canonical Clean shell should mount into `.e1-top`, and the dashboard registry should provide `#dashboardRoot`.

Only after `npm run test` passes should the changed files be pushed to the test branch and checked in Netlify.
