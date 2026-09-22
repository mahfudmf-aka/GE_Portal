P40 CLEAN RUNTIME INTEGRATION — DELTA PATCH
Target branch: test-1
No GitHub/Netlify write was performed.

Purpose:
1. Make app.html?page=... the canonical runtime page identity.
2. Boot the existing portal shell from the 2-HTML mother.
3. Provide #dashboardRoot for the existing Firestore dashboard renderer.
4. Let Edition 1 page boot resolve Clean query routes.
5. Make Clean routing preserve aliases, query parameters and hash.
6. Keep E1/legacy business implementations; do not redesign pages.
7. Fix the known programmatic Station 360 navigation escape hatch.

Apply with the supplied apply-p40-clean-runtime.py against an existing checkout of test-1.
The patcher performs targeted replacements and refuses to continue if an expected source
anchor is missing or already changed. It does not blindly overwrite the target files.

IMPORTANT:
- Do not deploy yet.
- Run npm test after applying.
- Then run the functional gates: mother shell, Initiative, Calendar, OCR, Airport Map,
  Station 360, Lounge/Tenant pricing, modal/overlay and Firebase persistence.
