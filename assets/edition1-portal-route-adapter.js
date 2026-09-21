/* Edition 1 route adapter — reuses the exact locked portal-shell.js.
 * It changes only Edition 1 destination URLs after portal-shell has rendered.
 * It does not create or style a second sidebar/header.
 */
(function(){
'use strict';
const MAP={
  'inisiatif.html':'e1-inisiatif.html',
  'standar.html':'e1-standar.html',
  'service-planning.html':'e1-service-planning.html',
  'planning-documents.html':'e1-planning-documents.html',
  'data.html':'e1-data.html',
  'admin.html':'e1-admin.html',
  'berita.html':'e1-berita.html',
  'kontak.html':'e1-kontak.html',
  'lounge-list.html':'e1-lounge-list.html',
  'branch-office-planning.html':'e1-branch-office-planning.html',
  'gaso-planning.html':'e1-gaso-planning.html'
};
const current=()=>location.pathname.split('/').pop()||'index.html';
function remap(){
  document.querySelectorAll('body > .shell > .side a.ge-nav-link[href]').forEach(a=>{
    const raw=(a.getAttribute('href')||'').split('?')[0].split('#')[0];
    const target=MAP[raw]||raw;
    if(MAP[raw])a.setAttribute('href',target);
    a.classList.toggle('active',target===current());
  });
  const side=document.querySelector('body > .shell > .side');
  const section=[...side?.querySelectorAll('.ge-nav-section')||[]].find(x=>String(x.textContent||'').trim()==='IMPROVEMENT & PLANNING');
  if(section && !side.querySelector('[data-e1-calendar-nav]')){
    const opportunity=[...side.querySelectorAll('.ge-nav-link')].find(a=>(a.getAttribute('href')||'')==='improvement-intake.html');
    if(opportunity){
      const a=document.createElement('a');
      a.className='ge-nav-link';
      a.href='e1-calendar.html';
      a.title='Calendar & Project Tracking';
      a.dataset.e1CalendarNav='1';
      a.innerHTML='<span class="ni" aria-hidden="true"><svg viewBox="0 0 20 20"><rect x="3" y="4.5" width="14" height="12.5" rx="2"/><path d="M6 2.5v4M14 2.5v4M3 8h14M6 11h2M10 11h2M6 14h2M10 14h2"/></svg></span><span>Calendar &amp; Project Tracking</span>';
      opportunity.insertAdjacentElement('afterend',a);
    }
  }
  side?.querySelectorAll('.ge-nav-link[href]').forEach(a=>a.classList.toggle('active',(a.getAttribute('href')||'').split('?')[0]===current()));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(remap,0));else setTimeout(remap,0);
})();
