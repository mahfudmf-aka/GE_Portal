# P40 CLEAN DRAFT — RECONSTRUCTED BOOTSTRAP INSTRUCTIONS

## Objective

Make `/app.html?page=<route>` a real runtime entry point.

The browser must have exactly this lifecycle:

AUTHENTICATED SESSION
→ app.html
→ canonical shell bootstrap
→ Clean route resolution
→ route HTML mount
→ route dependencies
→ page boot/hydration
→ Firebase/Firestore data
→ render

The old shell must NOT be instantiated inside Clean Draft.

## Non-negotiable architecture

- `app.html` is the single Clean Draft runtime entry.
- `assets/edition1-canonical-shell.js` owns the visible header/sidebar shell.
- `assets/clean-page-registry.js` owns route content/dependencies.
- `assets/clean-route-adapter.js` owns link normalization.
- `assets/edition1-page-boot.js` owns Edition 1 page hydration.
- Existing business engines remain the source of page functionality.
- Firebase rules and data paths remain unchanged.
- Do not rebuild the UI.
- Do not create HTML per page.
- Do not delete historical files merely because they are legacy.

## Old theme rule

The old theme is considered active when Clean Draft loads:
- `portal-shell.js`
- `edition1-portal-shell-entry.js`
- `edition1-portal-route-adapter.js`

Clean Draft must not load those shell runtimes.

Do not solve this with another CSS override. Stop the old runtime at the source.

`portal.css` may remain as the shared Edition 1 functional stylesheet because current canonical `final-v257` shell rules live there. Removing the entire stylesheet would remove required functional styling and is NOT the correct fix.

## Route contract

Canonical URL:
`/app.html?page=<clean-route>`

Examples:
- index → `/app.html?page=index`
- initiative → `/app.html?page=inisiatif`
- calendar → `/app.html?page=calendar`
- airport experience → `/app.html?page=airport-experience`
- admin → `/app.html?page=admin`

Legacy `.html` links may remain in source for compatibility, but Clean Route Adapter must convert them at navigation time.

Hashes must survive conversion:
`index.html#service-experience`
→ `app.html?page=index#service-experience`

Programmatic `location.href` / `location.replace` cannot be intercepted by click listeners. Known registry programmatic routes must therefore be corrected directly.

## Page boot contract

`edition1-page-boot.js` must resolve both:
- legacy pathname: `e1-inisiatif.html`
- Clean query route: `app.html?page=inisiatif`

It must map the Clean route to the existing E1 config, not create a second config system.

## Dashboard contract

The index registry MUST contain:
`<div id="dashboardRoot"></div>`

because `dashboard-firestore.js` renders exclusively into `#dashboardRoot`.

No empty index HTML is allowed.

## Change discipline

Only targeted replacements:
1. app.html bootstrap reference.
2. index registry mount.
3. remove old shell runtime entries from Clean registry.
4. query-aware E1 page boot.
5. hash-preserving route adapter.
6. known programmatic route normalization.

Do not replace entire files.

## Verification gates

Before calling the page ready:

1. Open `/app.html?page=index`.
2. Confirm canonical header and sidebar are populated.
3. Confirm no old shell script is requested by Clean Draft.
4. Confirm dashboardRoot exists.
5. Confirm dashboard content appears after data/auth bootstrap.
6. Open `/app.html?page=inisiatif`.
7. Confirm Initiative HTML renders and E1 boot runs.
8. Open `/app.html?page=calendar`.
9. Confirm Calendar HTML renders and E1 boot runs.
10. Test one programmatic Station 360 navigation.
11. Test hash navigation.
12. Run `npm run test`.
13. Only then deploy the branch.

If any gate fails, stop and inspect the runtime error; do not add another CSS patch blindly.
