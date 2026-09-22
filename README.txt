P40 CLEAN — OLD THEME REMOVAL / CANONICAL SHELL PATCH

Problem confirmed on test-1:
- app.html currently mounts <header class="top"> + .side.
- portal.css styles those as the legacy .top/.side shell.
- portal-shell.js and edition1-portal-shell-entry.js are still present in the Clean registry.
- The prior integration patch actually booted portal-shell.js, so it could make the legacy shell visible instead of removing it.

This patch changes only the active Clean runtime:
1. app.html uses the canonical Edition 1 shell classes: .e1-top + body.e1-modern.
2. Adds clean-shell-runtime.js for header/sidebar/user/period/notification/logout.
3. Skips portal-shell.js, edition1-portal-shell-entry.js and edition1-canonical-shell.js when Clean registry scripts are loaded.
4. Keeps portal.css for page/component styling; it is no longer allowed to own the active header/sidebar because the old .top shell is no longer mounted.
5. Makes edition1-page-boot understand ?page=... query routes.
6. No Firebase rules, collections, auth model, page data, CRUD, OCR, Calendar, Initiative, Map or business logic are changed.

IMPORTANT:
- This is a targeted delta patch, not a full project replacement.
- It has NOT been deployed or pushed.
- npm test has NOT been claimed as passed.
- Apply it to the test-1 checkout, then hard-refresh the browser.
