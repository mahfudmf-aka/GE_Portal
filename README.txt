P40 CLEAN BOOTSTRAP RECONSTRUCTION v3
========================================

Basis:
- Audited exact test-1 source on 2026-09-23.
- No GitHub files were changed.
- This is a surgical patch, not a replacement/rebuild.

Confirmed root causes:
1. app.html loads clean-page-registry.js but does NOT load edition1-canonical-shell.js.
2. The index registry entry has html:"", while dashboard-firestore.js requires #dashboardRoot.
3. clean-page-registry.js still injects legacy portal-shell.js into 43 routes.
4. Edition 1 routes also inject edition1-portal-shell-entry.js and edition1-portal-route-adapter.js.
5. edition1-page-boot.js is pathname-only, so /app.html?page=inisiatif does not match e1-inisiatif.html.
6. clean-route-adapter.js drops URL hashes during conversion.
7. The registry contains programmatic legacy navigation such as station-360.html and index.html#service-experience, which click interception cannot repair.

What this patch does:
- Bootstraps ONE canonical shell from app.html.
- Gives index a real dashboard mount point.
- Removes legacy shell entry scripts from the Clean Draft registry.
- Makes Edition 1 page boot query-route aware.
- Preserves hashes when normalizing routes.
- Repairs known programmatic Clean Draft route escapes.
- Does NOT alter Firebase rules, business data schema, authentication contract, or page HTML content.
- Does NOT delete historical source files from the repository; it only stops the old shell runtime from being loaded by Clean Draft.

Important:
- The apply script is fail-closed. It refuses to modify a file if its expected source anchor is missing.
- Run from the repository root on branch test-1.
- Do not apply this to main.
- After applying, run npm run test before deployment.
