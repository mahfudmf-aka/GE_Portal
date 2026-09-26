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
const EXTERNAL_ROLES = new Set(['External User','External','Collaborator','Partner']);
function isExternalActor(actor){
  const role=String(actor?.role||'').trim().toLowerCase();
  const org=String(actor?.organizationType||actor?.organisationType||actor?.orgType||'').trim().toLowerCase();
  return ['external user','external','collaborator','partner'].includes(role) || ['partner','external','external partner','airline partner','vendor','supplier','ground handling agent','gha'].includes(org);
}
function ownsRecord(actor,row){return [row?.ownerUserId,row?.createdBy,row?.actorId,row?.userId].filter(Boolean).map(String).includes(String(actor?.id||''));}
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
function isOperationalAdmin(actor){ return actor?.role === 'Admin' || String(actor?.accessLevel||'') === 'Admin'; }
function canModule(actor, collection){
  if (actor.role === 'Super Admin') return true;
  if (collection === 'users') return isOperationalAdmin(actor);
  if (collection === 'portalManager') return false; // Super Admin handled above.
  if (collection === 'auditLogs') return isOperationalAdmin(actor);
  const module=MODULE_BY_COLLECTION[collection];
  if (!module) return true;
  if (isOperationalAdmin(actor)) return true;
  const p=(Array.isArray(actor.permissions)?actor.permissions:[]).map(String);
  const t=(Array.isArray(actor.tabs)?actor.tabs:[]).map(String);
  if (p.length) return p.includes(module) || p.includes('ALL') || p.includes('all');
  if (t.length) return t.includes(module) || t.includes('ALL') || t.includes('all');
  if (isExternalActor(actor)) return ['initiatives','calendar','project-tracking','news','contact','inbox'].includes(module) || p.includes(module) || t.includes(module);
  return true;
}
function canRead(actor,c){
  if(!active(actor) || !READ_ROLES.has(actor.role)) return false;
  // Active internal users read business collections; station scope is enforced after read.
  // permissions/tabs govern page/navigation, not whether a visible page can hydrate its own data.
  if(c==='users' || c==='auditLogs' || c==='portalManager') return canModule(actor,c);
  if(isExternalActor(actor)) return canModule(actor,c);
  return true;
}
function canWrite(actor,c){
  if (!active(actor)) return false;
  if (c==='users' || c==='auditLogs') return actor.role==='Super Admin' || isOperationalAdmin(actor);
  if (c==='inbox') return ADMIN_ROLES.has(actor.role) || WRITE_LEVELS.has(String(actor.accessLevel||''));
  if (isExternalActor(actor)) return ['initiatives','projectEvents'].includes(c);
  if (actor.role==='Super Admin' || isOperationalAdmin(actor)) return true;
  return canModule(actor,c) && (WRITE_LEVELS.has(String(actor.accessLevel||'')) || actor.role==='Admin');
}
function allowedStations(actor){
  if (actor.role==='Super Admin' || String(actor.scopeType||'').toUpperCase()==='ALL') return null;
  const a=Array.isArray(actor.airports)?actor.airports:[];
  return new Set(a.map(x=>String(x).trim().toUpperCase()).filter(Boolean));
}
function stationsOf(x){
  const raw=x?.stations ?? x?.stationCodes ?? x?.stationCode ?? x?.airport ?? x?.station ?? x?.relatedAirport ?? [];
  const list=Array.isArray(raw)?raw:String(raw||'').split(/[,;]+/);
  return list.map(v=>String(v||'').trim().toUpperCase()).filter(Boolean);
}
function stationOf(x){ return stationsOf(x)[0]||''; }
function inScope(actor,x){
  const allowed=allowedStations(actor); if (!allowed) return true;
  const stations=stationsOf(x); return !stations.length || stations.some(s=>allowed.has(s));
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
  if(c==='auditLogs' && !(actor.role==='Super Admin'||isOperationalAdmin(actor))) return [];
  let docs;
  if(c==='initiatives' && isExternalActor(actor)){
    const [a,b]=await Promise.all([
      dataQuery(db,c).where('ownerUserId','==',String(actor.id)).get(),
      dataQuery(db,c).where('createdBy','==',String(actor.id)).get()
    ]); const map=new Map(); [...a.docs,...b.docs].forEach(d=>map.set(d.id,d)); docs=[...map.values()];
  } else if(c==='projectEvents' && isExternalActor(actor)){
    const ownInitiatives=await readCollection(db,actor,'initiatives');
    const ownIds=new Set(ownInitiatives.map(x=>String(x.id)));
    const snap=await dataQuery(db,c).get(); docs=snap.docs.filter(d=>{const row=d.data()||{};return ownsRecord(actor,row)||ownIds.has(String(row.initiativeId||row.projectId||''));});
  } else if(c==='inbox' && !ADMIN_ROLES.has(actor.role)){
    const snap=await dataQuery(db,c).where('recipientId','==',String(actor.id)).get(); docs=snap.docs;
  } else if(c==='users'){
    const snap=await db.collection('users').get(); docs=snap.docs;
  } else {
    const snap=await dataQuery(db,c).get(); docs=snap.docs;
  }
  let rows=docs.map(d=>({id:d.id,...sanitize(d.data())}));
  if(c==='users') rows=rows.map(x=>{delete x.password;delete x.passwordHash;delete x.temporaryPassword;return x});
  if(c!=='inbox' && c!=='users' && c!=='auditLogs' && !(['initiatives','projectEvents'].includes(c)&&isExternalActor(actor))) rows=rows.filter(x=>inScope(actor,x));
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
  if(['users','auditLogs'].includes(collection) && !(actor.role==='Super Admin'||isOperationalAdmin(actor))) throw Object.assign(new Error('Administrative access required.'),{statusCode:403,code:'FORBIDDEN'});
  const ref=dataRef(db,collection,id?cleanId(id):db.collection('portalData').doc().id);
  if(isExternalActor(actor) && !['initiatives','projectEvents'].includes(collection)) throw Object.assign(new Error(`Write access denied for ${collection}.`),{statusCode:403,code:'FORBIDDEN'});
  if(action==='DELETE'){
    const snap=await ref.get(); if(!snap.exists) return {id:ref.id,deleted:false};
    const prev=snap.data()||{}; if(isExternalActor(actor)&&!ownsRecord(actor,prev)) throw Object.assign(new Error('External users can only delete their own records.'),{statusCode:403,code:'OWNERSHIP_FORBIDDEN'}); if(!isExternalActor(actor)&&!inScope(actor,prev)) throw Object.assign(new Error('Record outside account scope.'),{statusCode:403,code:'SCOPE_FORBIDDEN'});
    await ref.delete();
    await bumpCacheVersion(db,collection);
    await db.collection('auditLogs').add({actorId:actor.id,actorRole:actor.role,name:actor.name||actor.username||actor.email||actor.id,username:actor.username||actor.email||'',module:collection,object:ref.id,detail:`${collection} ${action.toLowerCase()}`,targetType:`EDITION1_${collection.toUpperCase()}`,targetId:ref.id,action:'Delete',timestamp:FieldValue.serverTimestamp(),result:'SUCCESS'});
    return {id:ref.id,deleted:true};
  }
  const data=cleanData(raw); const existing=await ref.get(); const prev=existing.exists?existing.data()||{}:{};
  if(isExternalActor(actor) && existing.exists && !ownsRecord(actor,prev)) throw Object.assign(new Error('External users can only update their own records.'),{statusCode:403,code:'OWNERSHIP_FORBIDDEN'});
  if(!isExternalActor(actor) && existing.exists && !inScope(actor,prev)) throw Object.assign(new Error('Record outside account scope.'),{statusCode:403,code:'SCOPE_FORBIDDEN'});
  if(isExternalActor(actor) && collection==='initiatives'){delete data.touchPoint;delete data.touchpoint;delete data.touchPoints;delete data.touchpoints;delete data.station;delete data.stations;data.ownerUserId=actor.id;data.visibility='EXTERNAL_PRIVATE';data.initiativeScope='GENERAL';}
  if(isExternalActor(actor) && collection==='projectEvents'){data.ownerUserId=actor.id;data.visibility='EXTERNAL_PRIVATE';}
  const station=stationOf({...prev,...data}); if(!isExternalActor(actor) && station && !inScope(actor,{airport:station,stationCode:station})) throw Object.assign(new Error('Station outside account scope.'),{statusCode:403,code:'SCOPE_FORBIDDEN'});
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
