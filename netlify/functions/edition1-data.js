'use strict';
const { bad, ok, bearer, firebase } = require('./_firebase');
const { FieldValue } = require('firebase-admin/firestore');

const COLLECTIONS = new Set([
  'airports','initiatives','news','touchpoints','documents','projectEvents','loungePurchases','loungeVisitors',
  'stationMaterials','boSpaces','serviceProcurement','airportSystems','skyPriority','touchpointStandards',
  'gasoMaster','gasoServiceSupport','gasoPlanningService','personnel','articles','announcements','faqs',
  'inbox','auditLogs','users','lounges','standardContent','portalManager','contactMessages','guestbook',
  'airlines','groundHandlers','serviceAlignments','airportCosts','aircraftConfigs','assets','facilities'
]);
const DATA_GROUP_BY_COLLECTION = Object.fromEntries([...COLLECTIONS].map(name => [name, name]));
const METADATA_COLLECTIONS = new Set(['standardContent','portalManager']);
function dataRef(db, collection, id) {
  const group = DATA_GROUP_BY_COLLECTION[collection] || collection;
  if (METADATA_COLLECTIONS.has(collection)) return db.collection('portalMetadata').doc(group).collection('records').doc(id);
  return db.collection('portalData').doc(group).collection('records').doc(id);
}
function dataQuery(db, collection) {
  const group = DATA_GROUP_BY_COLLECTION[collection] || collection;
  if (METADATA_COLLECTIONS.has(collection)) return db.collection('portalMetadata').doc(group).collection('records');
  return db.collection('portalData').doc(group).collection('records');
}
const READ_ROLES = new Set(['Super Admin','Admin','Management','Head Office','GE Team','Branch Office','Staff','Viewer','Approver','Editor','External User','External','Collaborator','Lounge Staff','Lounge Luar Biasa']);
const WRITE_LEVELS = new Set(['Editor','Admin']);
const ADMIN_ROLES = new Set(['Super Admin','Admin']);
const EXTERNAL_ROLES = new Set(['External User','External','Collaborator']);
const MODULE_BY_COLLECTION = {
  initiatives:'initiatives', projectEvents:'calendar', inbox:'inbox', airports:'data', personnel:'data',
  lounges:'planning', loungeVisitors:'lounge-visitor', loungePurchases:'lounge-purchase',
  stationMaterials:'planning', boSpaces:'planning', serviceProcurement:'planning', airportSystems:'planning',
  gasoMaster:'planning', gasoServiceSupport:'planning', gasoPlanningService:'planning', documents:'planning',
  news:'news', articles:'news', announcements:'news', faqs:'news', contactMessages:'contact', guestbook:'contact',
  touchpoints:'services', skyPriority:'services', touchpointStandards:'services', standardContent:'services',
  portalManager:'admin', auditLogs:'admin', users:'admin', airlines:'data', groundHandlers:'data', serviceAlignments:'services', airportCosts:'planning', aircraftConfigs:'data', assets:'planning', facilities:'planning',
  events:'calendar'
};
function active(actor){return actor && String(actor.status || 'Active').toLowerCase() !== 'inactive';}
function canModule(actor, collection){
  if (actor.role === 'Super Admin') return true;
  if (collection === 'users' || collection === 'auditLogs' || collection === 'portalManager') {
    if (actor.role !== 'Admin') return false;
    const p=(Array.isArray(actor.permissions)?actor.permissions:[]).map(x=>String(x).toLowerCase());
    const t=(Array.isArray(actor.tabs)?actor.tabs:[]).map(x=>String(x).toLowerCase());
    return !p.length ? (t.includes('all')||t.includes('admin')) : p.some(x=>['user-management','user_management','users','admin'].includes(x));
  }
  const module=MODULE_BY_COLLECTION[collection];
  if (!module) return true;
  if (actor.role === 'Admin') return true;
  const p=(Array.isArray(actor.permissions)?actor.permissions:[]).map(String);
  const t=(Array.isArray(actor.tabs)?actor.tabs:[]).map(String);
  if (p.length) return p.includes(module) || p.includes('ALL') || p.includes('all');
  if (t.length) return t.includes(module) || t.includes('ALL') || t.includes('all');
  if (EXTERNAL_ROLES.has(actor.role)) return ['initiatives','calendar','project-tracking','inbox'].includes(module);
  return true;
}
function canRead(actor,c){ return active(actor) && READ_ROLES.has(actor.role) && canModule(actor,c); }
function canWrite(actor,c){
  if (!active(actor)) return false;
  if (c==='users' || c==='auditLogs') return ADMIN_ROLES.has(actor.role);
  if (c==='inbox') return ADMIN_ROLES.has(actor.role) || WRITE_LEVELS.has(String(actor.accessLevel||''));
  if (EXTERNAL_ROLES.has(actor.role)) return false;
  if (actor.role==='Super Admin') return true;
  return canModule(actor,c) && (WRITE_LEVELS.has(String(actor.accessLevel||'')) || actor.role==='Admin');
}
function allowedStations(actor){
  if (actor.role==='Super Admin' || String(actor.scopeType||'').toUpperCase()==='ALL') return null;
  const a=Array.isArray(actor.airports)?actor.airports:[];
  return new Set(a.map(x=>String(x).trim().toUpperCase()).filter(Boolean));
}
function stationOf(x){ return String(x?.stationCode ?? x?.airport ?? x?.station ?? x?.relatedAirport ?? '').trim().toUpperCase(); }
function inScope(actor,x){
  const allowed=allowedStations(actor); if (!allowed) return true;
  const s=stationOf(x); return !s || allowed.has(s);
}
function sanitize(v,depth=0){
  if(depth>8) return null;
  if(v===null||v===undefined||typeof v==='string'||typeof v==='number'||typeof v==='boolean') return v;
  if(v instanceof Date) return v.toISOString();
  if(Array.isArray(v)) return v.map(x=>sanitize(x,depth+1));
  if(typeof v==='object'){
    if(typeof v.toDate==='function') return v.toDate().toISOString();
    const o={}; for(const [k,val] of Object.entries(v)){ if(k==='password'||k==='passwordHash'||k==='temporaryPassword') continue; o[k]=sanitize(val,depth+1); } return o;
  }
  return String(v);
}
async function actorFor(event){
  const token=bearer(event); if(!token) throw Object.assign(new Error('Authentication required.'),{statusCode:401,code:'AUTH_REQUIRED'});
  const {auth,db}=firebase();
  let decoded; try{decoded=await auth.verifyIdToken(token,true)}catch{throw Object.assign(new Error('Invalid or expired authentication token.'),{statusCode:401,code:'AUTH_INVALID'})}
  const snap=await db.collection('users').doc(decoded.uid).get();
  if(!snap.exists) throw Object.assign(new Error('User profile not found.'),{statusCode:403,code:'PROFILE_NOT_FOUND'});
  const actor={id:decoded.uid,...snap.data()};
  if(!active(actor)) throw Object.assign(new Error('Account inactive.'),{statusCode:403,code:'ACCOUNT_INACTIVE'});
  return {db,actor};
}
function queryCollections(event){
  const raw=event.queryStringParameters?.collections || event.queryStringParameters?.collection || '';
  return String(raw).split(',').map(x=>x.trim()).filter(Boolean);
}
async function readCollection(db,actor,c){
  if(!COLLECTIONS.has(c)) throw Object.assign(new Error(`Collection not allowed: ${c}`),{statusCode:400,code:'COLLECTION_NOT_ALLOWED'});
  if(!canRead(actor,c)) throw Object.assign(new Error(`Read access denied for ${c}.`),{statusCode:403,code:'FORBIDDEN'});
  if(c==='auditLogs' && !ADMIN_ROLES.has(actor.role)) return [];
  let docs;
  if(c==='initiatives' && EXTERNAL_ROLES.has(actor.role)){
    const [a,b]=await Promise.all([
      dataQuery(db,c).where('sharedWithUserIds','array-contains',String(actor.id)).get(),
      dataQuery(db,c).where('mentionedUserIds','array-contains',String(actor.id)).get()
    ]); const map=new Map(); [...a.docs,...b.docs].forEach(d=>map.set(d.id,d)); docs=[...map.values()];
  } else if(c==='inbox' && !ADMIN_ROLES.has(actor.role)){
    const snap=await dataQuery(db,c).where('recipientId','==',String(actor.id)).get(); docs=snap.docs;
  } else {
    const snap=await dataQuery(db,c).get(); docs=snap.docs;
  }
  let rows=docs.map(d=>({id:d.id,...sanitize(d.data())}));
  if(c==='users') rows=rows.map(x=>{delete x.password;delete x.passwordHash;delete x.temporaryPassword;return x});
  if(c!=='initiatives' && c!=='inbox' && c!=='users' && c!=='auditLogs') rows=rows.filter(x=>inScope(actor,x));
  return rows;
}
function cleanId(id){ const s=String(id||'').trim(); if(!s||s.length>200) throw Object.assign(new Error('Invalid document id.'),{statusCode:400,code:'INVALID_ID'}); return s; }
function cleanData(data){
  if(!data || typeof data!=='object' || Array.isArray(data)) throw Object.assign(new Error('Invalid data payload.'),{statusCode:400,code:'INVALID_DATA'});
  const out={...data}; delete out.id; delete out.createdAt; delete out.createdBy; delete out.updatedAt; delete out.updatedBy; delete out.actorId; delete out.password; delete out.passwordHash; delete out.temporaryPassword; return out;
}
async function bumpCacheVersion(db,collection){
  await db.collection('portalMetadata').doc('cacheState').set({version:FieldValue.increment(1),updatedAt:FieldValue.serverTimestamp(),lastCollection:String(collection||'')},{merge:true});
}
async function writeOne(db,actor,collection,action,id,raw){
  if(!COLLECTIONS.has(collection)) throw Object.assign(new Error(`Collection not allowed: ${collection}`),{statusCode:400,code:'COLLECTION_NOT_ALLOWED'});
  if(!(collection==='inbox' && action==='CREATE') && !canWrite(actor,collection)) throw Object.assign(new Error(`Write access denied for ${collection}.`),{statusCode:403,code:'FORBIDDEN'});
  if(['users','auditLogs'].includes(collection) && !ADMIN_ROLES.has(actor.role)) throw Object.assign(new Error('Administrative access required.'),{statusCode:403,code:'FORBIDDEN'});
  const ref=dataRef(db,collection,id?cleanId(id):db.collection('portalData').doc().id);
  if(action==='DELETE'){
    const snap=await ref.get(); if(!snap.exists) return {id:ref.id,deleted:false};
    const prev=snap.data()||{}; if(!inScope(actor,prev)) throw Object.assign(new Error('Record outside account scope.'),{statusCode:403,code:'SCOPE_FORBIDDEN'});
    await ref.delete();
    await bumpCacheVersion(db,collection);
    await db.collection('auditLogs').add({actorId:actor.id,actorRole:actor.role,name:actor.name||actor.username||actor.email||actor.id,username:actor.username||actor.email||'',module:collection,object:ref.id,detail:`${collection} ${action.toLowerCase()}`,targetType:`EDITION1_${collection.toUpperCase()}`,targetId:ref.id,action:'Delete',timestamp:FieldValue.serverTimestamp(),result:'SUCCESS'});
    return {id:ref.id,deleted:true};
  }
  const data=cleanData(raw); const existing=await ref.get(); const prev=existing.exists?existing.data()||{}:{};
  if(existing.exists && !inScope(actor,prev)) throw Object.assign(new Error('Record outside account scope.'),{statusCode:403,code:'SCOPE_FORBIDDEN'});
  const station=stationOf({...prev,...data}); if(station && !inScope(actor,{airport:station,stationCode:station})) throw Object.assign(new Error('Station outside account scope.'),{statusCode:403,code:'SCOPE_FORBIDDEN'});
  const now=FieldValue.serverTimestamp();
  const next={...data,updatedAt:now,updatedBy:actor.id}; if(!existing.exists){next.createdAt=now;next.createdBy=actor.id}
  if(action==='CREATE' && existing.exists) throw Object.assign(new Error('Record already exists.'),{statusCode:409,code:'ALREADY_EXISTS'});
  await ref.set(next,{merge:action==='UPDATE'});
  await bumpCacheVersion(db,collection);
  const out=await ref.get();
  await db.collection('auditLogs').add({actorId:actor.id,actorRole:actor.role,name:actor.name||actor.username||actor.email||actor.id,username:actor.username||actor.email||'',module:collection,object:ref.id,detail:`${collection} ${action.toLowerCase()}`,targetType:`EDITION1_${collection.toUpperCase()}`,targetId:ref.id,action:action.charAt(0)+action.slice(1).toLowerCase(),timestamp:FieldValue.serverTimestamp(),result:'SUCCESS'});
  return {id:ref.id,...sanitize(out.data())};
}
exports.handler=async(event)=>{
  try{
    const {db,actor}=await actorFor(event);
    if(event.httpMethod==='GET'){
      if(String(event.queryStringParameters?.manifest||'')==='1'){
        const snap=await db.collection('portalMetadata').doc('cacheState').get();
        const meta=snap.exists?sanitize(snap.data()):{};
        return ok({ok:true,source:'Firestore',manifest:{version:Number(meta.version||0),updatedAt:meta.updatedAt||null,lastCollection:meta.lastCollection||''}});
      }
      const cols=queryCollections(event); if(!cols.length) return bad(400,'COLLECTION_REQUIRED','At least one collection is required.');
      const out={}; for(const c of cols) out[c]=await readCollection(db,actor,c); return ok({ok:true,source:'Firestore',collections:out,actor:{id:actor.id,role:actor.role,accessLevel:actor.accessLevel||'',scopeType:actor.scopeType||'CUSTOM'}});
    }
    if(event.httpMethod==='POST'){
      let body; try{body=JSON.parse(event.body||'{}')}catch{return bad(400,'INVALID_JSON','Invalid JSON body.')}
      const collection=String(body.collection||'').trim(); const action=String(body.action||'').toUpperCase();
      if(!['CREATE','UPDATE','DELETE'].includes(action)) return bad(400,'INVALID_ACTION','Action must be CREATE, UPDATE or DELETE.');
      const result=await writeOne(db,actor,collection,action,body.id,body.data||{}); return ok({ok:true,source:'Firestore',result});
    }
    return bad(405,'METHOD_NOT_ALLOWED','Method not allowed.');
  }catch(e){return bad(e.statusCode||500,e.code||'EDITION1_DATA_ERROR',e.message||'Edition 1 data request failed.');}
};
