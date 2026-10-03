const fs=require('fs'),assert=require('assert');
const app=fs.readFileSync('app.html','utf8'),auth=fs.readFileSync('assets/auth.js','utf8'),forms=fs.readFileSync('assets/form-management.js','utf8'),css=fs.readFileSync('assets/checklist-share.css','utf8'),fn=fs.readFileSync('netlify/functions/checklist-share.js','utf8'),reg=fs.readFileSync('assets/clean-page-registry.js','utf8');
assert(app.includes("const isSharedChecklist=route==='monitoring-assessment'&&!!params.get('share')"),'Shared checklist route gate missing.');
assert(app.includes('assets/checklist-share.css?v=r106'),'Shared checklist CSS must load on public route.');
assert(auth.includes('function gxIsSharedChecklistRoute()'),'Auth must recognize public checklist share route.');
assert(auth.includes("if(gxIsSharedChecklistRoute()){"),'Auth must bypass login bootstrap for public checklist share route.');
assert(forms.includes("/api/checklist-share?token="),'Checklist guest client must load via tokenized share endpoint.');
assert(forms.includes('GUEST ACCESS · NO LOGIN REQUIRED'),'Shared checklist must explicitly expose guest/no-login state.');
assert(forms.includes("data-action=\"guest-submit\""),'Shared checklist must provide canonical guest submit action.');
assert(forms.includes('data-share='),'Monitoring Works must expose guest share action.');
assert(fn.includes("body.action === 'CREATE'"),'Checklist share endpoint must create tokenized shares.');
assert(fn.includes("body.action === 'SUBMIT_GUEST'"),'Checklist share endpoint must accept guest submissions.');
assert(fn.includes('tokenHash'),'Share token must be stored hashed, not plaintext.');
assert(fn.includes("accessType !== 'GUEST'"),'Guest submission endpoint must enforce share access type.');
assert(fn.includes("accessType: 'GUEST'"),'Guest submissions must be marked as guest.');
assert(css.includes('.ge-checklist-share-head')&&css.includes('.ge-checklist-share-meta')&&css.includes('.ge-checklist-share-footer'),'Shared checklist must use dedicated canonical layout.');
const masterMatch=reg.match(/p\.html='<div class="ge-page-head"[\s\S]*?section class="ge-panel"[\s\S]*?';\}\)\(\);/);
if(masterMatch){const actual=(masterMatch[0].match(/data-ref-tab="/g)||[]).length;assert.equal(actual,2,'Master Data must expose exactly two groups.');}
console.log('R106_CHECKLIST_SHARE_PUBLIC_CONTRACT_PASS');
