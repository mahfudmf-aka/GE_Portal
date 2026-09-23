P40 CLEAN FLOW AUDIT V5 — REFERENCE DASHBOARD + COLLAPSE
========================================================

GitHub is NOT modified by this package. Upload/apply manually.

This V5 addresses the exact visual/function feedback from the two screenshots:
- the first screenshot is the currently mounted Clean shell with a blank index area;
- the second screenshot is the intended Management Dashboard reference.

V5 changes the Clean runtime so /app.html?page=index is owned by app.html itself and renders the existing Management Dashboard implementation from the reference page, instead of the unrelated Super Admin dashboard runtime.

REFERENCE UI CHANGES
--------------------
1. Header/sidebar use the existing final-v257/R9 visual system already present in portal.css.
2. Sidebar labels/order are aligned to the supplied reference while preserving routes.
3. Bottom sidebar label is exactly: Collapse.
4. Collapse is functional:
   - click Collapse -> sidebar becomes icon rail;
   - click again -> sidebar expands;
   - state persists in localStorage key GE_CLEAN_SIDEBAR_COLLAPSED.
5. User control is one SA avatar button with the chevron INSIDE the same control.
6. User popup still opens Profile / Sign Out.
7. Notification/help remain in the header.
8. The generic app footer is removed so the dashboard's own reference footer/layout controls the page.
9. e1-canonical.css is no longer loaded by app.html because its shell geometry conflicts with the supplied final reference shell.

INDEX / BLANK-PAGE FIX
----------------------
app.html now special-cases page=index:
- creates #dashboardRoot itself;
- loads Firebase/GEStore and the existing dashboard business engines;
- loads assets/clean-dashboard-management.js;
- does NOT load assets/dashboard-firestore.js for index;
- therefore the old blank registry index and the unrelated Super Admin dashboard cannot overwrite the reference dashboard.

ACTUAL FILES TO UPLOAD/REPLACE
------------------------------
1. app.html
2. assets/clean-shell-runtime.js
3. assets/clean-shell.css
4. assets/clean-dashboard-management.js
5. assets/clean-route-adapter.js
6. assets/edition1-page-boot.js
7. tests/clean-flow-regression.js  (after updating tests as described below)

EXISTING FILE TO TRANSFORM
--------------------------
8. assets/clean-page-registry.js
Use patches/assets/apply-p40-clean-registry-v5.py to remove legacy shell runtime references from every registry route.
This remains a targeted transformation; it does not rewrite page business HTML.

TEST PATCHES
------------
Apply:
- patches/tests/run-build.mjs.patch
- patches/tests/clean-draft-regression.js.patch
Then run:
  npm run test

IMPORTANT
---------
Do NOT delete portal.css. It contains the final dashboard/page visual system and functional page CSS mixed with historical declarations.
Do NOT load portal-shell.js / edition1-portal-shell-entry.js / edition1-portal-route-adapter.js as Clean shell owners.
Do NOT upload the files under patches/ as application assets.

MANUAL DEPLOY ORDER
-------------------
1. Upload the 6 application files above.
2. Apply the registry transformer once and save the resulting assets/clean-page-registry.js.
3. Apply the two test patches.
4. Run npm run test.
5. Push to test-1 manually.
6. Open /app.html?page=index on the Netlify branch deploy.
7. Verify: dashboard visible -> Collapse works -> expand works -> SA chevron opens menu -> Profile/Sign Out work.

This package does not write to GitHub and does not claim Netlify verification.

GITHUB / NETLIFY
----------------
No GitHub write was performed. No Netlify deployment was performed. You remain in control of the upload/push.
