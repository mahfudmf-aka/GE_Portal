'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {canChangeReadState}=require('../netlify/functions/inbox-policy');
const records=[...Array.from({length:6},(_,i)=>({id:'a-'+i,recipientId:'A',senderId:'admin',status:'Unread',notificationStatus:'Unread'})),...Array.from({length:4},(_,i)=>({id:'b-'+i,recipientId:'B',senderId:'admin',status:'Unread',notificationStatus:'Unread'}))];
let version=1;
function environment(uid){const window={gxGetSession:()=>({uid}),GXFirebase:{currentUser:async()=>({uid,getIdToken:async()=>uid})},addEventListener(){},dispatchEvent(){}};
 const fetch=async(url,options={})=>{const actor=options.headers.Authorization.split(' ')[1],body=options.body&&JSON.parse(options.body);let output;
 if(body){const record=records.find(x=>x.id===String(body.id));if(!record||!canChangeReadState(actor,record,body.data))return {ok:false,status:403,json:async()=>({message:'Only your own inbox read state can change.'})};Object.assign(record,body.data);version++;output={result:{...record}}}
 else if(url.includes('manifest=1'))output={manifest:{version}};
 else output={collections:{inbox:records.filter(x=>x.recipientId===actor).map(x=>({...x}))}};
 return {ok:true,json:async()=>output};};
 const context={window,fetch,AbortController,URL,Date,Math,JSON,Promise,setTimeout,clearTimeout,console,CustomEvent:class{constructor(type,o){this.type=type;this.detail=o?.detail}},indexedDB:undefined};vm.runInNewContext(fs.readFileSync('assets/edition1-store.js','utf8'),context);return window.GEStore}
(async()=>{const a=environment('A');await a.hydrate(['inbox']);assert.equal(a.get().inbox.filter(x=>x.notificationStatus==='Unread').length,6);await a.markInboxRead('a-0','notification');assert.equal(a.get().inbox.filter(x=>x.notificationStatus==='Unread').length,5);
 const aReload=environment('A');await aReload.hydrate(['inbox']);assert.equal(aReload.get().inbox.filter(x=>x.notificationStatus==='Unread').length,5);await aReload.markInboxRead('a-0','notification');assert.equal(aReload.get().inbox.filter(x=>x.notificationStatus==='Unread').length,5);
 const b=environment('B');await b.hydrate(['inbox']);assert.equal(b.get().inbox.filter(x=>x.notificationStatus==='Unread').length,4);await assert.rejects(b.markInboxRead('a-1','notification'));
 await aReload.markInboxRead('a-1','inbox');const aAgain=environment('A');await aAgain.hydrate(['inbox']);assert.equal(aAgain.get().inbox.find(x=>x.id==='a-1').status,'Read');assert.equal(aAgain.get().inbox.filter(x=>x.notificationStatus==='Unread').length,5);
 console.log('R72_READ_PERSISTENCE_PASS')})().catch(e=>{console.error(e);process.exitCode=1});
