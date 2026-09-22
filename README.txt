P40 CLEAN RUNTIME FIX v2

Confirmed from test-1:
- app.html still uses the old shell mount and does not load the canonical Edition 1 shell.
- index in clean-page-registry.js has html: "" while dashboard-firestore.js requires #dashboardRoot.
- Clean registry still contains legacy portal-shell.js entries.
- The previous patch was not present in the current test-1 source.

This patch:
1. Activates the existing canonical Edition 1 shell on app.html.
2. Adds #dashboardRoot to the index route.
3. Prevents legacy shell scripts from being booted by Clean page definitions.
4. Makes the canonical shell understand ?page=... for active navigation.

No Firebase rules or business/data logic are changed.
No GitHub push or Netlify deploy was performed.
