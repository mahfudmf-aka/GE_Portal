from pathlib import Path

def text(p): return Path(p).read_text(encoding='utf-8')

p=Path('app.html'); s=text(p)
s=s.replace(
'<script src="assets/clean-page-registry.js?v=clean01"></script></head><body id="top" class="e1-page"><header class="top"></header>',
'<script src="assets/clean-page-registry.js?v=clean01"></script></head><body id="top" class="e1-page final-v257 final-shell-r5"><header class="top"></header>',1)
s=s.replace(
'<script src="assets/clean-route-adapter.js?v=clean01"></script><script>',
'<script src="assets/clean-route-adapter.js?v=clean01"></script><script src="assets/edition1-canonical-shell.js?v=p40-clean-shell"></script><script>',1)
old='for(const item of def.scripts||[]){ if(item.src){await loadSrc(item.src);} else if(item.code){(0,eval)(item.code);} }'
new='for(const item of def.scripts||[]){ if(item.src){const src=String(item.src);if(/(?:^|\/)portal-shell\.js(?:\?|$)/i.test(src)||/(?:^|\/)edition1-portal-shell-entry\.js(?:\?|$)/i.test(src)||/(?:^|\/)edition1-canonical-shell\.js(?:\?|$)/i.test(src))continue;await loadSrc(src);} else if(item.code){(0,eval)(item.code);} }'
if old not in s: raise SystemExit('app script loop anchor not found')
s=s.replace(old,new,1); p.write_text(s,encoding='utf-8')

p=Path('assets/clean-page-registry.js'); s=text(p)
old='"index": {"title": "Ground Experience Portal", "html": "",'
new='"index": {"title": "Ground Experience Portal", "html": "<div id=\\"dashboardRoot\\"></div>",'
if old not in s: raise SystemExit('index anchor not found')
s=s.replace(old,new,1); p.write_text(s,encoding='utf-8')

p=Path('assets/edition1-canonical-shell.js'); s=text(p)
old="const path=()=>location.pathname.split('/').pop()||'';"
new="const path=()=>{const q=new URLSearchParams(location.search);const p=q.get('page');if(p)return p==='index'?'index.html':(p+'.html');return location.pathname.split('/').pop()||''};"
if old not in s: raise SystemExit('shell path anchor not found')
s=s.replace(old,new,1); p.write_text(s,encoding='utf-8')
print('patch script ready')
