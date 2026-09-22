P40 ROLLBACK — CLEAN RUNTIME

Rollback only. Restore the recent Clean Runtime experiment.
Do not apply the previous Clean Runtime v1/v2 patches afterward.

Root cause found:
portal-shell.js uses location.pathname. For /app.html?page=index, pathname is
app.html, but its finalUserPages contains index.html, not app.html. Therefore
shell() returns before filling header/sidebar. portal.css still styles the empty
.top/.side, producing the blank dark header seen in the screenshot.
The Clean registry index entry also has html: "", so the content outlet is empty.

Rollback scope:
- app.html
- assets/clean-page-registry.js
- assets/edition1-canonical-shell.js

No Firebase, data, OCR, Calendar, Initiative, Map or business logic is changed.
