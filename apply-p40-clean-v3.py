#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path.cwd()

def read(rel):
    p = ROOT / rel
    if not p.exists():
        raise SystemExit(f"[FAIL] Missing file: {rel}")
    return p.read_text(encoding="utf-8")

def write(rel, old, new, expected=1):
    p = ROOT / rel
    s = read(rel)
    count = s.count(old)
    if count != expected:
        raise SystemExit(
            f"[FAIL] {rel}: expected {expected} exact anchor occurrence(s), found {count}. "
            "No changes were written."
        )
    p.write_text(s.replace(old, new), encoding="utf-8")

# 1) app.html: canonical shell is a real bootstrap dependency.
write(
    "app.html",
    '<script src="assets/clean-page-registry.js?v=clean01"></script>',
    '<script src="assets/edition1-canonical-shell.js?v=p40-clean-v3"></script>'
    '<script src="assets/clean-page-registry.js?v=clean01"></script>',
)

# 2) Dashboard must have its mount point.
write(
    "assets/clean-page-registry.js",
    '"index": {"title": "Ground Experience Portal", "html": "",',
    '"index": {"title": "Ground Experience Portal", "html": "<div id=\\"dashboardRoot\\"></div>",',
)

# 3) Stop legacy shell runtimes from being injected by Clean Draft.
reg = read("assets/clean-page-registry.js")
before = reg
reg = re.sub(r'\s*,?\s*\{"src":\s*"assets/portal-shell\.js\?v=[^"]+"\}', '', reg)
reg = re.sub(r'\s*,?\s*\{"src":\s*"assets/edition1-portal-shell-entry\.js\?v=[^"]+"\}', '', reg)
reg = re.sub(r'\s*,?\s*\{"src":\s*"assets/edition1-portal-route-adapter\.js\?v=[^"]+"\}', '', reg)
if reg == before:
    raise SystemExit("[FAIL] clean-page-registry.js: no legacy shell entries found.")
if "assets/portal-shell.js" in reg or "assets/edition1-portal-shell-entry.js" in reg:
    raise SystemExit("[FAIL] Legacy shell reference still remains after targeted removal.")
(ROOT / "assets/clean-page-registry.js").write_text(reg, encoding="utf-8")

# 4) Known programmatic navigation cannot be fixed by click interception.
write(
    "assets/clean-page-registry.js",
    "location.href='station-360.html?stationId=${encodeURIComponent(x.stationId)}'",
    "location.href='app.html?page=station-360&stationId=${encodeURIComponent(x.stationId)}'",
)
write(
    "assets/clean-page-registry.js",
    "location.replace('index.html#service-experience')",
    "location.replace('app.html?page=index#service-experience')",
)

# 5) Canonical shell route identity must understand Clean query routes.
shell = read("assets/edition1-canonical-shell.js")
old = "const path=()=>location.pathname.split('/').pop()||'';"
new = """const ROUTE_TO_CANONICAL={
 'index.html':'index',
 'inisiatif.html':'inisiatif',
 'e1-inisiatif.html':'inisiatif',
 'calendar.html':'calendar',
 'e1-calendar.html':'calendar',
 'network-stations.html':'airport-experience',
 'airport-experience-map.html':'airport-experience',
 'map.html':'airport-experience',
 'e1-admin.html':'admin',
 'admin.html':'admin',
 'station-360.html':'station-360'
};
const path=()=>{
 const file=location.pathname.split('/').pop()||'';
 const q=new URLSearchParams(location.search).get('page');
 return q || ROUTE_TO_CANONICAL[file] || file;
};"""
if shell.count(old) != 1:
    raise SystemExit("[FAIL] edition1-canonical-shell.js: path anchor mismatch. No changes were written.")
(ROOT / "assets/edition1-canonical-shell.js").write_text(shell.replace(old, new), encoding="utf-8")

# 6) Edition 1 page boot must resolve app.html?page=... routes.
boot = read("assets/edition1-page-boot.js")
old = "const page=(location.pathname.split('/').pop()||'').toLowerCase();"
new = """const CLEAN_TO_E1={
 'index':'index.html',
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
const file=(location.pathname.split('/').pop()||'').toLowerCase();
const queryRoute=new URLSearchParams(location.search).get('page');
const page=CLEAN_TO_E1[queryRoute]||file;"""
if boot.count(old) != 1:
    raise SystemExit("[FAIL] edition1-page-boot.js: page anchor mismatch. No changes were written.")
(ROOT / "assets/edition1-page-boot.js").write_text(boot.replace(old, new), encoding="utf-8")

# 7) Preserve hash fragments when normalizing links.
adapter = read("assets/clean-route-adapter.js")
old = "var m=href.match(/(?:^|\\/)([^\\/?#]+)\\.html(?:\\?([^#]*))?/);"
new = "var m=href.match(/(?:^|\\/)([^\\/?#]+)\\.html(?:\\?([^#]*))?(#(.*))?/);"
if adapter.count(old) != 1:
    raise SystemExit("[FAIL] clean-route-adapter.js: route regex anchor mismatch.")
adapter = adapter.replace(old, new)
old2 = "var route=m[1], q=m[2]||'';"
new2 = "var route=m[1], q=m[2]||'', hash=m[3]||'';"
if adapter.count(old2) != 1:
    raise SystemExit("[FAIL] clean-route-adapter.js: route variable anchor mismatch.")
adapter = adapter.replace(old2, new2)
old3 = "return 'app.html?'+params.toString();"
new3 = "return 'app.html?'+params.toString()+hash;"
if adapter.count(old3) != 1:
    raise SystemExit("[FAIL] clean-route-adapter.js: return anchor mismatch.")
adapter = adapter.replace(old3, new3)
(ROOT / "assets/clean-route-adapter.js").write_text(adapter, encoding="utf-8")

print("[OK] P40 Clean Bootstrap Reconstruction v3 applied.")
print("[NEXT] Run: npm run test")
