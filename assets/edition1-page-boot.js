/* P40 Edition 1 canonical page boot.
 * Shell ownership: assets/portal-shell.js (same shell as the production dashboard).
 * Business-data ownership: Firebase/Firestore through /api/edition1-data.
 */
(function(){
'use strict';
const file=(location.pathname.split('/').pop()||'app.html').toLowerCase();
const page=file==='app.html'?String(new URLSearchParams(location.search).get('page')||'index').trim().toLowerCase():file.replace(/\.html$/,'').replace(/^e1-/,'');
const config={
 'standar':{perm:'services',collections:['airports','personnel','touchpointStandards','skyPriority','announcements','standardContent']},
 'inisiatif':{perm:'initiatives',collections:['initiatives','touchpoints','documents']},
 'service-planning':{perm:'planning',collections:['stationMaterials','lounges','boSpaces','airportSystems','touchpointStandards','documents','serviceProcurement']},
 'calendar':{perm:'initiatives',collections:['initiatives','projectEvents','touchpoints']},
 'planning-documents':{perm:'planning',collections:['documents','initiatives']},
 'data':{perm:'data',collections:['airports','personnel']},
 'admin':{perm:'admin',collections:['users','inbox','auditLogs','portalManagerR2','airports','lounges']},
 'berita':{perm:'news',collections:['articles','announcements','faqs','news','documents']},
 'kontak':{perm:'contact',collections:['inbox']},
 'lounge-list':{perm:'planning',collections:['lounges','loungeVisitors','serviceProcurement','documents']},
 'branch-office-planning':{perm:'planning',collections:['lounges','boSpaces','serviceProcurement','airportSystems','stationMaterials','documents']},
 'gaso-planning':{perm:'planning',collections:['gasoMaster','gasoServiceSupport','gasoPlanningService','airports','documents']}
};
const cfg=config[page]; if(!cfg)return;
function session(){return typeof window.gxGetSession==='function'?(gxGetSession()||{}):window.GX_CURRENT_USER||{}}
function showStatus(message,error=false){let b=document.getElementById('e1DataStatus');if(!b){b=document.createElement('div');b.id='e1DataStatus';b.className='e1-data-status';document.querySelector('main.main')?.prepend(b)}b.textContent=message;b.dataset.error=error?'1':'0';b.style.display=message?'block':'none'}
async function ensureFirebase(){
 if(!window.GX_FIREBASE_CONFIG){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='assets/firebase-config.js?v=e1-runtime';s.onload=resolve;s.onerror=()=>reject(new Error('Firebase config gagal dimuat.'));document.head.appendChild(s)})}
 if(!window.GXFirebase){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='assets/firebase-client.js?v=e1-runtime';s.onload=resolve;s.onerror=()=>reject(new Error('Firebase client gagal dimuat.'));document.head.appendChild(s)})}
 if(!window.GXFirebase)throw new Error('Firebase runtime unavailable.');
 const state=await window.GXFirebase.init();
 if(!state?.ready)throw state?.error||new Error('Firebase runtime unavailable.');
 return state;
}
async function waitFirebase(){const state=await ensureFirebase();const u=await window.GXFirebase.currentUser();if(!u)throw new Error('Authentication required.');return{state,u}}
function hasAccess(){if(cfg.perm==='admin')return window.gxHasUserManagementPermission?.()||session().role==='Super Admin';return window.gxHasPermission?.(cfg.perm)!==false}
function rerender(){
 if(page==='standar'){const panel=new URLSearchParams(location.search).get('panel');const panelButton=panel?document.querySelector(`[data-standard-panel="${panel}"]`):null;if(panel&&window.showStandardPanel)window.showStandardPanel(panel,panelButton);window.renderTouchpointStandards?.();window.renderPersonnelReadiness?.();window.renderSkyPriority?.();window.geEnsureStandardModalV248?.();window.geApplyStandardContentV248?.();window.renderAnnouncementLibraryV246?.()}
 else if(page==='inisiatif'){window.renderInitiatives?.();window.geApplyInitiativePresentationV224?.()}
 else if(page==='service-planning'){window.geRenderPlanningPage?.();window.renderStationMaterials?.()}
 else if(page==='calendar'){window.geV251Ensure?.();window.geV251RenderTouchpointPage?.();window.geV251InitCalendar?.();window.geUpgradeCalendarModalV252?.();window.geAddCalendarFiltersV252?.();window.geUpgradeReminderV253?.();window.geCalBuildFiltersV2533?.();window.geCalRenderV2533?.();window.geCalRenderKPIV2534?.()}
 else if(page==='planning-documents'){window.renderPlanningDocuments?.()}
 else if(page==='data'){window.renderAirports?.();window.renderPersonnel?.();window.renderDocumentsAdmin?.()}
 else if(page==='admin'){window.renderAdminOverview?.();window.renderAdminInbox?.();window.renderAuditLogs?.();window.p26RenderUsers?.();window.pmLoadPageR2?.()}
 else if(page==='berita'){window.renderArticles?.();window.renderAnnouncements?.();window.renderFaqs?.();window.renderAnnouncementLibraryV246?.()}
 else if(page==='lounge-list'){window.renderLounges?.();window.renderLoungeVisitors?.();window.renderLoungePriceSummaryV243?.();window.renderLoungeCardsV237?.()}
 else if(page==='branch-office-planning'){window.geRenderPlanningPage?.();window.renderAirportSystems?.();window.renderLoungeProcurement?.();window.renderBOSpaces?.()}
 else if(page==='gaso-planning'){window.renderGasoAllV231?.()}
}
async function boot(){
 try{
  showStatus('Menghubungkan ke Firebase / Firestore…');
  await window.GEStore.waitAuth();
  await waitFirebase();
  if(!hasAccess()){const target=typeof gxDefaultPage==='function'?gxDefaultPage():'app.html?page=index';if(target!==location.pathname+location.search)location.replace(target);return}
  showStatus('Mengambil data dari Firebase / Firestore…');
  await window.GEStore.hydrate(cfg.collections);
  rerender();
  const d=window.GEStore.get();
  const total=cfg.collections.reduce((n,k)=>{const v=d[k];return n+(Array.isArray(v)?v.length:(v&&typeof v==='object'?1:0))},0);
  showStatus(`Terhubung • Firestore • ${window.GEStore.projectId||window.GX_FIREBASE_CONFIG?.projectId||'ground-experience-portal'} • ${total} record terhidrasi`);
 }catch(e){console.error('[P40 Edition1 boot]',e);showStatus(e?.message||'Firebase / Firestore tidak dapat diakses.',true)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
