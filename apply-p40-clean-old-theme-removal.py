from pathlib import Path
import re

ROOT=Path('.')

def req(path, needle):
    p=ROOT/path
    s=p.read_text(encoding='utf-8')
    if needle not in s:
        raise SystemExit(f'ANCHOR NOT FOUND: {path}: {needle}')
    return p,s

# 1) app.html: replace only the shell mount and bootstrap references.
p,s=req(Path('app.html'),'header class="top"')
s=s.replace('<header class="top"></header><div class="shell"><aside class="side"></aside><main class="main" id="cleanPageOutlet">',
            '<header class="e1-top"></header><div class="shell"><aside class="side"></aside><main class="main" id="cleanPageOutlet">',1)
if 'assets/clean-shell-runtime.js?v=p40-clean-shell' not in s:
    s=s.replace('<script src="assets/clean-route-adapter.js?v=clean01"></script>','<script src="assets/auth.js?v=p40-clean-shell"></script><script src="assets/clean-route-adapter.js?v=clean01"></script>'
                '<script src="assets/clean-route-adapter.js?v=clean01"></script><script src="assets/clean-shell-runtime.js?v=p40-clean-shell"></script>',1)

# 2) Prevent legacy shell scripts from being executed by the Clean page registry.
needle="for(const item of def.scripts||[]){ if(item.src){await loadSrc(item.src);} else if(item.code){(0,eval)(item.code);} }"
replacement="""for(const item of def.scripts||[]){
    if(item.src){
      const src=String(item.src);
      if(/(?:^|\\/)portal-shell\\.js(?:\\?|$)/i.test(src) ||
         /(?:^|\\/)edition1-portal-shell-entry\\.js(?:\\?|$)/i.test(src) ||
         /(?:^|\\/)edition1-canonical-shell\\.js(?:\\?|$)/i.test(src)) continue;
      await loadSrc(src);
    } else if(item.code){(0,eval)(item.code);}
  }"""
if needle not in s: raise SystemExit('app.html script-loop anchor not found')
s=s.replace(needle,replacement,1)
p.write_text(s,encoding='utf-8')

# 3) clean-shell.css: add controls without changing existing page styles.
p=ROOT/'assets/clean-shell.css'
c=p.read_text(encoding='utf-8')
if '.clean-top-action' not in c:
    p.write_text(c+'\\n'+Path('assets/clean-shell-runtime.css').read_text(encoding='utf-8'),encoding='utf-8')

# 4) Edition1 page boot: make the query route visible to the existing E1 boot.
p,s=req(Path('assets/edition1-page-boot.js'),'const page=(location.pathname.split(\'/\').pop()||\'\').toLowerCase();')
old="const page=(location.pathname.split('/').pop()||'').toLowerCase();"
new="""const CLEAN_TO_E1={
  index:'', 'inisiatif':'e1-inisiatif.html','calendar':'e1-calendar.html',
  'service-planning':'e1-service-planning.html','planning-documents':'e1-planning-documents.html',
  data:'e1-data.html',admin:'e1-admin.html',berita:'e1-berita.html',kontak:'e1-kontak.html',
  'lounge-list':'e1-lounge-list.html','branch-office-planning':'e1-branch-office-planning.html',
  'gaso-planning':'e1-gaso-planning.html','standar':'e1-standar.html'
};
const rawPath=(location.pathname.split('/').pop()||'').toLowerCase();
const cleanRoute=new URLSearchParams(location.search).get('page');
const page=CLEAN_TO_E1[cleanRoute]||rawPath;"""
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

print('P40 Clean old-theme removal patch applied to local checkout.')
