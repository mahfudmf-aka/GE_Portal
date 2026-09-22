from pathlib import Path
import sys
ROOT=Path(sys.argv[1]) if len(sys.argv)>1 else Path(".")
changes={
"app.html":[
("<script src=\"assets/clean-page-registry.js?v=clean01\"></script></head><body id=\"top\" class=\"e1-page\"><header class=\"top\"></header>",
 "<script src=\"assets/clean-page-registry.js?v=clean01\"></script><script src=\"assets/portal-shell.js?v=p40-clean-runtime\"></script></head><body id=\"top\" class=\"e1-page\"><header class=\"top\"></header>"),
("document.title=def.title+' — Ground Experience Portal'; outlet.innerHTML=def.html;",
 "document.title=def.title+' — Ground Experience Portal'; outlet.innerHTML=def.html || (route==='index' ? '<div id=\"dashboardRoot\"></div>' : '<div class=\"clean-page-empty\"></div>');"),
("function loadSrc(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Gagal memuat '+src));document.body.appendChild(s);});}",
 "function loadSrc(src){return new Promise((resolve,reject)=>{const abs=new URL(src,location.href).href;const existing=[...document.scripts].find(x=>x.src===abs);if(existing){resolve();return;}const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Gagal memuat '+src));document.body.appendChild(s);});}")
],
"assets/portal-shell.js":[
("const path=()=>location.pathname.split('/').pop()||'index.html';",
"""const path=()=>{
  const pathname=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const clean=new URLSearchParams(location.search).get('page');
  if(!clean||pathname!=='app.html')return pathname;
  const alias=(window.P40_CLEAN_ALIASES||{})[String(clean).toLowerCase()]||String(clean).toLowerCase();
  const route=alias.split('?')[0];
  return route.endsWith('.html')?route:(route||'index')+'.html';
};"""),
("const finalUserPages=new Set(['index.html'",
 "const finalUserPages=new Set(['index.html','airport-experience.html'")
],
"assets/edition1-page-boot.js":[
("const page=(location.pathname.split('/').pop()||'').toLowerCase();",
"""const cleanRoute=(new URLSearchParams(location.search).get('page')||'').toLowerCase();
const cleanPageMap={
  'standar':'e1-standar.html',
  'inisiatif':'e1-inisiatif.html',
  'service-planning':'e1-service-planning.html',
  'calendar':'e1-calendar.html',
  'planning-documents':'e1-planning-documents.html',
  'data':'e1-data.html',
  'admin':'e1-admin.html',
  'berita':'e1-berita.html',
  'kontak':'e1-kontak.html',
  'lounge-list':'e1-lounge-list.html',
  'branch-office-planning':'e1-branch-office-planning.html',
  'gaso-planning':'e1-gaso-planning.html'
};
const page=(location.pathname.split('/').pop()||'').toLowerCase()==='app.html'
  ? (cleanPageMap[cleanRoute]||'')
  : (location.pathname.split('/').pop()||'').toLowerCase();"""),
("const target=typeof gxDefaultPage==='function'?gxDefaultPage():'index.html';if(target!==page)location.replace(target);",
 "const target=typeof gxDefaultPage==='function'?gxDefaultPage():'app.html?page=index';if(target!==page)location.replace(window.p40CleanRoute?window.p40CleanRoute(target):target);")
],
"assets/clean-route-adapter.js":[
(route_old,route_new)
],
"assets/clean-page-registry.js":[
(reg_old,reg_new)
]
}
for rel,repls in changes.items():
    p=ROOT/rel
    s=p.read_text(encoding="utf-8")
    original=s
    for old,new in repls:
        n=s.count(old)
        if n!=1:
            raise SystemExit(f"{rel}: expected exactly 1 anchor, found {n}: {old[:120]}")
        s=s.replace(old,new,1)
    p.write_text(s,encoding="utf-8")
    print("patched",rel)
