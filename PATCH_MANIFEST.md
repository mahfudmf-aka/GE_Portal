# PATCH — Netlify root 404

Baseline: P40_CLEAN_FINAL_2HTML_FIREBASE_ALIGNED

Changed file:
- `_redirects` — added root rewrite `/` -> `/login.html` with HTTP 200.

Reason:
- Netlify production root was still returning its 404 page.
- The prior package's `netlify.toml` did not actually contain the root redirect.
- This patch does not add any HTML page and does not change the 2-HTML architecture.

Deploy:
- Copy `_redirects` to the same publish root as `app.html` and `login.html`.
- Do not nest it under another folder.

Expected:
- `/` serves `login.html` without redirecting the browser URL.
