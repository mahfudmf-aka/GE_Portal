P40 CLEAN RUNTIME — ROUTE CONTRACT AUDIT PATCH

AUDIT CONFIRMED FROM GitHub test-1:
- test-1 is 13 commits ahead of main, 0 behind.
- app.html is identical to main.
- assets/edition1-canonical-shell.js is identical to main.
- assets/clean-page-registry.js is identical to main.
- Therefore previous ZIP patches were never applied to the branch source.
- app.html does not load the existing canonical shell.
- index registry has html:"", while dashboard-firestore.js requires #dashboardRoot.
- index still loads legacy portal-shell.js.
- canonical shell resolves route from pathname only, so /app.html?page=index is not mapped.

PATCH SCOPE:
1) app.html: load the EXISTING canonical E1 shell.
2) edition1-canonical-shell.js: make route detection query-aware.
3) clean-page-registry.js: create #dashboardRoot for index and remove legacy portal-shell.js ONLY from index.

No new page HTML is created.
No redesign.
No GitHub write.
No Netlify deployment.

FIRST GATE AFTER LOCAL APPLY:
 /app.html?page=index

Expected:
- canonical E1 header
- canonical E1 sidebar
- dashboardRoot present
- dashboard runtime can render
- legacy portal-shell.js absent from index runtime

The patch is deliberately limited to the first runtime gate. Do not broaden it to every page until this gate is verified.
