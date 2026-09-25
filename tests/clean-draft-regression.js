
'use strict';
const fs=require('fs'); const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const assert=(c,m)=>{if(!c)throw new Error(m)};
const html=fs.readdirSync(root).filter(x=>x.endsWith('.html')).sort();
assert(JSON.stringify(html)==JSON.stringify(['app.html','login.html']),`Clean architecture must remain 2 HTML files; found: ${html.join(', ')}`);
const app=read('app.html'), login=read('login.html'), registry=read('assets/clean-page-registry.js'), adapter=read('assets/clean-route-adapter.js');
for(const f of ['assets/clean-page-registry.js','assets/clean-route-adapter.js']) assert(app.includes(f.split('?')[0]),`app.html missing ${f}`);
assert(registry.includes('window.P40_CLEAN_PAGES='),'Canonical page registry missing.');
assert(registry.includes('window.P40_CLEAN_ALIASES='),'Canonical route aliases missing.');
assert(adapter.includes("params.set('page',route)"),'Clean route adapter does not resolve routes into app.html.');
for(const asset of ['assets/firebase-config.js','assets/firebase-client.js','assets/auth.js']) assert(login.includes(asset),`login.html missing ${asset}`);
for(const asset of ['assets/firebase-config.js','assets/firebase-client.js']) assert(app.includes(asset),`Canonical app missing global runtime ${asset}`); for(const asset of ['assets/firebase-config.js','assets/firebase-client.js']) assert(!registry.includes(asset),`Canonical registry must not duplicate global runtime ${asset}`); assert(registry.includes('assets/edition1-store.js'),'Canonical runtime registry missing assets/edition1-store.js');
assert(!registry.includes('assets/edition1-portal-shell-entry.js'),'Registry must not load obsolete/duplicate Edition 1 shell entry.');
assert(!registry.includes('assets/edition1-portal-route-adapter.js'),'Registry must not load obsolete Edition 1 route adapter.');
assert(app.indexOf('await window.GX_AUTH_READY') < app.indexOf('outlet.innerHTML=def.html'),'Canonical page content must wait for authoritative auth/role before render.');
assert(app.includes('assets/portal-shell.js'),'Canonical app must load the single portal shell.'); assert(app.indexOf('assets/portal-shell.js')<app.indexOf('assets/auth.js'),'Portal shell must load before auth so role POV is available.'); const authRefs=(registry.match(/assets\/auth\.js/g)||[]).length; assert(authRefs===0,`Canonical registry must not duplicate auth runtime; found ${authRefs}`); assert(/GX_AUTH_READY/.test(read('assets/auth.js')),'Auth runtime must expose a single readiness promise.'); assert(/await window\.GX_AUTH_READY/.test(read('assets/portal-shell.js')),'Portal shell must wait for auth/role resolution before rendering.');
for(const critical of ['assets/tesseract.min.js','assets/tesseract-core-simd-lstm.wasm','assets/garuda_operational_map.svg','assets/xlsx.full.min.js']) assert(fs.existsSync(path.join(root,critical)),`Critical asset missing: ${critical}`);
assert(fs.existsSync(path.join(root,'netlify.toml')),'netlify.toml missing.');
const netlify=read('netlify.toml');
assert(netlify.includes('npm run test'),'Netlify must execute npm run test.');
assert(!netlify.includes('tools/verify-package.mjs'),'Netlify must not reference missing tools/verify-package.mjs.');
assert(!netlify.includes('tests/run-build.mjs --netlify'),'Netlify must not bypass npm run test.');
const pkg=JSON.parse(read('package.json')); assert(pkg.scripts?.test,'package.json must expose npm run test.');
const store=read('assets/edition1-store.js'); assert(store.includes('if(window.GX_AUTH_READY) await window.GX_AUTH_READY'),'Business store must reuse the authoritative auth readiness gate.'); assert(!store.includes('sessionDeadline'),'Business store must not poll stale session state during page boot.'); assert(store.includes('fetchWithTimeout'),'Business data requests must have a finite timeout.'); assert(store.includes('/api/edition1-data?collections='),'Business store must use the Firebase API adapter.'); assert(!/localStorage\.(getItem|setItem|removeItem)/.test(store),'Business store must not persist business data in localStorage.');
const client=read('assets/firebase-client.js');
assert(!/s\.db\.collection\(['"](initiatives|inbox)['"]\)/.test(client),'Client business access must not bypass the locked Firebase rules.');
const data=read('netlify/functions/edition1-data.js');
assert(data.includes("db.collection('portalData')"),'Business adapter must use portalData.');
assert(data.includes("db.collection('portalMetadata')"),'Metadata adapter must use portalMetadata.');
assert(data.includes(".collection('records')"),'Business adapter must use the existing records level.');
const overlay=read('assets/edition1-overlay-manager.js');
assert(!overlay.includes("'.p26-account-modal'"),'Overlay manager must promote the backdrop, never detach the P26 modal card from its backdrop.');
const business=read('assets/edition1-business-runtime.js');
for(const fn of ['showStandardPanel','renderTouchpointStandards','renderInitiatives','openInitiativeModalV224','showAdminSection','renderAdminInbox','renderArticles','showContentPanel']) assert(business.includes(`window.${fn}=${fn}`),`Canonical Edition 1 runtime must expose inline/page-boot handler ${fn}.`);
const shellCss=read('assets/clean-shell.css');
assert(shellCss.includes('z-index:100000!important'),'Canonical dialog strata must stay above the sticky portal header.');
assert(shellCss.includes('overflow-y:auto!important'),'Canonical sidebar must remain independently scrollable.');
assert(registry.includes('id=\\\"interactiveMap\\\"')||registry.includes('id=\"interactiveMap\"'),'Airport Experience canonical page must contain the interactive map.');
assert(registry.includes('Touch Point, Service & Capability'),'Capability & Standards canonical page must retain its page content.');

assert(registry.includes('dashboardRoot'),'Dashboard canonical page must retain dashboardRoot for dashboard-firestore runtime.');
const shell=read('assets/portal-shell.js'); assert(shell.includes("'airport-experience.html'"),'Canonical shell must recognize the consolidated Airport Experience route.'); assert(shell.includes("Calendar & Project Tracking"),'Calendar & Project Tracking must remain visible in the canonical navigation.');
const relationships=read('assets/relationships-v257.js'); assert(relationships.includes('window.GERelationship={'),'Relationship engine must be a functional canonical implementation, not an empty compatibility shim.'); assert(relationships.includes('service_capability'),'Relationship engine must retain service-capability relationship type.');
assert(business.includes("typeof x==='string'?x"),'Initiative touchpoint filter must normalize object/string Firestore data before localeCompare.');
for(const fn of ['geRenderPlanningPage','geV251InitCalendar','geCalRenderV2533','geCalSetViewV2533','changeLoungeCardPageV237']) assert(business.includes(`window.${fn}=${fn}`),`Canonical runtime must expose ${fn}.`);
assert(shellCss.includes('.p26-account-modal>#p26FormHost{display:flex!important;flex-direction:column!important'),'Add User modal must stack form and standard action row vertically.');
assert(shellCss.includes('.ge-p29-view-toggle'),'Lounge/Tenant must expose Grid/Details view styling.');
assert(fs.existsSync(path.join(root,'ROOT_MAP.md')),'Root menu/page/access map must ship with the revision.');


assert(business.includes('const all=geOldAllEventsV252?geOldAllEventsV252():[]'),'Calendar filter must use captured base events and must not recurse through geV251AllEvents.');
assert(business.includes("window.openInitiativeTimelineV224=openInitiativeTimelineV224"),'Initiative Detail / Timeline must be globally callable in canonical SPA runtime.');
assert(business.includes("window.installInitiativeControls=installInitiativeControls"),'Initiative canonical controls must be explicitly bootable after dynamic page injection.');
assert(business.includes("window.geInitAirportV214=geInitAirportV214"),'Airport canonical initializer must be globally callable after dynamic page injection.');
assert(read('assets/edition1-page-boot.js').includes("window.installInitiativeControls?.()"),'Initiative page boot must initialize controls after hydration.');
assert(read('assets/edition1-page-boot.js').includes("await window.GEStore.hydrate(['users'])"),'Admin Initiative page must hydrate User & Access directory for PIC assignment.');
assert(business.includes('function r5data(){return window.GEStore?.get?.()||{}}'),'Initiative multi-station/PIC enhancement must use the canonical GEStore outside the legacy IIFE scope.');
assert(read('assets/edition1-page-boot.js').includes("window.geInitAirportNetworkR8?.()"),'Airport network must initialize after Firestore hydration.');
assert(read('assets/portal.css').includes('.lounge-table-fallback-v237.ge-p29-table-visible{display:block!important}'),'Lounge Details view must have an actual visible CSS state.');
{const a=registry.indexOf('\"airport-experience\"');const z=registry.indexOf('window.P40_CLEAN_ALIASES');const airportSlice=registry.slice(a,z);assert(!airportSlice.includes('assets/app.js?v=2.54.1'),'Airport canonical route must not reload legacy app.js.');}
console.log(`CLEAN_DRAFT_REGRESSION_PASS HTML=${html.length}`);
// R4 regression guards: canonical runtime fixes.
{
  const boot=fs.readFileSync('assets/edition1-page-boot.js','utf8');
  assert(boot.includes("'airport-experience':{perm:'services'"),'Airport Experience must hydrate canonical Firestore data');
  assert(boot.includes("window.geInitAirportR8?.()"),'Airport Experience boot must initialize hydrated map through canonical initializer');
  const shell=fs.readFileSync('assets/portal-shell.js','utf8');
  assert(shell.includes("u.searchParams.get('page')"),'Sidebar active state must resolve canonical page query');
  const rt=fs.readFileSync('assets/edition1-business-runtime.js','utf8');
  assert(rt.includes("||activeJourney||''"),'Initiative Journey filter must use canonical activeJourney state');
  assert(rt.includes('GE_Inisiatif_dan_Milestone.csv'),'Initiative export must include milestones');
  assert(rt.includes('capacitySchedules'),'Lounge/Tenant must support capacity periods');
  assert(rt.includes('supersedesId'),'Lounge/Tenant must preserve agreement replacement history');
  assert(rt.includes('geRenderCalendarCanonicalR4'),'Calendar must use non-recursive canonical entry');
}
// R6 regression guards: deployed cache identity + directly visible canonical controls.
{
  const app=fs.readFileSync('app.html','utf8');
  const registry=fs.readFileSync('assets/clean-page-registry.js','utf8');
  const rt=fs.readFileSync('assets/edition1-business-runtime.js','utf8');
  const css=fs.readFileSync('assets/portal.css','utf8');
  assert(app.includes('v=r8'),'Canonical root assets must use the current deployment cache identity.');
  assert(registry.includes('edition1-business-runtime.js?v=r8'),'Page runtime must not reuse stale v=1 browser cache.');
  assert(registry.includes('geInitiativeViewSelectR6'),'Initiative Grid/List selector must exist in canonical page markup.');
  assert(registry.includes('geLoungeViewSelectR6'),'Lounge/Tenant Grid/Details selector must exist in canonical page markup.');
  assert(registry.includes('loungeFilterTextR6'),'Lounge/Tenant must expose a free-text filter in addition to dropdown filters.');
  assert(registry.includes('ge-clickable'),'Planning snapshot source panels must be actionable.');
  assert(registry.includes('id=\\"rows\\"')||registry.includes('id="rows"'),'Airport Experience network section must contain the table body required by its runtime.');
  assert(rt.includes('window.geV251RenderCalendar=window.geCalRenderV2533'),'Calendar canonical render entry must use the exported canonical renderer, not an inaccessible lexical wrapper.');
  assert(rt.includes('window.changeLoungeCardPageV237=function(delta)'),'Lounge pagination must use canonical card renderer on every page.');
  assert(css.includes('.login-brand h1{color:#0d2639!important}'),'Login portal title must retain approved dark title color.');
  assert(css.includes('.login-submit{color:#fff!important}'),'Login Masuk button text must be white.');
}

// R8 completion guards
assert(business.includes('geSetCalendarWorkspaceR8'),'Calendar must expose Calendar / Project / Gantt workspace switching.');
assert(business.includes('PIC (User & Access)'),'Initiative/Milestone PIC must use User & Access directory.');
assert(business.includes('Station / Area (multi)'),'Initiative station assignment must support multiple stations.');
assert(business.includes('geInitFilterCombosR8'),'Canonical searchable/dropdown filter initialization must exist.');
assert(business.includes('geInitAirportR8'),'Airport map must initialize from hydrated canonical airport rows.');
