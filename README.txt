P40 CLEAN — ROUTE CONTRACT FIX

This is the first actual architecture fix after rollback.

Root cause:
- Clean URL is /app.html?page=ROUTE.
- Legacy/canonical shell code reads location.pathname and expects ROUTE.html.
- Page registry still loads portal-shell.js, which therefore exits on app.html.
- Dashboard index has html:"" even though dashboard-firestore.js requires #dashboardRoot.
- Therefore the preview can show only the legacy empty .top/.side and no page content.

This patch establishes ONE runtime contract for app.html:
1. app.html remains the only page container.
2. The existing Edition 1 canonical shell is loaded once.
3. Page registry legacy portal-shell.js is skipped.
4. Shell build is explicitly called AFTER page dependencies load, so auth/session is available.
5. ?page=index gets the dashboard mount.
6. Existing dashboard-firestore.js remains the dashboard renderer.
7. No Firebase rules/data/business logic is changed.

Files changed:
- app.html
- assets/clean-page-registry.js
- assets/edition1-canonical-shell.js

No GitHub push or Netlify deploy was performed.
