'use strict';
const assert = require('assert');
const path = require('path');
const Module = require('module');

const fnPath = path.resolve(__dirname, '../netlify/functions/access-assistance-admin.js');
const requestPath = path.resolve(__dirname, '../netlify/functions/access-assistance-request.js');

class Ref {
  constructor(db, collection, id) { this.db=db; this.collection=collection; this.id=id; }
  async get(){ const data=this.db.store[this.collection]?.[this.id]; return {exists:!!data,data:()=>data}; }
  async set(data, options={}){ this.db.store[this.collection] ||= {}; this.db.store[this.collection][this.id]=options.merge?{...(this.db.store[this.collection][this.id]||{}),...data}:{...data}; }
  async update(data){ this.db.store[this.collection] ||= {}; this.db.store[this.collection][this.id]={...(this.db.store[this.collection][this.id]||{}),...data}; }
}
class Batch {
  constructor(db){this.db=db;this.ops=[];}
  set(ref,data,options){this.ops.push(()=>ref.set(data,options));}
  async commit(){for(const op of this.ops)await op();}
}
class DB {
  constructor(seed={}){this.store=JSON.parse(JSON.stringify(seed));this.seq=0;}
  collection(name){const db=this;return {
    doc(id){return new Ref(db,name,String(id||`auto-${++db.seq}`));},
    where(field,op,value){return {get:async()=>({docs:Object.entries(db.store[name]||{}).filter(([,d])=>op==='array-contains'&&Array.isArray(d[field])&&d[field].map(String).includes(String(value))).map(([id,d])=>({id,data:()=>d}))})};},
    async get(){return {docs:Object.entries(db.store[name]||{}).map(([id,d])=>({id,data:()=>d}))};}
  };}
  batch(){return new Batch(this);}
  async runTransaction(fn){const tx={get:ref=>ref.get(),update:(ref,data)=>ref.update(data),create:async(ref,data)=>{const snap=await ref.get();if(snap.exists)throw new Error('already exists');await ref.set(data)}};return fn(tx);}
}

async function loadHandler(targetPath, mock){
  const original=Module._load;
  Module._load=function(request,parent,isMain){
    if(parent && parent.filename===targetPath && request==='./_firebase')return mock;
    return original.apply(this,arguments);
  };
  delete require.cache[targetPath];
  const mod=require(targetPath);
  Module._load=original;
  return mod.handler;
}

async function main(){
  const db=new DB({accessAssistanceRequests:{req1:{type:'ACCESS_ASSISTANCE',identifier:'mahfud',reason:'lupa password',recipientUserIds:['admin-1','super-1'],recipientRoles:['Admin','Super Admin'],status:'OPEN',createdAt:'2026-09-19T01:00:00.000Z'}}});
  let actor={id:'admin-1',role:'Admin',status:'Active',permissions:['user-management'],name:'Ground Admin',username:'gadmin'};
  const mock={
    firebase:()=>({db}),
    ok:body=>({statusCode:200,body:JSON.stringify(body)}),
    bad:(statusCode,code,message)=>({statusCode,body:JSON.stringify({ok:false,code,message})}),
    requireActor:async()=>({db,actor}),
    hasUserManagementPermission:a=>a.role==='Super Admin'||(a.role==='Admin'&&a.permissions?.includes('user-management'))
  };
  const handler=await loadHandler(fnPath,mock);

  let r=await handler({httpMethod:'GET',headers:{}});
  assert.strictEqual(r.statusCode,200);
  let body=JSON.parse(r.body);assert.strictEqual(body.requests.length,1);assert.strictEqual(body.requests[0].status,'OPEN');assert.strictEqual(body.requests[0].notificationStatus,'UNREAD');

  r=await handler({httpMethod:'POST',headers:{},body:JSON.stringify({action:'read',requestId:'req1'})});
  assert.strictEqual(r.statusCode,200);assert.strictEqual(db.store.inbox['access-assistance-req1-admin-1'].status,'READ');

  r=await handler({httpMethod:'POST',headers:{},body:JSON.stringify({action:'process',requestId:'req1'})});
  assert.strictEqual(r.statusCode,200);assert.strictEqual(db.store.accessAssistanceRequests.req1.status,'IN_PROGRESS');assert.strictEqual(db.store.accessAssistanceRequests.req1.handledBy.id,'admin-1');assert.ok(db.store.accessAssistanceRequests.req1.handledAt);

  actor={id:'admin-2',role:'Admin',status:'Active',permissions:['user-management'],name:'Other Admin',username:'other'};
  const originalConsoleError=console.error;console.error=()=>{};
  r=await handler({httpMethod:'POST',headers:{},body:JSON.stringify({action:'process',requestId:'req1'})});
  assert.strictEqual(r.statusCode,403,'An unlisted admin must not access a request.');

  actor={id:'super-1',role:'Super Admin',status:'Active',name:'Super Admin',username:'super'};
  r=await handler({httpMethod:'POST',headers:{},body:JSON.stringify({action:'process',requestId:'req1'})});
  assert.strictEqual(r.statusCode,409,'A second authorized recipient must not claim an IN_PROGRESS request.');

  r=await handler({httpMethod:'POST',headers:{},body:JSON.stringify({action:'resolve',requestId:'req1',resolutionNote:'User diarahkan ke prosedur pemulihan akses.'})});
  assert.strictEqual(r.statusCode,200);assert.strictEqual(db.store.accessAssistanceRequests.req1.status,'RESOLVED');assert.strictEqual(db.store.accessAssistanceRequests.req1.resolvedBy.id,'super-1');assert.ok(db.store.accessAssistanceRequests.req1.resolvedAt);
  assert.strictEqual(db.store.accessAssistanceRequests.req1.reason,'lupa password');
  assert.ok(!('password' in db.store.accessAssistanceRequests.req1));
  assert.ok(!('temporaryPassword' in db.store.accessAssistanceRequests.req1));

  actor={id:'regular-1',role:'Management',status:'Active',permissions:[],name:'Regular',username:'regular'};
  r=await handler({httpMethod:'GET',headers:{}});assert.strictEqual(r.statusCode,403);
  console.error=originalConsoleError;

  console.log('P32_ACCESS_ASSISTANCE_RUNTIME_PASS');
}
main().catch(err=>{console.error(err);process.exitCode=1;});
