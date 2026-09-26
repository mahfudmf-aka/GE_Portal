from pathlib import Path

def replace_once(path, old, new):
    p=Path(path)
    s=p.read_text(encoding="utf-8")
    if old not in s:
        raise SystemExit(f"ANCHOR NOT FOUND: {path}: {old}")
    p.write_text(s.replace(old,new,1), encoding="utf-8")

replace_once(
    "app.html",
    '<script src="assets/clean-page-registry.js?v=clean01"></script>',
    '<script src="assets/edition1-canonical-shell.js?v=p40-route-contract"></script><script src="assets/clean-page-registry.js?v=clean01"></script>'
)

replace_once(
    "assets/edition1-canonical-shell.js",
    "const path=()=>location.pathname.split('/').pop()||'';",
    """const ROUTE_TO_CANONICAL={
  'index.html':'index',
  'inisiatif.html':'inisiatif',
  'e1-inisiatif.html':'inisiatif',
  'calendar.html':'calendar',
  'e1-calendar.html':'calendar',
  'network-stations.html':'airport-experience',
  'airport-experience-map.html':'airport-experience',
  'map.html':'airport-experience',
  'e1-admin.html':'admin',
  'admin.html':'admin'
};
const path=()=>{
  const file=location.pathname.split('/').pop()||'';
  const q=new URLSearchParams(location.search).get('page');
  return q || ROUTE_TO_CANONICAL[file] || file;
};"""
)

reg=Path("assets/clean-page-registry.js")
s=reg.read_text(encoding="utf-8")
old='"index": {"title": "Ground Experience Portal", "html": "", "scripts": ['
new='"index": {"title": "Ground Experience Portal", "html": "<div id=\\"dashboardRoot\\"></div>", "scripts": ['
if old not in s:
    raise SystemExit("ANCHOR NOT FOUND: index registry entry")
s=s.replace(old,new,1)

start=s.find(new)
end=s.find('"source": ["index.html"]',start)
if start < 0 or end < 0:
    raise SystemExit("INDEX ROUTE BOUNDARY NOT FOUND")
block=s[start:end]
old_script='{"src": "assets/portal-shell.js?v=10.5"},'
if old_script not in block:
    raise SystemExit("INDEX portal-shell entry not found")
block=block.replace(old_script,"",1)
s=s[:start]+block+s[end:]
reg.write_text(s,encoding="utf-8")

print("Applied 3 surgical changes.")
