/* r4-implementation-preview-r2.js */

/* R4 Implementation Preview R2 — active/hover/navigation state only.
   No business data or page CRUD logic is changed. */
(function(){
  'use strict';
  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const navKey=value=>{const u=new URL(value,location.href),file=(u.pathname.split('/').pop()||'index.html').toLowerCase();return file==='app.html'?`app:${u.searchParams.get('page')||'index'}`:`file:${file}`};
  const currentNavKey=navKey(location.href);

  function init(){
    // Make the actual current page visibly active.
    document.querySelectorAll('.side a[href]').forEach(a=>{
      const href=(a.getAttribute('href')||'').split('?')[0].split('#')[0].toLowerCase();
      a.classList.toggle('active', navKey(href)===currentNavKey);
      if(navKey(href)===currentNavKey){
        const parent=a.closest('.service-nav,.initiative-nav,.planning-nav');
        if(parent){
          parent.classList.remove('collapsed');
          const toggle=parent.querySelector('[data-nav-toggle]');
          toggle?.setAttribute('aria-expanded','true');
        }
      }
    });

    // Header wording follows the locked R4 prototype.
    const title=document.querySelector('.brand h1');
    const sub=document.querySelector('.brand p');
    if(title) title.textContent='Ground Experience';
    if(sub) sub.textContent='Service Experience Portal';

    // Hoverable links/buttons should never inherit legacy inline opacity/filter effects.
    document.querySelectorAll('.side a,.btn,.logout-btn,.r4-link,.r4-tabs button').forEach(el=>{
      el.style.cursor='pointer';
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();

/* r4-implementation-preview-r3.js */

/* R4 Implementation Preview R3 */
(function(){
'use strict';
// Edition 1 entrypoint keeps only transient UI preferences in memory.
// Business data is never stored here; Firestore remains the sole business source.
const E1_SHELL_STATE=window.__GE_E1_SHELL_STATE||(window.__GE_E1_SHELL_STATE={});
const e1ShellGet=k=>Object.prototype.hasOwnProperty.call(E1_SHELL_STATE,k)?E1_SHELL_STATE[k]:null;
const e1ShellSet=(k,v)=>{E1_SHELL_STATE[k]=String(v);return v};


function smoothTo(id){
  const el=document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
}

function init(){
  // Overview tabs:
  // Overview -> top of dashboard
  // Performance -> Experience/Journey section in the same dashboard
  // Initiatives -> initiative management page
  // Service Planning -> service planning module
  document.querySelectorAll('[data-r4-scroll]').forEach(a=>{
    a.addEventListener('click',e=>{
      e.preventDefault();
      const id=a.getAttribute('data-r4-scroll');
      smoothTo(id);
      document.querySelectorAll('.r4-tabs a').forEach(x=>x.classList.toggle('active',x===a));
    });
  });

  // Restore Overview active when user returns to the page top.
  window.addEventListener('scroll',()=>{
    if(window.scrollY<220){
      document.querySelectorAll('.r4-tabs a').forEach(x=>x.classList.toggle('active',x.dataset.r4Scroll==='r4-overview'));
    }
  },{passive:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();

/* r4-implementation-preview-r4.js */

/* R4 Implementation Preview R4 — display-only navigation nomenclature */
(function(){
'use strict';
const replacements = new Map([
  ['Touch Point Garuda Indonesia','Touch Point'],
  ['Standar Layanan Garuda Indonesia','Standard Layanan'],
  ['Peta Airport Penerbangan','Peta Airport'],
  ['Calendar & Project Tracking','Calendar & Project'],
  ['Service Planning Garuda Indonesia','Service Planning'],
  ['Lounge / Tenant Garuda Indonesia','Lounge / Tenant'],
  ['Lounge & Tenant Garuda Indonesia','Lounge & Tenant']
]);

function cleanTextNode(el){
  const text=(el.textContent||'').trim().replace(/\s+/g,' ');
  if(replacements.has(text)){
    // Preserve any nested badge/chevron if present.
    const nested=[...el.children];
    el.childNodes.forEach(n=>{ if(n.nodeType===3) n.textContent=''; });
    if(nested.length){
      el.insertBefore(document.createTextNode(replacements.get(text)+' '),nested[0]);
    } else {
      el.textContent=replacements.get(text);
    }
  }
}

function init(){
  document.querySelectorAll('.side a').forEach(cleanTextNode);
  document.querySelectorAll('.service-toggle span:first-child,.initiative-toggle span:first-child,.planning-toggle span:first-child').forEach(el=>{
    const s=(el.textContent||'').trim().toUpperCase();
    if(s.includes('LAYANAN GARUDA')) el.textContent='SERVICE EXPERIENCE';
    if(s.includes('KEGIATAN')||s.includes('INISIATIF')) el.textContent='MANAGEMENT';
    if(s.includes('SERVICE PLANNING')) el.textContent='PLANNING';
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

/* r4-implementation-preview-r5.js */

/* R4 Implementation Preview R5 */
(function(){
'use strict';

function r5Rows(){
  if(typeof currentInitiativeRows!=='function')return [];
  let rows=currentInitiativeRows();
  const p=document.getElementById('r5InitiativePriority')?.value||'';
  if(p)rows=rows.filter(x=>String(x.priority||'Normal')===p);
  return rows;
}
window.r5RenderAllInitiatives=function(){
  if(!document.body.contains(document.getElementById('r5InitiativePriority')))return;
  if(typeof refreshInitiativeFilters==='function')refreshInitiativeFilters();
  const rows=r5Rows().filter(x=>typeof geInitiativeScopedV224==='function'?geInitiativeScopedV224(x):true);
  const target=document.getElementById('initRows');
  if(target){
    target.innerHTML=rows.length
      ? rows.map((x,i)=>typeof geInitiativeCardV251==='function'?geInitiativeCardV251(x,i):'').join('')
      : '<div class="initiative-empty-v246">Belum ada inisiatif pada filter ini.</div>';
  }
  if(typeof renderInitiativeCharts==='function')renderInitiativeCharts(rows);
};

function initAllInitiativeGrid(){
  if(!document.getElementById('r5InitiativePriority'))return;
  // Override only this page's renderer; journey-specific initiative pages remain locked.
  window.renderInitiatives=window.r5RenderAllInitiatives;
  r5RenderAllInitiatives();
}

function init(){
  initAllInitiativeGrid();

  // Use the same management-attention interaction language on lounge notices.
  document.querySelectorAll('.lounge-note-v236').forEach(n=>{
    n.setAttribute('data-r4-warning','true');
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,80));
else setTimeout(init,80);
})();

/* r4-implementation-preview-r6.js */

/* R4 Implementation Preview R6 */
(function(){
'use strict';

const utilityFiles = new Set(['data.html','berita.html','kontak.html','admin.html']);

function buildSupportGroup(){
  const side=document.querySelector('.side');
  if(!side || side.querySelector('.r6-support-nav')) return;

  const links=[...side.querySelectorAll(':scope > a[href]')].filter(a=>{
    const href=(a.getAttribute('href')||'').split('?')[0].split('#')[0].toLowerCase();
    return utilityFiles.has(href);
  });
  if(!links.length)return;

  const wrap=document.createElement('div');
  wrap.className='r6-support-nav';
  const title=document.createElement('div');
  title.className='r6-support-title';
  title.textContent='System & Support';
  wrap.appendChild(title);

  links[0].parentNode.insertBefore(wrap,links[0]);
  links.forEach(a=>wrap.appendChild(a));

  // Reapply active state to moved items.
  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  wrap.querySelectorAll('a[href]').forEach(a=>{
    const href=(a.getAttribute('href')||'').split('?')[0].split('#')[0].toLowerCase();
    a.classList.toggle('active',navKey(href)===currentNavKey);
  });
}

function normalizeLogin(){
  if(!document.querySelector('.login-page'))return;
  const h=document.querySelector('.login-brand h1');
  const p=document.querySelector('.login-brand p');
  if(h)h.textContent='Ground Experience';
  if(p)p.textContent='Service Experience Portal';
}

function init(){
  buildSupportGroup();
  normalizeLogin();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();

/* v257-screenmap-final.js */
(function(){
'use strict';
const NAV_SVG={
 home:'<path d="M3 10.5 10 4l7 6.5V18H6v-7.5"/><path d="M8.5 18v-5h3v5"/>',
 cx:'<circle cx="10" cy="10" r="7"/><path d="M7 11c1.8 2 4.2 2 6 0"/><path d="M7.5 8h.01M12.5 8h.01"/>',
 journey:'<path d="M3 10h14M5.5 7.5 3 10l2.5 2.5M14.5 7.5 17 10l-2.5 2.5"/>',
 network:'<path d="M2.5 11h15M10 3.5v13M4.5 6.5h11M4.5 15h11"/><circle cx="10" cy="10" r="7.5"/>',
 station:'<path d="M4 17V7l6-4 6 4v10M7 17v-4h6v4M7 9h.01M10 9h.01M13 9h.01"/>',
 initiative:'<circle cx="10" cy="10" r="3"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4"/>',
 opportunity:'<path d="M10 2.5a5 5 0 0 0-3 9v2h6v-2a5 5 0 0 0-3-9Z"/><path d="M8 16h4M8.5 18h3"/>',
 scenario:'<path d="M3 5h5l2 3 2-3h5M3 15h5l2-3 2 3h5"/>',
 calendar:'<rect x="3" y="4.5" width="14" height="12.5" rx="2"/><path d="M6 2.5v4M14 2.5v4M3 8h14M6 11h2M10 11h2M6 14h2M10 14h2"/>',
 budget:'<rect x="3" y="5" width="14" height="11" rx="2"/><path d="M3 8h14M6 12h3"/>',
 readiness:'<path d="m4 10 4 4 8-9"/>',
 document:'<path d="M5 2.5h7l3 3V17H5Z"/><path d="M12 2.5V6h3M7.5 10h5M7.5 13h5"/>',
 data:'<ellipse cx="10" cy="5" rx="6" ry="2.5"/><path d="M4 5v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V5M4 10v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5"/>',
 user:'<circle cx="10" cy="7" r="3"/><path d="M4.5 17c.5-3 2.3-4.5 5.5-4.5s5 1.5 5.5 4.5"/>',
 history:'<path d="M4 6H1.8V3.8"/><path d="M3 6a7 7 0 1 1-.2 7"/><path d="M10 6v4l3 2"/>',
 support:'<path d="M4 10a6 6 0 0 1 12 0v5M4 11H2.5v4H6v-4H4M16 11h1.5v4H14v-4h2M14 17h-3"/>',
 standard:'<path d="M4 5h12M4 10h12M4 15h12"/>'
};
function icon(x){const key=({'⌂':'home','◎':'cx','↔':'journey','✈':'network','⌾':'station','⚙':'initiative','✧':'opportunity','◇':'scenario','▦':'calendar','▣':'budget','◉':'budget','✓':'readiness','▤':'document','≡':'standard','⬡':'data','◫':'data','♙':'user','◷':'history','☎':'support','⇧':'data','◈':'station'})[x]||'standard';return `<span class="ni" aria-hidden="true"><svg viewBox="0 0 20 20">${NAV_SVG[key]}</svg></span>`;}
const path=()=>location.pathname.split('/').pop()||'index.html';
const item=(href,label,i,sub=false)=>`<a class="ge-nav-link ${sub?'ge-nav-sub':''} ${path()===href?'active':''}" href="${href}" title="${label}">${icon(i)}<span>${label}</span></a>`;
function group(title,items){return `<div class="ge-nav-section">${title}</div>${items.join('')}`}
function dashboardPOV(s){
 const r=String(s?.role||'').trim().toLowerCase().replace(/[\s_-]+/g,' ');
 if(r==='super admin'||r==='superadmin')return 'superadmin';
 if(r==='management')return 'management';
 if(['ge team','ground experience team','head office','headoffice','staff'].includes(r))return 'ge-team';
 if(['branch office','branchoffice','bo'].includes(r))return 'branch';
 return 'unresolved';
}
window.GXDashboardPOV=dashboardPOV;
const navItem=(href,label,i,sub=false)=>item(href,label,i,sub);
function navFor(s){
 const pov=dashboardPOV(s);
 const planning=[
   item('service-planning.html','Planning Overview','≡'),
   item('planning-workspace.html','Planning Workspace','◇'),
   item('planning-documents.html','Planning Documents','▤')
 ];
 const commonSupport=group('SUPPORT',[item('berita.html','Berita & Informasi','▣'),item('kontak.html','Contact Support','☎')]);
 if(['Lounge Staff','Lounge Luar Biasa'].includes(s?.role)) return [
  group('LOUNGE OPERATION',[item('lounge-access.html','Lounge Access','◉'),item('lounge-visitor.html','Visitor & Report','▤')]),
  commonSupport].join('');
 if(pov==='branch') return [
  item('index.html','Branch Office Dashboard','⌂'),
  group('MY STATION',[item('station-360.html','Station Profile / 360','⌾'),item('readiness.html','Readiness','✓'),item('service-capability.html','Capability & Standards','◈')]),
  group('CUSTOMER EXPERIENCE',[item('customer-experience.html','Customer Experience','◎')]),
  group('TASKS & ACTIONS',[item('improvement-intake.html','Improvement Opportunity','✧'),item('inisiatif.html','Initiative & Action','⚙')]),
  group('IMPROVEMENT & PLANNING',planning),
  group('BUDGET & COST',[item('budget-cost.html','Budget & Cost','▣')]),
  group('DOCUMENTS / SUPPORT',[item('kontak.html','Support / Reference','☎')])].join('');
 if(pov==='ge-team') return [
  item('index.html','GE Team Dashboard','⌂'),
  group('EXPERIENCE & INSIGHT',[item('customer-experience.html','Customer Experience','◎'),item('network-stations.html','Airport Experience Network','✈'),item('station-360.html','Station Profile / 360','⌾')]),
  group('READINESS & STANDARDS',[item('readiness.html','Readiness Assessment','✓'),item('service-capability.html','Capability & Standards','◈'),item('standar.html','Service Standard','≡')]),
  group('IMPROVEMENT & PLANNING',[item('improvement-intake.html','Improvement Opportunity','✧'),item('inisiatif.html','Initiative & Improvement','⚙'),...planning]),
  group('BUDGET & COST',[item('budget-cost.html','Budget & Cost','▣'),item('cost-intelligence.html','Cost Intelligence','◉')]),
  group('DATA',[item('data.html','Data Management','⬡')]),
  commonSupport].join('');
 if(pov==='management') return [
  item('index.html','Management Dashboard','⌂'),
  group('EXPERIENCE & INSIGHT',[item('customer-experience.html','Customer Experience','◎'),item('network-stations.html','Airport Experience Network','✈')]),
  group('IMPROVEMENT & PLANNING',[item('inisiatif.html','Initiative & Improvement','⚙'),...planning]),
  group('BUDGET & COST',[item('budget-cost.html','Budget & Cost','▣')]),
  group('REPORTS / DECISION SUPPORT',[item('management-outcome.html','Management Outcome','◷')]),
  commonSupport].join('');
 if(pov==='superadmin') return [
  item('index.html','Super Admin / System Dashboard','⌂'),
  group('EXPERIENCE & INSIGHT',[item('customer-experience.html','Customer Experience','◎'),item('network-stations.html','Airport Experience Network','✈'),item('station-360.html','Station Profile / 360','⌾')]),
  group('READINESS & STANDARDS',[item('readiness.html','Readiness Assessment','✓'),item('service-capability.html','Capability & Standards','◈'),item('standar.html','Service Standard','≡')]),
  group('IMPROVEMENT & PLANNING',[item('inisiatif.html','Initiative & Improvement','⚙'),item('improvement-intake.html','Improvement Opportunity','✧'),...planning]),
  group('BUDGET & COST',[item('budget-cost.html','Budget & Cost','▣'),item('cost-intelligence.html','Cost Intelligence','◉')]),
  group('DATA & ADMINISTRATION',[item('data.html','Data Management','⬡'),item('master-data.html','Master Data','◫'),item('admin.html','User & Access','♙'),item('portal-management.html','Portal Management','⚙'),item('audit-log.html','Audit Log','◷')]),
  commonSupport].join('');
 return [group('DASHBOARD',[item('index.html','Dashboard','⌂')]),commonSupport].join('');
}

const finalUserPages=new Set(['index.html','customer-experience.html','cx-import.html','touchpoint.html','network-stations.html','station-360.html','inisiatif.html','improvement-intake.html','action-scenario.html','calendar.html','budget-cost.html','program-kerja.html','cost-intelligence.html','readiness.html','agreement-service.html','standar.html','data.html','master-data.html','admin.html','portal-management.html','audit-log.html','service-capability.html','service-locations.html','berita.html','kontak.html','management-outcome.html','airport-experience-map.html','map.html','profile.html','service-planning.html','planning-workspace.html','lounge-list.html','branch-office-planning.html','gaso-planning.html','planning-documents.html','e1-standar.html','e1-inisiatif.html','e1-service-planning.html','e1-calendar.html','e1-planning-documents.html','e1-data.html','e1-admin.html','e1-berita.html','e1-kontak.html','e1-lounge-list.html','e1-branch-office-planning.html','e1-gaso-planning.html']);
const PLANNING_PAGES=new Set(['service-planning.html','planning-workspace.html','lounge-list.html','branch-office-planning.html','gaso-planning.html','planning-documents.html']);
const PLANNING_TABS=[
  ['lounge-list.html','Lounge / Tenant','lounge'],
  ['branch-office-planning.html','Branch Office','branch'],
  ['gaso-planning.html','GASO','gaso']
];
function planningContext(){
 const p=path();
 if(p==='lounge-list.html')return'lounge';
 if(p==='branch-office-planning.html')return'branch';
 if(p==='gaso-planning.html')return'gaso';
 return'';
}
function planningTabs(){
 if(!PLANNING_PAGES.has(path()))return;
 const main=document.querySelector('body > .shell > .main');if(!main||main.querySelector('.ge-planning-tabs'))return;
 const context=planningContext();
 const wrap=document.createElement('nav');wrap.className='ge-planning-tabs';wrap.setAttribute('aria-label','Planning Workspace');
 wrap.innerHTML=PLANNING_TABS.map(([href,label,key])=>`<a href="${href}" class="${context===key?'active':''}" aria-current="${context===key?'page':'false'}"><span>${label}</span></a>`).join('');
 const target=main.querySelector('.hero,.ge-page-head,.title');
 if(target)target.insertAdjacentElement('afterend',wrap);else main.prepend(wrap);
 const title=main.querySelector('.hero h2,.ge-page-head h1');
 if(title&&path()!=='planning-workspace.html')title.dataset.gePlanningTitle=title.textContent.trim();
}
function cleanNavigation(){
 const side=document.querySelector('body > .shell > .side');if(!side)return;
 side.querySelectorAll('.ge-nav-section').forEach(section=>{
   let node=section.nextElementSibling,has=false;
   while(node&&!node.classList.contains('ge-nav-section')&&!node.classList.contains('ge-nav-divider')){
     if(node.matches?.('a.ge-nav-link')&&getComputedStyle(node).display!=='none'&&!node.classList.contains('rbac-hidden'))has=true;
     node=node.nextElementSibling;
   }
   section.style.display=has?'':'none';
 });
 side.querySelectorAll('.ge-nav-link[href]').forEach(a=>a.classList.toggle('active',navKey(a.getAttribute('href')||'')===currentNavKey));
}
function ensureShell(){
 if(path()==='login.html'||!finalUserPages.has(path())) return null;
 const top=document.querySelector('body > .top');
 const shell=document.querySelector('body > .shell');
 const side=shell&&shell.querySelector(':scope > .side');
 const main=shell&&shell.querySelector(':scope > .main');
 if(!top||!shell||!side||!main){console.warn('Final portal shell missing for',path());return null}
 return {top,shell,side,main};
}
function applyCollapsed(on){
 document.body.classList.toggle('sidebar-collapsed',!!on);
 try{e1ShellSet('GE_V257_SIDEBAR_COLLAPSED',on?'1':'0')}catch(e){}
 const btn=document.querySelector('.ge-sidebar-toggle');
 if(btn){btn.setAttribute('aria-expanded',on?'false':'true');const a=btn.querySelector('.toggle-arrow');if(a)a.textContent=on?'»':'«'}
}
function sidebarToggle(){
 let btn=document.querySelector('.ge-sidebar-toggle');
 if(!btn){
   btn=document.createElement('button');btn.type='button';btn.className='ge-sidebar-toggle';btn.innerHTML='<span class="toggle-arrow">«</span><span class="toggle-label">Collapse</span>';const side=document.querySelector('body > .shell > .side');if(side)side.appendChild(btn);
 }
 btn.onclick=()=>applyCollapsed(!document.body.classList.contains('sidebar-collapsed'));
 let saved=false;try{saved=e1ShellGet('GE_V257_SIDEBAR_COLLAPSED')==='1'}catch(e){}
 applyCollapsed(saved);
}
function shell(){
 if(path()==='login.html'||!finalUserPages.has(path()))return;
 const refs=ensureShell();
 if(!refs)return;
 document.body.classList.add('final-v257','final-shell-r5');
 const s=window.gxGetSession?gxGetSession():window.GX_CURRENT_USER||{};
 const pov=dashboardPOV(s);
 const initials=(s.name||s.username||'GE').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
 const roleLabel=pov==='branch'?(s.unit||'Branch Office'):(pov==='ge-team'?'Ground Experience Team':(s.role||'User'));
 const context={superadmin:'Super Admin / System Dashboard',management:'Management Dashboard','ge-team':'Ground Experience Team / Head Office Dashboard',branch:'Branch Office Dashboard',unresolved:'Dashboard — Role Not Mapped'}[pov]||'Dashboard';
 refs.top.innerHTML=`<button id="mobileNavTriggerV233" class="mobile-nav-trigger-v233 ge-iconbtn" type="button" aria-label="Menu">☰</button>
 <div class="ge-brand-logos"><img class="garuda" src="assets/garuda-horizontal-white.png" alt="Garuda Indonesia"><img class="danantara" src="assets/danantara-white-user.png" alt="Danantara Indonesia"></div>
 <div class="ge-title"><strong>GROUND EXPERIENCE PORTAL</strong><span>${context}</span></div>
 <div class="ge-session"><label class="filter"><span>Period</span><select id="gePeriodSelect" aria-label="Period"></select></label><button class="ge-top-action ge-notify" id="geNotifyBtn" type="button" title="Notifications" aria-label="Notifications"><span class="bell-shape"></span><b class="ge-notify-badge" id="geNotifyBadge" hidden></b></button><a class="ge-top-action ge-help" href="kontak.html" title="Help" aria-label="Help">?</a><button class="ge-user-menu" id="geUserMenuBtn" type="button" aria-expanded="false" aria-haspopup="menu"><span class="avatar">${initials}</span><span class="who"><b>${s.name||s.username||'User'}</b><span>${roleLabel}</span></span></button><div class="ge-user-pop" id="geUserPop" role="menu"><a href="profile.html" role="menuitem">Profile</a><button type="button" id="geMenuNotifications" role="menuitem">Notifications</button><button type="button" id="geLogoutBtn" role="menuitem">Sign Out</button></div><div class="ge-notify-pop" id="geNotifyPop" role="dialog" aria-label="Notifications"><div class="ge-pop-head"><b>Notifications</b><button type="button" id="geNotifyClose" aria-label="Close">×</button></div><div id="geNotifyList" class="ge-notify-list"></div></div></div>`;
 refs.side.innerHTML=navFor(s);
 if(typeof gxApplyNavigation==='function')gxApplyNavigation();
 cleanNavigation();
 planningTabs();
 sidebarToggle();
 const mt=document.getElementById('mobileNavTriggerV233'); if(mt)mt.onclick=()=>document.body.classList.toggle('nav-open');
 setupAccountControls(s);
 setupPeriodControl();
}
function setupAccountControls(s){
 const umb=document.getElementById('geUserMenuBtn'),up=document.getElementById('geUserPop');
 const np=document.getElementById('geNotifyPop'),nb=document.getElementById('geNotifyBtn'),nc=document.getElementById('geNotifyClose');
 const list=document.getElementById('geNotifyList'),badge=document.getElementById('geNotifyBadge');
 const notifications=()=>{try{const d=window.GEStore?.get?.()||{};const uid=String(s?.uid||s?.id||'');const rows=Array.isArray(d.inbox)?d.inbox.filter(x=>!x.recipientId||String(x.recipientId)===uid):[];return rows.slice(0,8)}catch(e){return[]}};
 const renderNotifications=()=>{const rows=notifications();const unread=rows.filter(x=>String(x.status||'').toUpperCase()!=='READ').length;if(badge){badge.textContent=unread>99?'99+':String(unread);badge.hidden=!unread}if(list)list.innerHTML=rows.length?rows.map(x=>`<div class="ge-notify-item"><b>${String(x.subject||x.title||x.type||'Notification').replace(/[&<>]/g,'')}</b><span>${String(x.message||x.detail||'').replace(/[&<>]/g,'')}</span></div>`).join(''):'<div class="ge-notify-empty">No notifications available.</div>'};
 const closeAll=()=>{up?.classList.remove('open');np?.classList.remove('open');umb?.setAttribute('aria-expanded','false')};
 umb?.addEventListener('click',e=>{e.stopPropagation();np?.classList.remove('open');up?.classList.toggle('open');umb.setAttribute('aria-expanded',up.classList.contains('open')?'true':'false')});
 nb?.addEventListener('click',e=>{e.stopPropagation();up?.classList.remove('open');np?.classList.toggle('open');renderNotifications()});
 nc?.addEventListener('click',closeAll);
 document.getElementById('geMenuNotifications')?.addEventListener('click',e=>{e.stopPropagation();up?.classList.remove('open');np?.classList.add('open');renderNotifications()});
 document.getElementById('geLogoutBtn')?.addEventListener('click',()=>gxLogout());
 document.addEventListener('click',closeAll,{capture:true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
 renderNotifications();
}
function setupPeriodControl(){
 const sel=document.getElementById('gePeriodSelect');if(!sel)return;
 const years=new Set();
 try{const d=window.GEStore?.get?.()||{};[...(d.initiatives||[]),...(d.budgets||[]),...(d.actuals||[]),...(d.measurements||[])].forEach(x=>{const raw=x.periodStart||x.period||x.year||x.date||x.updatedAt||x.createdAt;const m=String(raw||'').match(/(20\d{2})/);if(m)years.add(m[1])})}catch(e){}
 if(!years.size)years.add(String(new Date().getFullYear()));
 const ordered=[...years].sort((a,b)=>Number(b)-Number(a));sel.innerHTML=ordered.map(y=>`<option value="${y}">${y}</option>`).join('');
 let saved='';try{saved=e1ShellGet('GE_V257_DASHBOARD_PERIOD')||''}catch(e){};if(saved&&ordered.includes(saved))sel.value=saved;
 sel.addEventListener('change',()=>{try{e1ShellSet('GE_V257_DASHBOARD_PERIOD',sel.value)}catch(e){};document.dispatchEvent(new CustomEvent('ge-dashboard-period-change',{detail:{year:sel.value}}))});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',shell);else shell();
})();

/* v257-r8-stabilization.js */
(function(){
'use strict';
/* The Initiative page owns its renderer, buttons, and V224 modals in its HTML/app engine.
   Do not replace them from the shared shell. */
if(document.getElementById('initiativeModalV224'))return;
const KEY='GE_V257_R8_JOURNEY';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function journeyOf(x){
 const scopes=Array.isArray(x?.journeyScopes)?x.journeyScopes:[];
 if(scopes.length)return scopes;
 if(x?.journey)return [x.journey];
 try{if(typeof getJourney==='function'&&x?.tp)return [getJourney(x.tp)]}catch(e){}
 return [];
}
function curJourney(){try{return e1ShellGet(KEY)||''}catch(e){return ''}}
function setJourney(j){try{e1ShellSet(KEY,j||'')}catch(e){};window.activeJourney=j||''}
function filtered(){
 const all=(window.data?.initiatives||[]).slice(), j=curJourney();
 let rows=j?all.filter(x=>journeyOf(x).includes(j)):all;
 const q=(document.getElementById('q')?.value||'').trim().toLowerCase();
 const ft=document.getElementById('ft')?.value||'',fs=document.getElementById('fs')?.value||'';
 return rows.filter(x=>{
   const tps=Array.isArray(x.touchpoints)&&x.touchpoints.length?x.touchpoints:[x.tp].filter(Boolean);
   let ach='';try{ach=typeof achievement==='function'?achievement(x.plan,x.real):''}catch(e){}
   const blob=`${x.name||''} ${tps.join(' ')} ${x.airport||''} ${x.pic||''}`.toLowerCase();
   return (!q||blob.includes(q))&&(!ft||tps.includes(ft))&&(!fs||ach===fs);
 });
}
function ratio(x){const p=Number(x?.plan||0),r=Number(x?.real||0);if(!p)return r?100:0;return Math.max(0,Math.min(100,Math.round(r/p*100)))}
function ach(x){try{return typeof achievement==='function'?achievement(x.plan,x.real):'Meet'}catch(e){return 'Meet'}}
function due(x){if(!x?.dueDate)return '-';try{return new Date(x.dueDate+'T00:00:00').toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}catch(e){return x.dueDate}}
function card(x,i){const r=ratio(x),a=ach(x),c=String(a).toLowerCase();return `<article class="initiative-card-r8" data-r8-id="${esc(x.id)}"><div class="r8-card-top"><div><div class="r8-no">${String(i+1).padStart(2,'0')}</div><div class="r8-ring" style="--p:${r}%"><b>${r}%</b></div></div><div><span class="r8-ach ${c}">${esc(a)}</span><div class="r8-title" style="margin-top:13px">${esc(x.name||'Untitled Initiative')}</div></div></div><div class="r8-meta"><div><small>PIC</small><b>${esc(x.pic||'-')}</b></div><div><small>Due Date</small><b>${esc(due(x))}</b></div><div><small>Touch Point</small><b>${esc(x.tp||'-')}</b></div><div><small>Station</small><b>${esc(x.airport||'ALL STATION')}</b></div><div><small>Target</small><b>${Number(x.plan||0)}%</b></div><div><small>Realisasi</small><b>${Number(x.real||0)}%</b></div></div><div class="r8-actions"><button type="button" data-r8-action="detail">Detail / Timeline</button><button type="button" data-r8-action="update">Update</button><button type="button" class="danger" data-r8-action="delete">Hapus</button></div></article>`}
function render(){
 const box=document.getElementById('initRows');if(!box)return;
 const rows=filtered();
 box.innerHTML=rows.length?rows.map(card).join(''):'<div class="ge-card" style="padding:20px">Belum ada inisiatif sesuai filter yang dipilih.</div>';
 try{if(typeof renderInitiativeCharts==='function')renderInitiativeCharts(rows)}catch(e){console.error(e)}
 document.querySelectorAll('.journey-tab').forEach(b=>b.classList.toggle('active',(b.dataset.journey||'')===curJourney()));
}
window.setJourneyFilter=function(j){setJourney(j||'');render()};
window.renderInitiatives=render;
function ensureModal(){if(document.getElementById('r8InitiativeBackdrop'))return;document.body.insertAdjacentHTML('beforeend',`<div id="r8InitiativeBackdrop"><div class="r8-modal-card" style="width:min(920px,96vw);padding:24px"><div style="display:flex;justify-content:space-between;gap:12px;align-items:start"><div><div id="r8ModalEyebrow" style="font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#7890a8">Initiative</div><h2 id="r8ModalTitle" style="margin:5px 0 0;color:#0b3553"></h2></div><button type="button" id="r8ModalClose" style="border:0;background:#eef3f8;border-radius:50%;width:36px;height:36px;cursor:pointer">×</button></div><div id="r8ModalBody" style="margin-top:18px"></div></div></div>`);document.getElementById('r8ModalClose').onclick=closeModal;document.getElementById('r8InitiativeBackdrop').addEventListener('click',e=>{if(e.target.id==='r8InitiativeBackdrop')closeModal()})}
function showModal(){ensureModal();document.getElementById('r8InitiativeBackdrop').classList.add('show')}
function closeModal(){document.getElementById('r8InitiativeBackdrop')?.classList.remove('show')}
function get(id){return (window.data?.initiatives||[]).find(x=>String(x.id)===String(id))}
function detail(x){showModal();r8ModalEyebrow.textContent='Initiative Detail & Timeline';r8ModalTitle.textContent=x.name||'Initiative';const wf=Array.isArray(x.workflow)?x.workflow:[];r8ModalBody.innerHTML=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px"><div class="ge-card" style="padding:12px"><small>Station</small><b style="display:block;margin-top:4px">${esc(x.airport||'ALL')}</b></div><div class="ge-card" style="padding:12px"><small>PIC</small><b style="display:block;margin-top:4px">${esc(x.pic||'-')}</b></div><div class="ge-card" style="padding:12px"><small>Progress</small><b style="display:block;margin-top:4px">${ratio(x)}%</b></div><div class="ge-card" style="padding:12px"><small>Due Date</small><b style="display:block;margin-top:4px">${esc(due(x))}</b></div></div><h3 style="color:#0b3553">Timeline / Tahapan</h3>${wf.length?wf.map((s,i)=>`<div style="display:grid;grid-template-columns:34px 1fr;gap:10px;padding:10px 0;border-bottom:1px solid #e1e8ef"><div style="width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#e8eff5;color:#315f83;font-weight:700">${i+1}</div><div><b>${esc(s.title||s.name||'Tahapan')}</b><div style="color:#75889a;font-size:12px;margin-top:4px">${esc(s.status||'')} ${s.date?'• '+esc(s.date):''}</div><div style="margin-top:4px">${esc(s.note||s.remark||'')}</div></div></div>`).join(''):'<div class="ge-card" style="padding:16px;color:#70849a">Belum ada tahapan/timeline.</div>'}`}
function edit(x){showModal();r8ModalEyebrow.textContent='Update Initiative';r8ModalTitle.textContent=x.name||'Initiative';r8ModalBody.innerHTML=`<form id="r8EditForm"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><label>Nama Initiative<input id="r8Name" value="${esc(x.name||'')}"></label><label>PIC<input id="r8Pic" value="${esc(x.pic||'')}"></label><label>Station<input id="r8Airport" value="${esc(x.airport||'')}"></label><label>Due Date<input id="r8Due" type="date" value="${esc(x.dueDate||'')}"></label><label>Journey<select id="r8Journey"><option>Pre-Journey</option><option>Pre-Flight</option><option>Post-Flight</option><option>Post-Journey</option></select></label><label>Touch Point<input id="r8Tp" value="${esc(x.tp||'')}"></label><label>Target (%)<input id="r8Plan" type="number" min="0" max="100" value="${Number(x.plan||0)}"></label><label>Realisasi (%)<input id="r8Real" type="number" min="0" max="100" value="${Number(x.real||0)}"></label><label style="grid-column:1/-1">Keterangan<textarea id="r8Remark" rows="4">${esc(x.remark||'')}</textarea></label></div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px"><button type="button" class="btn secondary" id="r8Cancel">Batal</button><button type="submit" class="btn">Simpan Update</button></div></form>`;r8Journey.value=journeyOf(x)[0]||'Pre-Flight';r8Cancel.onclick=closeModal;r8EditForm.onsubmit=e=>{e.preventDefault();x.name=r8Name.value.trim();x.pic=r8Pic.value.trim();x.airport=r8Airport.value.trim().toUpperCase();x.dueDate=r8Due.value;x.journey=r8Journey.value;x.journeyScopes=[r8Journey.value];x.tp=r8Tp.value.trim();x.touchpoints=[r8Tp.value.trim()].filter(Boolean);x.plan=Number(r8Plan.value||0);x.real=Number(r8Real.value||0);x.remark=r8Remark.value.trim();try{if(typeof save==='function')save();else if(window.GEStore){const d=GEStore.get();d.initiatives=data.initiatives;GEStore.save(d)}}catch(err){console.error(err)}closeModal();render()}}
function del(x){if(!confirm(`Hapus Initiative "${x.name||''}"?`))return;const a=window.data?.initiatives||[];const i=a.indexOf(x);if(i>=0)a.splice(i,1);try{if(typeof save==='function')save()}catch(e){}render()}
function bindInitiative(){const box=document.getElementById('initRows');if(!box)return;box.addEventListener('click',e=>{const b=e.target.closest('[data-r8-action]');if(!b)return;const card=b.closest('[data-r8-id]');const x=get(card?.dataset.r8Id);if(!x)return;const a=b.dataset.r8Action;if(a==='detail')detail(x);else if(a==='update')edit(x);else if(a==='delete')del(x)});document.querySelectorAll('.journey-tab').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();window.setJourneyFilter(b.dataset.journey||'')}));['q','ft','fs'].forEach(id=>document.getElementById(id)?.addEventListener('input',render));setJourney(curJourney());render()}
function stabilizeSidebar(){const side=document.querySelector('body.final-v257 .side');if(!side)return;let toggle=side.querySelector('.ge-sidebar-toggle');let wrap=side.querySelector('.r8-nav-scroll');if(!wrap){wrap=document.createElement('div');wrap.className='r8-nav-scroll';[...side.children].filter(x=>x!==toggle).forEach(x=>wrap.appendChild(x));side.insertBefore(wrap,toggle||null)}if(toggle){toggle.onclick=()=>{const on=!document.body.classList.contains('sidebar-collapsed');document.body.classList.toggle('sidebar-collapsed',on);try{e1ShellSet('GE_V257_SIDEBAR_COLLAPSED',on?'1':'0')}catch(e){};toggle.setAttribute('aria-expanded',on?'false':'true');const ar=toggle.querySelector('.toggle-arrow');if(ar)ar.textContent=on?'»':'«'};const saved=e1ShellGet('GE_V257_SIDEBAR_COLLAPSED')==='1';document.body.classList.toggle('sidebar-collapsed',saved);const ar=toggle.querySelector('.toggle-arrow');if(ar)ar.textContent=saved?'»':'«'} }
function touchpointPreview(){const inp=document.getElementById('tpEditFiles'),box=document.getElementById('tpPhotoPreview');if(!inp||!box)return;inp.addEventListener('change',()=>{const fs=[...inp.files].slice(0,5);box.innerHTML='';fs.forEach((f,i)=>{const r=new FileReader();r.onload=()=>{const d=document.createElement('div');d.className='tp-preview-item';d.innerHTML=`<img src="${r.result}" alt="Preview ${i+1}"><input type="text" data-r8-caption="${i}" placeholder="Keterangan foto ${i+1}">`;box.appendChild(d)};r.readAsDataURL(f)})})}
function init(){setTimeout(touchpointPreview,30)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

/* v257-r9-final-shell.js */
(function(){
'use strict';
/* Pages that carry the proven V224 initiative workflow use it unchanged.
   Release the boot screen here; the native page renderer remains responsible for its cards and modals. */
if(document.getElementById('initiativeModalV224')){
 const release=()=>{document.documentElement.classList.remove('r9-boot');document.documentElement.classList.add('r9-ready')};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',release,{once:true});else release();
 return;
}
const JKEY='GE_V257_R9_JOURNEY';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function store(){try{return window.GEStore?GEStore.get():{}}catch(e){return {}}}
function saveStore(d){try{if(window.GEStore)GEStore.save(d)}catch(e){console.error(e)}}
function getJourney(){try{return e1ShellGet(JKEY)||''}catch(e){return ''}}
function setJourney(j){try{e1ShellSet(JKEY,j||'')}catch(e){};window.activeJourney=j||''}
function journeysOf(x){const a=Array.isArray(x?.journeyScopes)?x.journeyScopes.filter(Boolean):[];if(a.length)return a;if(x?.journey)return[x.journey];try{if(typeof window.getJourney==='function'&&x?.tp)return[window.getJourney(x.tp)]}catch(e){}return[]}
function achievement(x){const p=Number(x?.plan||0),r=Number(x?.real||0);if(p<=0)return r>0?'Meet':'Below';if(r>p)return'Exceed';if(r===p)return'Meet';return'Below'}
function ratio(x){const p=Number(x?.plan||0),r=Number(x?.real||0);return p>0?Math.max(0,Math.min(100,Math.round(r/p*100))):Math.max(0,Math.min(100,Math.round(r||0)))}
function currentRows(){const d=store(),j=getJourney();let rows=(d.initiatives||[]).slice();if(j)rows=rows.filter(x=>journeysOf(x).includes(j));const q=(document.getElementById('q')?.value||'').trim().toLowerCase(),ft=document.getElementById('ft')?.value||'',fs=document.getElementById('fs')?.value||'';return rows.filter(x=>{const tps=Array.isArray(x.touchpoints)&&x.touchpoints.length?x.touchpoints:[x.tp].filter(Boolean);const blob=`${x.name||''} ${x.airport||''} ${x.pic||''} ${tps.join(' ')}`.toLowerCase();return(!q||blob.includes(q))&&(!ft||tps.includes(ft))&&(!fs||achievement(x)===fs)})}
function due(x){if(!x?.dueDate)return'-';try{return new Date(x.dueDate+'T00:00:00').toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}catch(e){return x.dueDate}}
function card(x,i){const r=ratio(x),a=achievement(x),cl=a.toLowerCase();return `<article class="initiative-card-r8" data-r9-id="${esc(x.id)}"><div class="r8-card-top"><div><div class="r8-no">${String(i+1).padStart(2,'0')}</div><div class="r8-ring" style="--p:${r}%"><b>${r}%</b></div></div><div><span class="r8-ach ${cl}">${a}</span><div class="r8-title" style="margin-top:13px">${esc(x.name||'Untitled Initiative')}</div></div></div><div class="r8-meta"><div><small>PIC</small><b>${esc(x.pic||'-')}</b></div><div><small>Due Date</small><b>${esc(due(x))}</b></div><div><small>Touch Point</small><b>${esc(x.tp||'-')}</b></div><div><small>Station</small><b>${esc(x.airport||'ALL STATION')}</b></div><div><small>Target</small><b>${Number(x.plan||0)}%</b></div><div><small>Realisasi</small><b>${Number(x.real||0)}%</b></div></div><div class="r8-actions"><button type="button" data-r9-action="detail">Detail / Timeline</button><button type="button" data-r9-action="update">Update</button><button type="button" class="danger" data-r9-action="delete">Hapus</button></div></article>`}
function renderCharts(rows){const box=document.getElementById('initiativeCharts');if(!box)return;const j=getJourney();const d=store();let base=(d.initiatives||[]).slice();if(j)base=base.filter(x=>journeysOf(x).includes(j));const byTp=new Map();base.forEach(x=>{const tp=x.tp||'Other';if(!byTp.has(tp))byTp.set(tp,[]);byTp.get(tp).push(x)});const entries=[...byTp.entries()].slice(0,8);box.innerHTML=entries.length?entries.map(([tp,a])=>{const plan=a.reduce((s,x)=>s+Number(x.plan||0),0),real=a.reduce((s,x)=>s+Number(x.real||0),0),pct=plan>0?Math.round(real/plan*100):0;return `<div class="card" style="text-align:center"><div class="r8-ring" style="--p:${Math.min(100,pct)}%;width:150px;height:150px;margin:14px auto"><b style="font-size:30px">${pct}%</b></div><h3>${esc(tp)}</h3><p class="section-subtitle">${a.length} initiative${a.length===1?'':'s'} • Target ${Math.round(plan)}% • Realisasi ${Math.round(real)}%</p></div>`}).join(''):'<div class="ge-card" style="padding:18px">Belum ada data initiative pada Journey yang dipilih.</div>'}
function renderInitiatives(){const box=document.getElementById('initRows');if(!box)return;const rows=currentRows();box.innerHTML=rows.length?rows.map(card).join(''):'<div class="ge-card" style="padding:20px">Belum ada Initiative sesuai filter yang dipilih.</div>';box.querySelectorAll('[data-r9-action]').forEach(b=>{b.onclick=e=>{e.preventDefault();e.stopPropagation();const c=b.closest('[data-r9-id]'),x=findInit(c?.dataset.r9Id);if(!x)return;const a=b.dataset.r9Action;if(a==='detail')detail(x);else if(a==='update')update(x);else if(a==='delete')del(x)}});renderCharts(rows);document.querySelectorAll('.journey-tab').forEach(b=>b.classList.toggle('active',(b.dataset.journey||'')===getJourney()))}
window.setJourneyFilter=function(j){setJourney(j||'');renderInitiatives()};window.renderInitiatives=renderInitiatives;
function ensureModal(){let b=document.getElementById('r9InitiativeBackdrop');if(b)return b;document.body.insertAdjacentHTML('beforeend',`<div id="r9InitiativeBackdrop" style="display:none;position:fixed;inset:0;z-index:61000;background:rgba(0,18,49,.58);align-items:center;justify-content:center;padding:18px"><div class="r8-modal-card" style="width:min(920px,96vw);max-height:calc(100vh - 36px);overflow:auto;background:#fff;border-radius:14px;padding:24px;box-shadow:0 24px 70px rgba(0,18,49,.3)"><div style="display:flex;justify-content:space-between;gap:12px"><div><div id="r9ModalEyebrow" style="font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#7890a8"></div><h2 id="r9ModalTitle" style="margin:5px 0;color:#0b3553"></h2></div><button id="r9ModalClose" type="button" style="width:36px;height:36px;border:0;border-radius:50%;background:#eef3f8;cursor:pointer">×</button></div><div id="r9ModalBody" style="margin-top:16px"></div></div></div>`);b=document.getElementById('r9InitiativeBackdrop');document.getElementById('r9ModalClose').onclick=()=>b.style.display='none';b.addEventListener('click',e=>{if(e.target===b)b.style.display='none'});return b}
function findInit(id){const persisted=store().initiatives||[],live=window.data?.initiatives||[];return persisted.find(x=>String(x.id)===String(id))||live.find(x=>String(x.id)===String(id))}
function detail(x){const b=ensureModal();document.getElementById('r9ModalEyebrow').textContent='Initiative Detail & Timeline';document.getElementById('r9ModalTitle').textContent=x.name||'Initiative';const wf=Array.isArray(x.workflow)?x.workflow:[];document.getElementById('r9ModalBody').innerHTML=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px"><div class="ge-card" style="padding:12px"><small>Station</small><b style="display:block">${esc(x.airport||'ALL')}</b></div><div class="ge-card" style="padding:12px"><small>PIC</small><b style="display:block">${esc(x.pic||'-')}</b></div><div class="ge-card" style="padding:12px"><small>Progress</small><b style="display:block">${ratio(x)}%</b></div><div class="ge-card" style="padding:12px"><small>Due Date</small><b style="display:block">${esc(due(x))}</b></div></div><h3 style="margin-top:18px">Timeline / Tahapan</h3>${wf.length?wf.map((w,i)=>`<div style="padding:10px 0;border-bottom:1px solid #e4eaf0"><b>${i+1}. ${esc(w.title||w.name||'Tahapan')}</b><div class="ge-muted">${esc(w.status||'')} ${w.date?'• '+esc(w.date):''}</div></div>`).join(''):'<div class="ge-card" style="padding:14px">Belum ada tahapan/timeline.</div>'}`;b.style.display='flex'}
function update(x){const b=ensureModal();document.getElementById('r9ModalEyebrow').textContent='Update Initiative';document.getElementById('r9ModalTitle').textContent=x.name||'Initiative';document.getElementById('r9ModalBody').innerHTML=`<form id="r9EditForm"><div class="ge-form-grid"><label>Name<input id="r9Name" value="${esc(x.name||'')}"></label><label>PIC<input id="r9Pic" value="${esc(x.pic||'')}"></label><label>Station<input id="r9Airport" value="${esc(x.airport||'')}"></label><label>Due Date<input id="r9Due" type="date" value="${esc(x.dueDate||'')}"></label><label>Journey<select id="r9Journey"><option>Pre-Journey</option><option>Pre-Flight</option><option>Post-Flight</option><option>Post-Journey</option></select></label><label>Touch Point<input id="r9Tp" value="${esc(x.tp||'')}"></label><label>Target (%)<input id="r9Plan" type="number" min="0" max="100" value="${Number(x.plan||0)}"></label><label>Realisasi (%)<input id="r9Real" type="number" min="0" max="100" value="${Number(x.real||0)}"></label><label class="span2">Keterangan<textarea id="r9Remark" rows="4">${esc(x.remark||'')}</textarea></label></div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px"><button type="button" class="btn secondary" id="r9Cancel">Batal</button><button class="btn" type="submit">Simpan Update</button></div></form>`;document.getElementById('r9Journey').value=journeysOf(x)[0]||'Pre-Flight';document.getElementById('r9Cancel').onclick=()=>b.style.display='none';document.getElementById('r9EditForm').onsubmit=e=>{e.preventDefault();const d=store(),t=(d.initiatives||[]).find(z=>String(z.id)===String(x.id))||(window.data?.initiatives||[]).find(z=>String(z.id)===String(x.id));if(!t)return;t.name=document.getElementById('r9Name').value.trim();t.pic=document.getElementById('r9Pic').value.trim();t.airport=document.getElementById('r9Airport').value.trim().toUpperCase();t.dueDate=document.getElementById('r9Due').value;t.journey=document.getElementById('r9Journey').value;t.journeyScopes=[t.journey];t.tp=document.getElementById('r9Tp').value.trim();t.touchpoints=[t.tp].filter(Boolean);t.plan=Number(document.getElementById('r9Plan').value||0);t.real=Number(document.getElementById('r9Real').value||0);t.remark=document.getElementById('r9Remark').value.trim();t.updatedAt=new Date().toISOString();if((d.initiatives||[]).includes(t))saveStore(d);else if(typeof window.save==='function')window.save();b.style.display='none';renderInitiatives()};b.style.display='flex'}
function del(x){portalConfirm(`Hapus Initiative \"${x.name||''}\"?`,'Hapus Initiative').then(ok=>{if(!ok)return;const d=store();d.initiatives=(d.initiatives||[]).filter(z=>String(z.id)!==String(x.id));saveStore(d);renderInitiatives()})}
function portalDialogShell(){let b=document.getElementById('r9PortalDialog');if(b)return b;document.body.insertAdjacentHTML('beforeend',`<div id="r9PortalDialog" class="r9-portal-dialog" aria-hidden="true"><div class="r9-dialog-card"><h3 id="r9DialogTitle">Informasi</h3><div id="r9DialogMessage"></div><div id="r9DialogInputWrap" style="display:none"><input id="r9DialogInput"></div><div class="r9-dialog-actions"><button type="button" id="r9DialogCancel">Batal</button><button type="button" id="r9DialogOk" class="primary">OK</button></div></div></div>`);return document.getElementById('r9PortalDialog')}
function portalAlert(msg,title='Informasi'){return new Promise(resolve=>{const b=portalDialogShell();document.getElementById('r9DialogTitle').textContent=title;document.getElementById('r9DialogMessage').textContent=String(msg??'');document.getElementById('r9DialogInputWrap').style.display='none';document.getElementById('r9DialogCancel').style.display='none';b.classList.add('show');b.setAttribute('aria-hidden','false');document.getElementById('r9DialogOk').onclick=()=>{b.classList.remove('show');resolve(true)}})}
function portalConfirm(msg,title='Konfirmasi'){return new Promise(resolve=>{const b=portalDialogShell();document.getElementById('r9DialogTitle').textContent=title;document.getElementById('r9DialogMessage').textContent=String(msg??'');document.getElementById('r9DialogInputWrap').style.display='none';document.getElementById('r9DialogCancel').style.display='inline-flex';b.classList.add('show');const done=v=>{b.classList.remove('show');resolve(v)};document.getElementById('r9DialogOk').onclick=()=>done(true);document.getElementById('r9DialogCancel').onclick=()=>done(false)})}
window.GEPortalDialog={alert:portalAlert,confirm:portalConfirm};
function bindInitiativeCapture(){document.addEventListener('click',e=>{const b=e.target.closest('[data-r9-action],[data-r8-action]');if(!b)return;const c=b.closest('[data-r9-id],[data-r8-id]');if(!c)return;e.preventDefault();e.stopPropagation();const id=c.dataset.r9Id||c.dataset.r8Id,x=findInit(id);if(!x)return;const a=b.dataset.r9Action||b.dataset.r8Action;if(a==='detail')detail(x);if(a==='update')update(x);if(a==='delete')del(x)},true)}
function stabilizeSidebar(){const body=document.body,side=document.querySelector('.side');if(!side)return;body.classList.add('final-shell-r5');let toggle=side.querySelector('.ge-sidebar-toggle');if(toggle){const clone=toggle.cloneNode(true);toggle.replaceWith(clone);toggle=clone;toggle.addEventListener('click',e=>{e.preventDefault();const c=!body.classList.contains('sidebar-collapsed');body.classList.toggle('sidebar-collapsed',c);try{e1ShellSet('GE_V257_SIDEBAR_COLLAPSED',c?'1':'0')}catch(_){};const a=toggle.querySelector('.toggle-arrow');if(a)a.textContent=c?'»':'«'});let saved=false;try{saved=e1ShellGet('GE_V257_SIDEBAR_COLLAPSED')==='1'}catch(_){}body.classList.toggle('sidebar-collapsed',saved);const a=toggle.querySelector('.toggle-arrow');if(a)a.textContent=saved?'»':'«'}
  const scrollKey='GE_V257_SIDEBAR_SCROLL', scroller=side.querySelector('.r8-nav-scroll')||side;
  try{scroller.scrollTop=Number(e1ShellGet(scrollKey)||0)}catch(_){}
  scroller.addEventListener('scroll',()=>{try{e1ShellSet(scrollKey,String(scroller.scrollTop))}catch(_){}},{passive:true});
  side.querySelectorAll('a[href]').forEach(a=>a.addEventListener('click',()=>{try{e1ShellSet(scrollKey,String(scroller.scrollTop));e1ShellSet('GE_V257_NAV_TARGET',a.getAttribute('href')||'')}catch(_){}}));
}
function replaceBrand(){document.querySelectorAll('.ge-brand-logos .garuda').forEach(img=>img.src='assets/garuda-horizontal-white.png')}
function enhanceTouchpointView(){const m=document.getElementById('tpViewModal'),photos=document.getElementById('tpViewPhotos');if(!m||!photos)return;let last='';const obs=new MutationObserver(()=>{if(!m.classList.contains('show'))return;const srcs=[...photos.querySelectorAll('img')].map(i=>i.src);const sig=srcs.join('|');if(!srcs.length||sig===last||photos.classList.contains('r9-carousel'))return;last=sig;let idx=0;photos.classList.add('r9-carousel');function paint(){photos.innerHTML=srcs.map((s,i)=>`<div class="r9-slide ${i===idx?'active':''}"><img src="${esc(s)}" alt="Foto Touch Point ${i+1}"></div>`).join('')+`<div class="r9-carousel-bar"><button type="button" id="r9PrevPhoto">‹ Sebelumnya</button><span class="r9-counter">Foto ${idx+1} dari ${srcs.length}</span><button type="button" id="r9NextPhoto">Berikutnya ›</button></div>`;document.getElementById('r9PrevPhoto').onclick=()=>{idx=(idx-1+srcs.length)%srcs.length;paint()};document.getElementById('r9NextPhoto').onclick=()=>{idx=(idx+1)%srcs.length;paint()}}paint()});obs.observe(m,{attributes:true,attributeFilter:['class'],subtree:true,childList:true})}
function init(){document.documentElement.classList.remove('r9-boot');document.documentElement.classList.add('r9-ready');document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||a.target==='_blank'||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;const h=a.getAttribute('href')||'';if(!h||h.startsWith('#')||h.startsWith('javascript:'))return;document.documentElement.classList.add('r9-leaving')},true);replaceBrand();stabilizeSidebar();enhanceTouchpointView();if(document.getElementById('initRows')){bindInitiativeCapture();setJourney(getJourney());setTimeout(renderInitiatives,80)}setTimeout(replaceBrand,120)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

/* R10 map pan: pan changes only the map view, never station coordinates. */
(function(){
'use strict';
function initMapPan(){
 const viewport=document.getElementById('mapViewport'),stage=document.getElementById('mapStage');
 if(!viewport||!stage||viewport.dataset.r10Pan)return;viewport.dataset.r10Pan='1';
 let drag=null,dx=0,dy=0;
 function base(){const t=getComputedStyle(stage).transform;if(!t||t==='none')return new DOMMatrix();try{return new DOMMatrix(t)}catch(_){return new DOMMatrix()}}
 viewport.addEventListener('pointerdown',e=>{
  if(e.button!==0||e.target.closest('.airport-marker,button,a,input,select,[role="button"]'))return;
  const m=base();dx=m.e;dy=m.f;drag={id:e.pointerId,x:e.clientX,y:e.clientY,a:m.a,d:m.d};viewport.setPointerCapture?.(e.pointerId);viewport.classList.add('r10-panning');e.preventDefault();
 });
 viewport.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;dx+=e.clientX-drag.x;dy+=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;const lx=Math.max(0,(drag.a-1)*viewport.clientWidth/2),ly=Math.max(0,(drag.d-1)*viewport.clientHeight/2);dx=Math.max(-lx,Math.min(lx,dx));dy=Math.max(-ly,Math.min(ly,dy));stage.style.transform=`matrix(${drag.a},0,0,${drag.d},${dx},${dy})`;e.preventDefault()});
 function stop(e){if(!drag||e.pointerId!==drag.id)return;drag=null;viewport.classList.remove('r10-panning')}
 viewport.addEventListener('pointerup',stop);viewport.addEventListener('pointercancel',stop);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(initMapPan,120));else setTimeout(initMapPan,120);
})();

/* R10.4 map click contract: normal marker click always opens detail.
   Coordinate relocation is available only from the explicit admin action. */
(function(){
'use strict';
function bindMarkerDetail(){
 const layer=document.getElementById('airportMarkerLayer');
 if(!layer||layer.dataset.r104Detail)return;
 layer.dataset.r104Detail='1';
 layer.addEventListener('click',function(e){
  const marker=e.target.closest('.airport-marker');
  if(!marker||document.getElementById('interactiveMap')?.classList.contains('map-relocate-mode-v217'))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(typeof window.geOpenAirportDetail217==='function')window.geOpenAirportDetail217(marker.dataset.code,marker);
 },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bindMarkerDetail,160));else setTimeout(bindMarkerDetail,160);
})();

/* app-shell.js */
(function(){
  'use strict';
  var KEY='GE_R10_SHELL_STATE';
  function read(){try{return JSON.parse(e1ShellGet(KEY)||'{}')}catch(e){return {}}}
  function write(patch){var s=Object.assign(read(),patch);e1ShellSet(KEY,JSON.stringify(s));return s}
  function sidebar(){return document.querySelector('.r8-nav-scroll,.ge-final-sidebar nav,.side nav,.side')}
  function ensureSidebar(){
    var side=document.querySelector('body.final-v257>.shell>.side');if(!side)return;
    var toggle=side.querySelector('.ge-sidebar-toggle'),wrap=side.querySelector('.r8-nav-scroll');
    if(!wrap){wrap=document.createElement('div');wrap.className='r8-nav-scroll';Array.from(side.children).filter(function(x){return x!==toggle}).forEach(function(x){wrap.appendChild(x)});side.insertBefore(wrap,toggle||null)}
    if(!toggle){toggle=document.createElement('button');toggle.type='button';toggle.className='ge-sidebar-toggle'}
    var clean=toggle.cloneNode(false);clean.type='button';clean.className='ge-sidebar-toggle';clean.innerHTML='<span class="toggle-arrow">«</span><span class="toggle-label">Collapse</span>';toggle.replaceWith(clean);side.appendChild(clean);
    var saved=false;try{saved=e1ShellGet('GE_V257_SIDEBAR_COLLAPSED')==='1'}catch(_){}
    document.body.classList.toggle('sidebar-collapsed',saved);clean.setAttribute('aria-expanded',saved?'false':'true');clean.querySelector('.toggle-arrow').textContent=saved?'»':'«';
    clean.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var on=!document.body.classList.contains('sidebar-collapsed');document.body.classList.toggle('sidebar-collapsed',on);clean.setAttribute('aria-expanded',on?'false':'true');clean.querySelector('.toggle-arrow').textContent=on?'»':'«';try{e1ShellSet('GE_V257_SIDEBAR_COLLAPSED',on?'1':'0')}catch(_){}});
  }
  function restoreSidebar(){
    var el=sidebar(),s=read();if(!el)return;
    if(Number.isFinite(s.sidebarScroll))el.scrollTop=s.sidebarScroll;
    requestAnimationFrame(function(){requestAnimationFrame(function(){if(Number.isFinite(s.sidebarScroll))el.scrollTop=s.sidebarScroll})});
    el.addEventListener('scroll',function(){write({sidebarScroll:el.scrollTop})},{passive:true});
  }
  function linkTransitions(){
    document.addEventListener('click',function(e){
      var a=e.target.closest('a[href]');if(!a)return;
      var href=a.getAttribute('href')||'';
      if(href.charAt(0)==='#'||/^https?:|^mailto:|^tel:|download/i.test(href)||e.ctrlKey||e.metaKey||e.shiftKey)return;
      var el=sidebar();if(el)write({sidebarScroll:el.scrollTop});
      document.body.classList.add('r10-leaving');
    },true);
  }
  function replaceNativePopup(){
    window.r10Toast=function(message,type){
      var old=document.querySelector('.r10-toast');if(old)old.remove();
      var t=document.createElement('div');t.className='r10-toast';t.setAttribute('role','status');
      t.style.cssText='position:fixed;right:18px;bottom:18px;max-width:360px;padding:12px 15px;border-radius:9px;background:'+(type==='error'?'#a83d3d':'#082d5c')+';color:#fff;box-shadow:0 12px 35px #001b4433;font:600 13px/1.45 Inter,Segoe UI,Arial';
      t.textContent=message;document.body.appendChild(t);setTimeout(function(){t.remove()},3600);
    };
  }
  function markAchievement(root){
    (root||document).querySelectorAll('[data-achievement]').forEach(function(el){
      var v=Number(el.getAttribute('data-achievement'));el.classList.remove('achievement-below','achievement-meet','achievement-exceed','achievement-unavailable');
      el.classList.add(!Number.isFinite(v)?'achievement-unavailable':v<100?'achievement-below':v===100?'achievement-meet':'achievement-exceed');
    });
  }
  function normalizeModalRoots(){
    var selectors=['.initiative-dialog','.modal-backdrop','.tp-modal-backdrop','.map-move-modal-backdrop','.r9-portal-dialog','.modal.open','dialog[open]'];
    var selector=selectors.join(',');
    function promote(modal){
      if(!modal||modal.nodeType!==1)return;
      modal.classList.add('ge-viewport-overlay');
      if(modal.parentElement!==document.body)document.body.appendChild(modal);
      modal.scrollTop=0;
      var card=modal.querySelector('.initiative-dialog-card,.modal-card,.tp-modal,.map-move-modal-card,.r8-modal-card,.r9-dialog-card,.box,[role="dialog"]');
      if(card)card.scrollTop=0;
    }
    function scan(root){
      if(root.matches&&root.matches(selector))promote(root);
      if(root.querySelectorAll)root.querySelectorAll(selector).forEach(promote);
    }
    scan(document);
    var observer=new MutationObserver(function(records){
      records.forEach(function(record){record.addedNodes.forEach(function(node){
        if(node.nodeType===1)scan(node);
      })});
    });
    observer.observe(document.body,{childList:true,subtree:true});
    document.addEventListener('click',function(){setTimeout(function(){scan(document)},0)},true);
  }
  function init(){document.body.classList.add('r10-ready');setTimeout(function(){document.body.classList.remove('r10-ready')},220);ensureSidebar();setTimeout(restoreSidebar,0);setTimeout(restoreSidebar,90);linkTransitions();replaceNativePopup();markAchievement();normalizeModalRoots();}
  window.GER10={readShellState:read,saveShellState:write,markAchievement:markAchievement};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

/* R10.13: canonical R10.3 Journey filter for both progress summary and list. */
(function(){
  'use strict';
  if(!document.getElementById('initiativeCharts')||!document.getElementById('initRows'))return;
  var selected='';
  function scopesOf(item){
    var scopes=Array.isArray(item&&item.journeyScopes)?item.journeyScopes.filter(Boolean):[];
    if(scopes.length)return scopes;
    if(item&&item.journey)return [item.journey];
    try{return item&&item.tp&&typeof getJourney==='function'?[getJourney(item.tp)]:[]}catch(_){return []}
  }
  function rows(){
    var all=[];
    try{all=(data.initiatives||[]).slice()}catch(_){try{all=(GEStore.get().initiatives||[]).slice()}catch(__){}}
    if(selected)all=all.filter(function(item){return scopesOf(item).indexOf(selected)!==-1});
    var q=(document.getElementById('q')&&document.getElementById('q').value||'').trim().toLowerCase();
    var tp=document.getElementById('ft')&&document.getElementById('ft').value||'';
    var status=document.getElementById('fs')&&document.getElementById('fs').value||'';
    return all.filter(function(item){
      var tps=Array.isArray(item.touchpoints)&&item.touchpoints.length?item.touchpoints:[item.tp].filter(Boolean);
      var value='';try{value=achievement(item.plan,item.real)}catch(_){}
      var text=[item.name,item.airport,item.pic].concat(tps).join(' ').toLowerCase();
      return (!q||text.indexOf(q)!==-1)&&(!tp||tps.indexOf(tp)!==-1)&&(!status||value===status);
    });
  }
  function render(){
    var filtered=rows(),box=document.getElementById('initRows');
    if(typeof refreshInitiativeFilters==='function')refreshInitiativeFilters();
    if(box){
      var visible=typeof geInitiativeScopedV224==='function'?filtered.filter(geInitiativeScopedV224):filtered;
      box.innerHTML=visible.length&&typeof geInitiativeCardV251==='function'?visible.map(geInitiativeCardV251).join(''):'<div class="initiative-empty-v246">Belum ada inisiatif pada filter ini.</div>';
    }
    if(typeof renderInitiativeCharts==='function')renderInitiativeCharts(filtered);
    document.querySelectorAll('.journey-tab').forEach(function(tab){tab.classList.toggle('active',(tab.dataset.journey||'')===selected)});
  }
  window.setJourneyFilter=function(journey){
    selected=journey||'';
    try{activeJourney=selected}catch(_){}
    render();
  };
  window.renderInitiatives=render;
  document.querySelectorAll('.journey-tab').forEach(function(tab){
    tab.onclick=function(event){event.preventDefault();window.setJourneyFilter(tab.dataset.journey||'')};
  });
  ['q','ft','fs'].forEach(function(id){var field=document.getElementById(id);if(field){field.oninput=render;field.onchange=render}});
  render();
})();
