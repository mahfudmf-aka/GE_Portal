#!/usr/bin/env python3
"""
P40 Clean Draft v5 deterministic registry patch.
Run from the repository root:
    python tools/apply-p40-clean-registry-v5.py
This edits only assets/clean-page-registry.js.
No GitHub API/write is used.
"""
from pathlib import Path
import json

p=Path("assets/clean-page-registry.js")
text=p.read_text(encoding="utf-8")
marker="window.P40_CLEAN_PAGES="
alias_marker="window.P40_CLEAN_ALIASES="
a=text.index(marker)+len(marker)
b=text.index(alias_marker)
raw=text[a:b].strip()
if raw.endswith(";"):
    raw=raw[:-1].rstrip()
pages=json.loads(raw)

# Clean Draft owns the shell. These runtimes must not be loaded by any registry page.
legacy_shell={
    "assets/portal-shell.js",
    "assets/edition1-portal-shell-entry.js",
    "assets/edition1-portal-route-adapter.js",
}
for route,definition in pages.items():
    definition["scripts"]=[
        item for item in definition.get("scripts",[])
        if not (
            isinstance(item,dict)
            and item.get("src","").split("?")[0] in legacy_shell
        )
    ]

# Dashboard must have a real mount. The old registry entry had empty HTML.
pages["index"]["html"]='<div id="dashboardRoot"></div>'

# Programmatic navigation bypasses the click adapter; normalize it explicitly.
station_old="location.href='station-360.html?stationId=${encodeURIComponent(x.stationId)}'"
station_new="location.href=(window.p40CleanRoute?window.p40CleanRoute('station-360.html?stationId='+encodeURIComponent(x.stationId)):'station-360.html?stationId='+encodeURIComponent(x.stationId))"
for definition in pages.values():
    if isinstance(definition.get("html"),str):
        definition["html"]=definition["html"].replace(station_old,station_new)
    for item in definition.get("scripts",[]):
        if isinstance(item,dict) and isinstance(item.get("code"),str):
            item["code"]=item["code"].replace(station_old,station_new)
            item["code"]=item["code"].replace("location.replace('index.html#service-experience')","location.replace('app.html?page=index#service-experience')")

new_pages=json.dumps(pages,ensure_ascii=False,separators=(",",":"))
out=text[:a]+new_pages+text[b:]
p.write_text(out,encoding="utf-8")
print("P40 registry updated:",p)
print("routes:",len(pages))
print("index html:",pages["index"]["html"])
print("legacy shell refs remaining:",sum(
    1 for d in pages.values() for x in d.get("scripts",[])
    if isinstance(x,dict) and x.get("src","").split("?")[0] in legacy_shell
))
