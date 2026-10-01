'use strict';
const crypto = require('crypto');
const { firebase, bearer, ok, bad } = require('./_firebase');
const { FieldValue } = require('firebase-admin/firestore');

const DATA = c => firebase().db.collection('portalData').doc(c).collection('records');
const WORKS = () => DATA('monitoringWorks');
const SUBS = () => DATA('formSubmissions');
const clean = v => String(v ?? '').trim();
const active = u => u && String(u.status || 'Active').toLowerCase() !== 'inactive';

async function actor(event, required=false){
  const token=bearer(event); if(!token){ if(required) throw Object.assign(new Error('Authentication required.'),{statusCode:401,code:'AUTH_REQUIRED'}); return null; }
  const {auth,db}=firebase();
  let decoded; try{decoded=await auth.verifyIdToken(token,true)}catch{throw Object.assign(new Error('Invalid or expired authentication token.'),{statusCode:401,code:'AUTH_INVALID'})}
  const snap=await db.collection('users').doc(decoded.uid).get();
  if(!snap.exists)throw Object.assign(new Error('User profile not found.'),{statusCode:403,code:'PROFILE_NOT_FOUND'});
  const u={id:decoded.uid,...snap.data()};
  if(!active(u))throw Object.assign(new Error('Account inactive.'),{statusCode:403,code:'ACCOUNT_INACTIVE'});
  return u;
}
function isEditor(u){return u?.role==='Super Admin'||u?.role==='Admin'||String(u?.accessLevel||'')==='Admin';}
function token(){return crypto.randomBytes(32).toString('base64url');}
function publicWork(id,work){
  const share=work.share||{};
  return {id, title:work.title||'', stationCode:work.stationCode||'', dueDate:work.dueDate||'', templateId:work.templateId||'', templateVersion:work.templateVersion||0, formSnapshot:work.formSnapshot||null, share:{token:share.token||'',accessMode:share.accessMode||'both',requireName:share.requireName!==false,requireEmail:!!share.requireEmail,maxSubmissions:Number(share.maxSubmissions)||0,expiresAt:share.expiresAt||'',active:share.active!==false}};
}
async function findByToken(tokenValue){
  const snap=await WORKS().where('share.token','==',tokenValue).limit(1).get();
  if(snap.empty)throw Object.assign(new Error('Checklist share link is invalid or revoked.'),{statusCode:404,code:'SHARE_NOT_FOUND'});
  const doc=snap.docs[0],work=doc.data()||{},share=work.share||{};
  if(share.active===false)throw Object.assign(new Error('Checklist share link has been revoked.'),{statusCode:410,code:'SHARE_REVOKED'});
  if(share.expiresAt && new Date(share.expiresAt+'T23:59:59')<new Date())throw Object.assign(new Error('Checklist share link has expired.'),{statusCode:410,code:'SHARE_EXPIRED'});
  return {id:doc.id,work};
}
function allowedAccess(share,kind){return share.accessMode==='both'||share.accessMode===kind;}
async function handler(event){
  const {db}=firebase();
  if(event.httpMethod==='GET'){
    const tokenValue=clean(event.queryStringParameters?.token); if(!tokenValue)return bad(400,'TOKEN_REQUIRED','Share token is required.');
    const found=await findByToken(tokenValue); return ok({ok:true,share:publicWork(found.id,found.work)});
  }
  if(event.httpMethod!=='POST')return bad(405,'METHOD_NOT_ALLOWED','Method not allowed.');
  let body;try{body=JSON.parse(event.body||'{}')}catch{return bad(400,'INVALID_JSON','Invalid JSON body.');}
  const action=clean(body.action).toLowerCase();
  if(action==='create'||action==='revoke'){
    const u=await actor(event,true); if(!isEditor(u))return bad(403,'FORBIDDEN','Only an authorized checklist manager can manage share links.');
    const workId=clean(body.workId);if(!workId)return bad(400,'WORK_REQUIRED','Monitoring Work is required.');
    const ref=WORKS().doc(workId),snap=await ref.get();if(!snap.exists)return bad(404,'WORK_NOT_FOUND','Monitoring Work not found.');
    const work=snap.data()||{};
    if(String(work.createdBy||'')!==String(u.id)&&u.role!=='Super Admin'&&u.role!=='Admin'&&String(u.accessLevel||'')!=='Admin')return bad(403,'OWNERSHIP_FORBIDDEN','You do not own this checklist work.');
    if(action==='revoke'){await ref.set({share:{...(work.share||{}),active:false,revokedAt:new Date().toISOString(),revokedBy:u.id},updatedAt:FieldValue.serverTimestamp(),updatedBy:u.id},{merge:true});return ok({ok:true,revoked:true});}
    const cfg=body.config||{};const share={token:token(),accessMode:['guest','user','both'].includes(cfg.accessMode)?cfg.accessMode:'both',requireName:cfg.requireName!==false,requireEmail:!!cfg.requireEmail,maxSubmissions:Math.max(0,Number(cfg.maxSubmissions)||0),expiresAt:clean(cfg.expiresAt),active:true,createdAt:new Date().toISOString(),createdBy:u.id};
    await ref.set({share,updatedAt:FieldValue.serverTimestamp(),updatedBy:u.id},{merge:true});
    return ok({ok:true,share:publicWork(workId,{...work,share}),url:`${clean(body.origin||'')}/app.html?page=monitoring-assessment&share=${encodeURIComponent(share.token)}`});
  }
  if(action==='submit'){
    const tokenValue=clean(body.token);if(!tokenValue)return bad(400,'TOKEN_REQUIRED','Share token is required.');
    const found=await findByToken(tokenValue),work=found.work,share=work.share||{};
    const u=await actor(event,false);const kind=u?'user':'guest';
    if(!allowedAccess(share,kind))return bad(403,'ACCESS_MODE','This checklist share link does not allow this access mode.');
    const existing=await SUBS().where('workId','==',found.id).get();
    if(Number(share.maxSubmissions)>0&&existing.size>=Number(share.maxSubmissions))return bad(409,'SUBMISSION_LIMIT','This checklist has reached its submission limit.');
    const identity=body.identity||{};const name=clean(identity.name),email=clean(identity.email).toLowerCase();
    if(share.requireName&&!name&&!u)return bad(400,'NAME_REQUIRED','Name is required for this guest checklist.');
    if(share.requireEmail&&!email&&!u)return bad(400,'EMAIL_REQUIRED','Email is required for this guest checklist.');
    const snapshot=work.formSnapshot||{};const answers=body.answers&&typeof body.answers==='object'?body.answers:{};
    for(const section of snapshot.sections||[])for(const f of section.fields||[]){if(!f.showIf?.fieldId && f.required){const v=answers[f.id];if(v===''||v==null||(Array.isArray(v)&&!v.length))return bad(400,'REQUIRED_FIELD',`Complete: ${f.label||'required field'}`)}}
    const subId=crypto.randomUUID();const actorName=u?(u.name||u.displayName||u.email||u.username||u.id):name||'Guest';
    const submitted={id:subId,source:'monitoring-assessment',workId:found.id,workTitle:work.title||'',stationCode:work.stationCode||'',templateId:work.templateId||'',templateVersion:work.templateVersion||0,formSnapshot:snapshot,category:snapshot.category||'Assessment',assessmentContext:{formId:snapshot.id||work.templateId||'',formVersion:Number(snapshot.currentVersion||work.templateVersion)||0,stationCode:work.stationCode||'',journeyScopes:Array.isArray(snapshot.journeyScopes)?snapshot.journeyScopes:[],touchpointIds:Array.isArray(snapshot.touchpointIds)?snapshot.touchpointIds:[],assessmentIndicator:snapshot.assessmentIndicator||'',frequency:snapshot.frequency||''},answers,findings:[],result:null,submittedAt:new Date().toISOString(),submittedBy:u?.id||'',submittedByName:actorName,submittedByEmail:u?.email||email||'',accessType:kind,shareTokenId:share.token};
    await SUBS().doc(subId).set(submitted);await db.collection('portalMetadata').doc('cacheState').set({version:FieldValue.increment(1),updatedAt:FieldValue.serverTimestamp(),lastCollection:'formSubmissions'},{merge:true});
    return ok({ok:true,submissionId:subId,submittedAt:submitted.submittedAt,accessType:kind});
  }
  return bad(400,'INVALID_ACTION','Action must be create, revoke or submit.');
}
exports.handler=async event=>{try{return await handler(event)}catch(e){return bad(e.statusCode||500,e.code||'CHECKLIST_SHARE_ERROR',e.message||'Checklist share request failed.')}};
