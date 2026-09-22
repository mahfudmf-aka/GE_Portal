/* P40 Clean Draft — canonical Edition 1 shell runtime.
 * Active Clean runtime only. The legacy portal-shell / edition1-portal-shell-entry
 * must not be loaded on app.html.
 */
(function(){
'use strict';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const currentRoute=()=>{
  const q=new URLSearchParams(location.search);
  return q.get('page')||'index';
};
const hrefFor=(route,extra='')=>{
  const p=new URLSearchParams(extra);
  p.set('page',route);
  return 'app.html?'+p.toString();
};
const icon={
  home:'<path d="M3 10.5 10 4l7 6.5V18H6v-7.5"/><path d="M8.5 18v-5h3v5"/>',
  cx:'<circle cx="10" cy="10" r="7"/><path d="M7 11c1.8 2 4.2 2 6 0"/><path d="M7.5 8h.01M12.5 8h.01"/>',
  network:'<path d="M2.5 11h15M10 3.5v13M4.5 6.5h11M4.5 15h11"/><circle cx="10" cy="10" r="7.5"/>',
  station:'<path d="M4 17V7l6-4 6 4v10M7 17v-4h6v4M7 9h.01M10 9h.01M13 9h.01"/>',
  initiative:'<circle cx="10" cy="10" r="3"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4"/>',
  opportunity:'<path d="M10 2.5a5 5 0 0 0-3 9v2h6v-2a5 5 0 0 0-3-9Z"/><path d="M8 16h4M8.5 18h3"/>',
  calendar:'<rect x="3" y="4.5" width="14" height="12.5" rx="2"/><path d="M6 2.5v4M14 2.5v4M3 8h14M6 11h2M10 11h2M6 14h2M10 14h2"/>',
  standard:'<path d="M4 5h12M4 10h12M4 15h12"/>',
  document:'<path d="M5 2.5h7l3 3V17H5Z"/><path d="M12 2.5V6h3M7.5 10h5M7.5 13h5"/>',
  data:'<ellipse cx="10" cy="5" rx="6" ry="2.5"/><path d="M4 5v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V5M4 10v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5"/>',
  user:'<circle cx="10" cy="7" r="3"/><path d="M4.5 17c.5-3 2.3-4.5 5.5-4.5s5 1.5 5.5 4.5"/>',
  support:'<path d="M4 10a6 6 0 0 1 12 0v5M4 11H2.5v4H6v-4H4M16 11h1.5v4H14v-4h2M14 17h-3"/>'
};
const item=(route,label,ico,permission)=>{
  const active=currentRoute()===route;
  return `<a class="e1-nav-link${active?' active':''}" href="${hrefFor(route)}" data-permission="${permission||''}" title="${esc(label)}"><span class="ni" aria-hidden="true"><svg viewBox="0 0 20 20">${icon[ico]||icon.standard}</svg></span><span>${esc(label)}</span></a>`;
};
const group=(title,html)=>`<div class="e1-nav-section">${title}</div>${html}`;

function session(){
  try{return window.gxGetSession?.()||window.GX_CURRENT_USER||{}}
  catch(e){return{}}
}
function initials(s){
  return String(s?.name||s?.username||s?.email||'GE').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
}
function nav(){
  return [
    group('MAIN',item('index','Dashboard','home','home')),
    group('EXPERIENCE & INSIGHT',
      item('customer-experience','Customer Experience','cx','services')+
      item('airport-experience','Airport Experience Network','network','services')+
      item('station-360','Station 360','station','services')+
      item('readiness','Readiness Assessment','standard','services')+
      item('service-capability','Capability & Standards','standard','services')),
    group('IMPROVEMENT & PLANNING',
      item('improvement-intake','Improvement Opportunity','opportunity','initiatives')+
      item('inisiatif','Initiative & Improvement','initiative','initiatives')+
      item('calendar','Calendar & Project Tracking','calendar','initiatives')+
      item('service-planning','Planning Overview','standard','planning')+
      item('planning-workspace','Planning Workspace','document','planning')+
      item('lounge-list','Lounge / Tenant Planning','data','planning')+
      item('branch-office-planning','Branch Office Planning','station','planning')+
      item('gaso-planning','GASO Planning','station','planning')+
      item('planning-documents','Planning Documents','document','planning')),
    group('BUDGET & COST',
      item('budget-cost','Budget & Cost','data','initiatives')+
      item('cost-intelligence','Cost Intelligence','data','initiatives')),
    group('DATA & ADMINISTRATION',
      item('data','Data Management','data','data')+
      item('master-data','Master Data','data','data')+
      item('admin','User & Access','user','admin')+
      item('portal-management','Portal Management','user','admin')+
      item('audit-log','Audit Log','standard','admin')),
    group('SUPPORT',
      item('berita','Berita & Informasi','document','news')+
      item('kontak','Contact Support','support','contact'))
  ].join('');
}

function build(){
  document.body.classList.add('e1-modern');
  const top=document.querySelector('body>.e1-top');
  const shell=document.querySelector('body>.shell');
  const side=shell?.querySelector(':scope>.side');
  if(!top||!shell||!side)return;

  const s=session();
  top.innerHTML=`
    <button id="cleanMobileNav" class="e1-mobile" type="button" aria-label="Menu">☰</button>
    <div class="e1-brand-logos">
      <img class="garuda" src="assets/garuda-horizontal-white.png" alt="Garuda Indonesia">
      <img class="danantara" src="assets/danantara-white-user.png" alt="Danantara Indonesia">
    </div>
    <div class="e1-title"><strong>GROUND EXPERIENCE PORTAL</strong><span>Ground Experience • Service Experience Portal</span></div>
    <div class="e1-session">
      <label class="period"><span>Period</span><select id="cleanPeriodSelect" aria-label="Period"><option>${new Date().getFullYear()}</option></select></label>
      <button class="clean-top-action" id="cleanNotifyBtn" type="button" aria-label="Notifications" title="Notifications">◌<b id="cleanNotifyBadge" hidden></b></button>
      <a class="clean-top-action" href="${hrefFor('kontak')}" aria-label="Help" title="Help">?</a>
      <button class="clean-user-menu" id="cleanUserBtn" type="button" aria-expanded="false">
        <span class="avatar">${esc(initials(s))}</span>
        <span class="who"><b>${esc(s.name||s.username||s.email||'User')}</b><span>${esc(s.role||s.accessLevel||'User')}</span></span>
      </button>
      <div class="clean-user-pop" id="cleanUserPop">
        <a href="${hrefFor('kontak')}">Profile / Support</a>
        <button type="button" id="cleanLogoutBtn">Sign Out</button>
      </div>
      <div class="clean-notify-pop" id="cleanNotifyPop"><b>Notifications</b><button type="button" id="cleanNotifyClose">×</button><div id="cleanNotifyList"></div></div>
    </div>`;

  side.innerHTML=nav()+`<div class="e1-nav-divider"></div><div class="e1-nav-note">Business data: Firebase / Firestore melalui authenticated runtime.</div>`;

  // Existing permission engine remains authoritative.
  if(typeof window.gxApplyNavigation==='function')window.gxApplyNavigation();

  const cleanLinks=[...side.querySelectorAll('.e1-nav-link')];
  cleanLinks.forEach(a=>{
    const p=a.dataset.permission;
    if(p && typeof window.gxHasPermission==='function' && !window.gxHasPermission(p))a.style.display='none';
  });
  side.querySelectorAll('.e1-nav-section').forEach(sec=>{
    let n=sec.nextElementSibling,visible=false;
    while(n && !n.classList.contains('e1-nav-section')){
      if(n.matches?.('.e1-nav-link') && getComputedStyle(n).display!=='none')visible=true;
      n=n.nextElementSibling;
    }
    sec.style.display=visible?'':'none';
  });

  const mobile=document.getElementById('cleanMobileNav');
  mobile?.addEventListener('click',()=>side.classList.toggle('e1-open'));

  const userBtn=document.getElementById('cleanUserBtn'),pop=document.getElementById('cleanUserPop');
  userBtn?.addEventListener('click',e=>{e.stopPropagation();pop?.classList.toggle('open');userBtn.setAttribute('aria-expanded',pop?.classList.contains('open')?'true':'false')});
  document.addEventListener('click',()=>pop?.classList.remove('open'),{capture:true});
  document.getElementById('cleanLogoutBtn')?.addEventListener('click',()=>window.gxLogout?.());

  const np=document.getElementById('cleanNotifyPop'),nb=document.getElementById('cleanNotifyBtn');
  nb?.addEventListener('click',e=>{e.stopPropagation();np?.classList.toggle('open');renderNotifications()});
  document.getElementById('cleanNotifyClose')?.addEventListener('click',()=>np?.classList.remove('open'));

  function renderNotifications(){
    const list=document.getElementById('cleanNotifyList');
    if(!list)return;
    try{
      const rows=(window.GEStore?.get?.().inbox||[]).slice(0,8);
      list.innerHTML=rows.length?rows.map(x=>`<div><b>${esc(x.subject||x.title||x.type||'Notification')}</b><span>${esc(x.message||x.detail||'')}</span></div>`).join(''):'<span class="clean-empty">No notifications available.</span>';
      const unread=rows.filter(x=>String(x.status||'').toUpperCase()!=='READ').length;
      const badge=document.getElementById('cleanNotifyBadge');
      if(badge){badge.textContent=unread>99?'99+':String(unread);badge.hidden=!unread}
    }catch(e){list.innerHTML='<span class="clean-empty">Notifications unavailable.</span>'}
  }
  renderNotifications();

  const period=document.getElementById('cleanPeriodSelect');
  period?.addEventListener('change',()=>document.dispatchEvent(new CustomEvent('ge-dashboard-period-change',{detail:{year:period.value}})));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
