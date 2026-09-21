/* P40 Edition 1 canonical page boot.
 * Shell ownership: assets/portal-shell.js (same shell as the production dashboard).
 * Business-data ownership: Firebase/Firestore through /api/edition1-data.
 */
(function(){
'use strict';
const page=(location.pathname.split('/').pop()||'').toLowerCase();
const config={
 'e1-standar.html':{perm:'services',collections:['airports','personnel','touchpointStandards','skyPriority','announcements','standardContent']},
 'e1-inisiatif.html':{perm:'initiatives',collections:['initiatives','touchpoints','documents']},
 'e1-service-planning.html':{perm:'planning',collections:['stationMaterials','lounges','boSpaces','airportSystems','touchpointStandards','documents','serviceProcurement']},
 'e1-calendar.html':{perm:'initiatives',collections:['initiatives','projectEvents','touchpoints']},
 'e1-planning-documents.html':{perm:'planning',collections:['documents','initiatives']},
 'e1-data.html':{perm:'data',collections:['airports','personnel']},
 'e1-admin.html':{perm:'admin',collections:['users','inbox','auditLogs','portalManagerR2','airports','lounges']},
 'e1-berita.html':{perm:'news',collections:['articles','announcements','faqs','news','documents']},
 'e1-kontak.html':{perm:'contact',collections:['inbox']},
 'e1-lounge-list.html':{perm:'planning',collections:['lounges','loungeVisitors','serviceProcurement','documents']},
 'e1-branch-office-planning.html':{perm:'planning',collections:['lounges','boSpaces','serviceProcurement','airportSystems','stationMaterials','documents']},
 'e1-gaso-planning.html':{perm:'planning',collections:['gasoMaster','gasoServiceSupport','gasoPlanningService','airports','documents']}
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
 if(page==='e1-standar.html'){const panel=new URLSearchParams(location.search).get('panel');const panelButton=panel?document.querySelector(`[data-standard-panel="${panel}"]`):null;if(panel&&window.showStandardPanel)window.showStandardPanel(panel,panelButton);window.renderTouchpointStandards?.();window.renderPersonnelReadiness?.();window.renderSkyPriority?.();window.geEnsureStandardModalV248?.();window.geApplyStandardContentV248?.();window.renderAnnouncementLibraryV246?.()}
 else if(page==='e1-inisiatif.html'){window.renderInitiatives?.();window.geApplyInitiativePresentationV224?.()}
 else if(page==='e1-service-planning.html'){window.geRenderPlanningPage?.();window.renderStationMaterials?.()}
 else if(page==='e1-calendar.html'){window.geV251Ensure?.();window.geV251RenderTouchpointPage?.();window.geV251InitCalendar?.();window.geUpgradeCalendarModalV252?.();window.geAddCalendarFiltersV252?.();window.geUpgradeReminderV253?.();window.geCalBuildFiltersV2533?.();window.geCalRenderV2533?.();window.geCalRenderKPIV2534?.()}
 else if(page==='e1-planning-documents.html'){window.renderPlanningDocuments?.()}
 else if(page==='e1-data.html'){window.renderAirports?.();window.renderPersonnel?.();window.renderDocumentsAdmin?.()}
 else if(page==='e1-admin.html'){window.renderAdminOverview?.();window.renderAdminInbox?.();window.renderAuditLogs?.();window.p26RenderUsers?.();window.pmLoadPageR2?.()}
 else if(page==='e1-berita.html'){window.renderArticles?.();window.renderAnnouncements?.();window.renderFaqs?.();window.renderAnnouncementLibraryV246?.()}
 else if(page==='e1-lounge-list.html'){window.renderLounges?.();window.renderLoungeVisitors?.();window.renderLoungePriceSummaryV243?.();window.renderLoungeCardsV237?.()}
 else if(page==='e1-branch-office-planning.html'){window.geRenderPlanningPage?.();window.renderAirportSystems?.();window.renderLoungeProcurement?.();window.renderBOSpaces?.()}
 else if(page==='e1-gaso-planning.html'){window.renderGasoAllV231?.()}
}
async function boot(){
 try{
  showStatus('Menghubungkan ke Firebase / Firestore…');
  await window.GEStore.waitAuth();
  await waitFirebase();
  if(!hasAccess()){const target=typeof gxDefaultPage==='function'?gxDefaultPage():'index.html';if(target!==page)location.replace(target);return}
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
