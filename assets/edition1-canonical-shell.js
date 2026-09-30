/* P40 Edition 1 canonical shell extension.
 * Uses the exact final-v257 portal shell geometry/classes from portal.css.
 * This is intentionally separate from the P38-locked portal-shell.js.
 */
(function(){
'use strict';
const path=()=>location.pathname.split('/').pop()||'';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ICON={
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
const item=(href,label,icon)=>`<a class="ge-nav-link ${path()===href?'active':''}" href="${href}" title="${esc(label)}"><span class="ni" aria-hidden="true"><svg viewBox="0 0 20 20">${ICON[icon]||ICON.standard}</svg></span><span>${esc(label)}</span></a>`;
const group=(title,items)=>`<div class="ge-nav-section">${title}</div>${items.join('')}`;
function session(){try{return window.gxGetSession?.()||window.GX_CURRENT_USER||{}}catch(e){return{}}}
function nav(){return [
 group('MAIN',[item('index.html','Beranda','home')]),
 group('EXPERIENCE & INSIGHT',[item('network-stations.html','Network & Station','network'),item('station-360.html','Station 360','station'),item('airport-experience-map.html','Airport Experience Map','network'),item('readiness.html','Readiness','standard'),item('customer-experience.html','Customer Experience','cx')]),
 group('IMPROVEMENT & PLANNING',[item('e1-inisiatif.html','Initiative & Improvement','initiative'),item('improvement-intake.html','Improvement Opportunity','opportunity'),item('e1-calendar.html','Calendar & Project Tracking','calendar'),item('planning-workspace.html','Planning Workspace','document')]),
 group('BUDGET & COST',[item('budget-cost.html','Budget & Cost','data'),item('cost-intelligence.html','Cost Intelligence','data')]),
 group('DATA & ADMINISTRATION',[item('e1-data.html','Data Management','data'),item('master-data.html','Master Data','data'),item('e1-admin.html','User & Access','user')]),
 group('SUPPORT',[item('e1-berita.html','Berita & Informasi','document'),item('e1-kontak.html','Contact Support','support')])
 ].join('');}
function build(){
 const top=document.querySelector('body>.top'),shell=document.querySelector('body>.shell'),side=shell?.querySelector(':scope>.side');if(!top||!shell||!side)return;
 document.body.classList.add('final-v257','final-shell-r5');
 const s=session(),initials=String(s.name||s.username||s.email||'GE').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
 const role=String(s.role||s.accessLevel||'User');
 top.innerHTML=`<button id="mobileNavTriggerV233" class="mobile-nav-trigger-v233 ge-iconbtn" type="button" aria-label="Menu">☰</button><div class="ge-brand-logos"><img class="garuda" src="assets/garuda-horizontal-white.png" alt="Garuda Indonesia"><img class="danantara" src="assets/danantara-white-user.png" alt="Danantara Indonesia"></div><div class="ge-title"><strong>GROUND EXPERIENCE PORTAL</strong><span>Ground Experience • Service Experience Portal</span></div><div class="ge-session"><label class="filter"><span>Period</span><select id="gePeriodSelect" aria-label="Period"><option>${new Date().getFullYear()}</option></select></label><button class="ge-top-action ge-notify" id="geNotifyBtn" type="button" title="Notifications" aria-label="Notifications"><span class="bell-shape"></span><b class="ge-notify-badge" id="geNotifyBadge" hidden></b></button><a class="ge-top-action ge-help" href="e1-kontak.html" title="Help" aria-label="Help">?</a><button class="ge-user-menu" id="geUserMenuBtn" type="button" aria-expanded="false"><span class="avatar">${esc(initials)}</span><span class="who"><b>${esc(s.name||s.username||s.email||'User')}</b><span>${esc(role)}</span></span></button><div class="ge-user-pop" id="geUserPop"><a href="profile.html">Profile</a><button type="button" id="geLogoutBtn">Sign Out</button></div></div>`;
 side.innerHTML=nav()+`<div class="ge-nav-divider"></div><div style="padding:6px 8px;color:#7f9bbd;font-size:8px;line-height:1.35">Sumber data bisnis Edition 1: Firebase / Firestore melalui authenticated Netlify Function.</div>`;
 const toggle=()=>document.body.classList.toggle('nav-open');document.getElementById('mobileNavTriggerV233')?.addEventListener('click',toggle);
 document.getElementById('geLogoutBtn')?.addEventListener('click',()=>window.gxLogout?.());
 const userBtn=document.getElementById('geUserMenuBtn'),pop=document.getElementById('geUserPop');userBtn?.addEventListener('click',e=>{e.stopPropagation();pop?.classList.toggle('open')});document.addEventListener('click',()=>pop?.classList.remove('open'),{capture:true});
 const period=document.getElementById('gePeriodSelect');period?.addEventListener('change',()=>document.dispatchEvent(new CustomEvent('ge-dashboard-period-change')));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
