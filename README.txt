P40 ROUTE HARDENING — TEST-1

This package contains the exact route-hardening delta.

1. assets/auth.js.patch
   Apply to the existing assets/auth.js. Do NOT replace auth.js with a shortened file.
   It fixes:
   - legacy index.html post-login destination
   - stale next/return URLs
   - legacy *.html -> app.html?page=... conversion
   - permission checks on app.html?page=...

2. netlify.toml
   Complete replacement of the audited test-1 file, with one defensive rule:
   /index.html -> /app.html?page=index

3. tests/clean-draft-regression.js.patch
   Adds regression checks for the routing failure.

No index.html should be created.
No Firebase rules are changed.
No GitHub push or Netlify deploy is performed by this package.
