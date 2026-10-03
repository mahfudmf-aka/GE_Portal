const fs=require('fs'),assert=require('assert');
const js=fs.readFileSync('assets/edition1-business-runtime.js','utf8');
assert(js.includes('window.openInitiativeTimelineV224(${id})'),'Detail / Timeline action must use explicit window bridge');
assert(js.includes('window.openInitiativeModalV224(${id})'),'Update action must use explicit window bridge');
assert(js.includes('window.deleteInitiativeV224(${id})'),'Delete action must use explicit window bridge');
assert(js.includes('window.geFilterInitiativeTouchpoint(${JSON.stringify(tp)})'),'Touch Point panel must use the canonical filter bridge');
assert(js.includes("document.getElementById('initRows')?.scrollIntoView"),'Touch Point filtering should return focus to the initiative list');
console.log('R87_INITIATIVE_ACTION_FILTER_BRIDGE_CONTRACT_PASS');
