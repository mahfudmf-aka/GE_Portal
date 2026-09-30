/* Planning category editor within the existing Master Data tabs. */
(function(){
  'use strict';
  if(!/master-data(?:\.html)?$/i.test(new URLSearchParams(location.search).get('page')||location.pathname.split('/').pop()||''))return;
  const types=[
    ['journeyScope','Journey Scope'],['capability','Capability'],['costType','Jenis Biaya'],['spaceType','Jenis Space & Building'],
    ['materialType','Jenis Material, Tools & Equipment'],['systemType','Jenis Airport System'],['planningDocumentType','Jenis Planning Document'],
    ['uom','UOM / Unit of Measure'],['billingFrequency','Billing / Price Frequency'],['documentCategory','Document Category'],['lifecycleType','Status / Lifecycle Type']
  ];
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const names=Object.fromEntries(types);
  const idTypes=[
    ['airlines','Airline Partner'],['aircraftConfigs','Aircraft Master'],['currencyExchange','Currency / Exchange Rate'],
    ['touchpoints','Touch Point'],['personnel','Station Personnel'],['stations','Station'],['branchOffices','Branch Office'],
    ['airports','Airport / Airport Master'],['vendors','Vendor / Supplier'],['serviceProviders','Service Provider'],
    ['agreements','Contract / Agreement Reference'],['locations','Location / Area'],['positions','Position / Jabatan']
  ];
  const baseCategories={journeyScope:[['Pre-Journey','Pre-Journey'],['Pre-Flight','Pre-Flight'],['Post-Flight','Post-Flight'],['Post-Journey','Post-Journey'],['Cross-Journey / End-to-End','Cross-Journey / End-to-End'],['Supporting / Enabler','Supporting / Enabler']],spaceType:[['OFFICE','Perkantoran'],['SERVICE','Area Layanan']],materialType:[['DOCUMENT','Dokumen'],['LABEL','Label'],['TOOLS','Tools'],['EQUIPMENT','Equipment']],systemType:[['HARDWARE','Hardware'],['SOFTWARE','Software']],planningDocumentType:[['FRA','FRA · Dokumen Anggaran'],['TOR','TOR · Spesifikasi dan Detail Item']],uom:[['M2','m²'],['UNIT','Unit'],['PAX','Pax'],['MONTH','Month'],['ITEM','Item']],billingFrequency:[['MONTHLY','Per Month'],['YEARLY','Per Year'],['PAX','Per Pax'],['ITEM','Per Item'],['UNIT','Per Unit']],documentCategory:[['AGREEMENT','Agreement / Contract'],['PLANNING','Planning'],['REFERENCE','Reference'],['REPORT','Report']],lifecycleType:[['ACTIVE','Active'],['INACTIVE','Inactive'],['DRAFT','Draft'],['RETIRED','Retired']]};
  let state,kind='journeyScope',idKind='airlines';
  const canEdit=()=>typeof gxCanManage==='function'?!!gxCanManage():['Super Admin','Admin'].includes((window.gxGetSession?.()||{}).role);
  const host=document.createElement('section');host.className='ge-id-catalog';host.id='geIdCatalog';
  const idHost=document.createElement('section');idHost.className='ge-id-catalog';idHost.id='geEntityCatalog';
  host.innerHTML=`<h2>Daftar Referensi</h2><p>Journey Scope, capability, dan jenis Planning menggunakan referensi yang sama di seluruh halaman. Nama Touch Point CSI tetap berasal dari hasil capture; Journey Area dapat ditetapkan pada Ground Touch Points.</p>
    <div class="ge-ref-toolbar"><label>Kelompok <select id="idCatalogType" class="ge-input">${types.map(([id,label])=>`<option value="${id}" ${id===kind?'selected':''}>${label}</option>`).join('')}</select></label>
    <input id="idCatalogSearch" class="ge-input" placeholder="Cari ID atau nama">
    <button id="idCatalogAdd" class="ge-btn primary" type="button">+ Tambah Satuan</button>
    <button id="idCatalogTemplate" class="ge-btn" type="button">Unduh Template</button>
    <button id="idCatalogUpload" class="ge-btn" type="button">Upload Data</button>
    <button id="idCatalogExport" class="ge-btn" type="button">Unduh Data</button>
    
    <input id="idCatalogFile" type="file" accept=".csv,text/csv" hidden></div>
    <div class="ge-table-wrap"><table><thead><tr><th data-sort='0'>ID ↕</th><th data-sort='1'>Nama ↕</th><th data-sort='2'>Status ↕</th><th data-sort='3'>Catatan ↕</th><th>Aksi</th></tr></thead><tbody id="idCatalogRows"><tr><td colspan="5">Memuat katalog…</td></tr></tbody></table></div>
    <p id="idCatalogStatus" role="status" aria-live="polite"></p>
    <div id="idCatalogDialog" class="ge-id-dialog" hidden></div>`;
  idHost.innerHTML=`<h2>ID &amp; MASTER REFERENSI</h2><p>Daftar ID/master operasional yang digunakan bersama oleh Planning, Experience, Cost dan workspace lainnya.</p>
    <div class="ge-ref-toolbar"><label>Kelompok <select id="entityCatalogType" class="ge-input">${idTypes.map(([id,label])=>`<option value="${id}" ${id===idKind?'selected':''}>${label}</option>`).join('')}</select></label>
    <input id="entityCatalogSearch" class="ge-input" placeholder="Cari ID atau nama...">
    <button id="entityCatalogExport" class="ge-btn" type="button">Unduh Data</button></div>
    <div class="ge-table-wrap"><table><thead id="entityCatalogHead"></thead><tbody id="entityCatalogRows"><tr><td>Memuat data...</td></tr></tbody></table></div>
    <p id="entityCatalogStatus" role="status" aria-live="polite"></p>`;
  function $(id){return host.querySelector('#'+id)}
  function $e(id){return idHost.querySelector('#'+id)}
  const entityConfig={
    airlines:{headers:['ID','Nama','IATA','Status'],rows:()=> (state?.airlines||[]).map(x=>[x.id||x.iata||'',x.name||'',x.iata||'',x.status||'Active'])},
    aircraftConfigs:{headers:['ID','Aircraft','Configuration','Status'],rows:()=> (state?.aircraftConfigs||[]).map(x=>[x.id||x.aircraftType||'',x.aircraftType||x.name||'',x.configuration||x.registration||'',x.status||'Active'])},
    currencyExchange:{headers:['ID','Reference','Detail','Status'],rows:()=>[...(state?.currencies||[]).map(x=>['currency:'+String(x.code||x.id||''),x.code||'',x.name||x.symbol||'',x.status||'Active']),...(state?.exchangeRates||[]).map(x=>[x.id||'',`${x.baseCurrency||''} → ${x.quoteCurrency||''}`,`${x.rate??''}${x.effectiveDate?' · '+x.effectiveDate:''}`,x.status||'Active'])]},
    touchpoints:{headers:['ID','Touch Point','Journey','Status'],rows:()=> (state?.touchpoints||[]).map(x=>[x.id||'',x.name||x.title||x.touchpointName||'',Array.isArray(x.journeys)?x.journeys.join('; '):(x.journeys||x.journey||''),x.status||'Active'])},
    personnel:{headers:['ID','Nama','Station','Position'],rows:()=> (state?.personnel||[]).map(x=>[x.id||x.employeeNo||'',x.name||'',x.airport||x.station||'',x.position||''])},
    stations:{headers:['ID','Station','Airport','Status'],rows:()=> (state?.airports||[]).map(x=>[x.id||x.code||x.iata||'',x.code||x.stationCode||x.iata||'',x.name||x.airportName||'',x.status||'Active'])},
    branchOffices:{headers:['ID','Branch Office','Station','Status'],rows:()=> (state?.boSpaces||[]).map(x=>[x.branchOfficeId||x.branchOffice||x.id||'',x.branchOffice||x.officeName||x.name||'',x.station||x.airport||'',x.status||'Active'])},
    airports:{headers:['ID','Airport','Code','Status'],rows:()=> (state?.airports||[]).map(x=>[x.id||x.code||x.iata||'',x.name||x.airportName||x.stationName||'',x.code||x.iata||x.icao||'',x.status||'Active'])},
    vendors:{headers:['ID','Vendor / Supplier','Service','Status'],rows:()=> (state?.serviceProcurement||[]).map(x=>[x.id||'',x.vendor||x.supplier||x.provider||x.name||'',x.serviceName||x.serviceType||x.category||'',x.status||'Active'])},
    serviceProviders:{headers:['ID','Provider','Scope','Status'],rows:()=>[...(state?.serviceProcurement||[]).map(x=>[x.id||'',x.provider||x.vendor||x.name||x.serviceName||'',x.scope||x.serviceType||x.category||'',x.status||'Active']),...(state?.groundHandlers||[]).map(x=>['gha:'+String(x.id||''),x.name||'',x.scope||'Ground Handling',x.status||'Active'])]},
    agreements:{headers:['ID','Agreement','Type','Status'],rows:()=>[...(state?.lounges||[]).map(x=>[x.documentNumber||x.id||'',x.documentNumber||x.name||'',x.documentType||'Agreement',x.documentStatus||x.status||'Active']),...(state?.serviceProcurement||[]).filter(x=>x.agreement||x.documentNumber).map(x=>[x.documentNumber||x.agreement||x.id||'',x.agreement||x.documentNumber||'',x.documentType||'Agreement',x.status||'Active'])]},
    locations:{headers:['ID','Location / Area','Station','Status'],rows:()=>[...(state?.facilities||[]).map(x=>[x.id||x.code||'',x.name||x.area||x.location||'',x.station||x.airport||'',x.status||'Active']),...(state?.boSpaces||[]).map(x=>[x.id||'',x.spaceName||x.name||x.area||'',x.station||x.airport||'',x.status||'Active'])]},
    positions:{headers:['ID','Position','Station','Status'],rows:()=>{const m=new Map();(state?.personnel||[]).forEach(x=>{const n=String(x.position||x.jabatan||'').trim();if(n&&!m.has(n))m.set(n,['position:'+n,n,x.airport||x.station||'',x.status||'Active'])});return [...m.values()]} }
  };
  function entityRows(){return entityConfig[idKind]?.rows?.()||[]}
  function renderEntities(){const cfg=entityConfig[idKind]||entityConfig.airlines,q=String($e('entityCatalogSearch')?.value||'').trim().toLocaleLowerCase();$e('entityCatalogHead').innerHTML='<tr>'+cfg.headers.map(h=>`<th>${esc(h)}</th>`).join('')+'</tr>';const rows=entityRows().filter(r=>r.some(v=>String(v??'').toLocaleLowerCase().includes(q)));$e('entityCatalogRows').innerHTML=rows.map(r=>'<tr>'+r.map(v=>`<td>${esc(Array.isArray(v)?v.join('; '):v)}</td>`).join('')+'</tr>').join('')||`<tr><td colspan="${cfg.headers.length}">Belum ada data pada kelompok ini.</td></tr>`;$e('entityCatalogStatus').textContent=`${rows.length} data ditampilkan`; }
  function rows(){const stored=(state?.referenceCatalog||[]).filter(x=>x.kind===kind);const existing=kind==='capability'?[...new Set((state?.serviceAlignments||[]).map(x=>String(x.capability||'').trim()).filter(Boolean))].map(name=>[name,name]):[];return [...[...(baseCategories[kind]||[]),...existing].filter(([id])=>!stored.some(x=>x.id===id)).map(([id,name])=>({kind,id,name,status:'Active',note:'Kategori dasar',builtIn:true})),...stored]}
  function status(message){$('idCatalogStatus').textContent=message}
  function render(){const q=$('idCatalogSearch').value.trim().toLocaleLowerCase();const r=rows().filter(x=>[x.id,x.name,x.note].some(v=>String(v||'').toLocaleLowerCase().includes(q)));
    $('idCatalogRows').innerHTML=r.map(x=>`<tr><td><code>${esc(x.id)}</code></td><td>${esc(x.name)}</td><td>${esc(x.status||'Active')}</td><td>${esc(x.note||'—')}</td><td>${canEdit()?`<button type="button" class="ge-btn compact" data-edit="${esc(x.id)}">Edit</button> <button type="button" class="ge-btn compact" data-remove="${esc(x.id)}">Hapus</button>`:'—'}</td></tr>`).join('')||'<tr><td colspan="5">Belum ada ID pada kategori ini.</td></tr>';
    host.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>edit(rows().find(x=>x.id===b.dataset.edit)));
    host.querySelectorAll('th[data-sort]').forEach(th=>th.onclick=()=>{const idx=Number(th.dataset.sort),dir=th.dataset.dir==='asc'?-1:1;th.dataset.dir=dir===1?'asc':'desc';const body=$('idCatalogRows');[...body.rows].sort((a,b)=>a.cells[idx].textContent.localeCompare(b.cells[idx].textContent,'id',{numeric:true})*dir).forEach(row=>body.append(row))});
    host.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>remove(rows().find(x=>x.id===b.dataset.remove)));
    ['idCatalogAdd','idCatalogUpload'].forEach(id=>$(id).hidden=!canEdit());
  }
  function dialog(title,content,save){const d=$('idCatalogDialog');d.hidden=false;d.innerHTML=`<div class="ge-id-backdrop"><div class="ge-id-modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h3>${esc(title)}</h3>${content}<p id="idDialogStatus" role="status"></p><div class="ge-id-actions"><button type="button" data-cancel class="ge-btn">Batal</button><button type="button" data-save class="ge-btn primary">Simpan</button></div></div></div>`;
    d.querySelector('[data-cancel]').onclick=()=>{d.hidden=true;d.replaceChildren()};d.querySelector('[data-save]').onclick=async e=>{e.target.disabled=true;try{await save(d);d.hidden=true;d.replaceChildren();render()}catch(err){d.querySelector('#idDialogStatus').textContent='Gagal menyimpan: '+err.message;e.target.disabled=false}};
  }
  async function persist(){GEStore.save(state);await GEStore.flush();status('Data berhasil disimpan ke Firestore.')}
  function edit(x){dialog(x?'Edit ID':'Tambah ID',`<label>ID / Kode <input id="idEditCode" class="ge-input" value="${esc(x?.id||'')}" ${x?'readonly':''} placeholder="Contoh: GHA"></label><label>Nama <input id="idEditName" class="ge-input" value="${esc(x?.name||'')}"></label><label>Catatan <input id="idEditNote" class="ge-input" value="${esc(x?.note||'')}"></label><label>Status <select id="idEditState" class="ge-input"><option ${x?.status!=='Inactive'?'selected':''}>Active</option><option ${x?.status==='Inactive'?'selected':''}>Inactive</option></select></label>`,async d=>{
    const code=d.querySelector('#idEditCode').value.trim(),name=d.querySelector('#idEditName').value.trim();if(!code||!name)throw Error('ID dan nama wajib diisi.');if(!x&&rows().some(v=>v.id.toLocaleLowerCase()===code.toLocaleLowerCase()))throw Error('ID sudah ada pada kategori ini.');
    const item={...x,kind,id:code,name,note:d.querySelector('#idEditNote').value.trim(),status:d.querySelector('#idEditState').value};const stored=(state.referenceCatalog||[]).find(v=>v.kind===kind&&v.id===code);if(stored)Object.assign(stored,item);else state.referenceCatalog.push(item);await persist();
  })}
  function remove(x){if(!x)return;dialog('Hapus Jenis',`<p><b>${esc(x.name)}</b> akan dinonaktifkan. Record yang merujuk pada jenis ini tidak ikut dihapus; tetapkan jenis lain sebelum menonaktifkan bila masih digunakan.</p>`,async()=>{if(x.builtIn)throw Error('Jenis dasar masih menjadi rujukan record existing dan tidak dapat dihapus.');x.status='Inactive';await persist()})}
  function csvCell(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}
  function download(text,name){const u=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
  async function inventory(){const button=$('idCatalogInventory');button.disabled=true;status('Membaca ID existing dari Firestore…');try{
    const sources=['airports','airlines','touchpoints','aircraftConfigs','groundHandlers','lounges','personnel','boSpaces','stationMaterials','airportSystems','serviceProcurement','serviceAlignments','skyPriority','touchpointStandards','gasoMaster','gasoServiceSupport','gasoPlanningService','airportCosts'];
    const relevant=['code','iata','icao','airportCode','stationCode','airportName','name','serviceName','officeName','title','component','materialName','itemName','productName','systemName','aircraftType','configuration','station','airport','stations','stationCodes','gasoCode','type','category','scope','serviceType','facilityType','function','journey','journeys','aliases','sourceType','relationship','airline','capability','gaStandard','partnerRule','applicability','serviceElement','availability','provider','vendor','agreement','documentNumber','status','from','until','effectiveFrom','effectiveUntil','sbd','kioskK','checkIn','boardingGate','transferDesk','requirement','reference'];
    const first=(x,keys)=>keys.map(k=>x[k]).find(v=>v!==undefined&&v!==null&&String(v).trim()!=='')||'';
    const display=v=>Array.isArray(v)?v.join('; '):typeof v==='object'?JSON.stringify(v):String(v||'');
    const rows=[];
    for(const collection of sources){try{const data=await GEStore.hydrate([collection]),items=data[collection]||[];if(!items.length){rows.push([collection,'NO_RECORDS','','','','','','']);continue}
      for(const x of items){const mapping=Object.fromEntries(relevant.filter(k=>x[k]!==undefined).map(k=>[k,x[k]]));rows.push([collection,x.id||'',display(first(x,['code','iata','airportCode','stationCode'])),display(first(x,['name','airportName','serviceName','officeName','title','component','materialName','itemName','productName','systemName','aircraftType'])),display(first(x,['stations','stationCodes','station','airport','gasoCode'])),display(first(x,['serviceType','facilityType','type','category','scope','function'])),JSON.stringify(mapping),Object.keys(x).sort().join('; ')])}
    }catch(e){rows.push([collection,'READ_FAILED','','','','',JSON.stringify({error:e.message}),''])}}
    download('collection,record_id,code,name,station,type,mapping_fields,field_keys\r\n'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),'Inventaris_Mapping_Existing_Firestore.csv');status(`${rows.length} baris inventaris diunduh. Tidak ada record yang diubah.`)
  }catch(e){status('Inventaris gagal: '+e.message)}finally{button.disabled=false}}
  function parseCSV(text){return text.replace(/^\ufeff/,'').split(/\r?\n/).filter(Boolean).map(line=>{const out=[];let q=false,v='';for(let i=0;i<line.length;i++){if(line[i]==='"'){if(q&&line[i+1]==='"'){v+='"';i++}else q=!q}else if(line[i]===','&&!q){out.push(v.trim());v=''}else v+=line[i]}out.push(v.trim());return out})}
  function upload(file){if(!file)return;file.text().then(t=>{const [head,...lines]=parseCSV(t);if(!head?.length)throw Error('File kosong.');const idx=x=>head.findIndex(h=>h.toLocaleLowerCase()===x);const records=lines.map((v,i)=>({row:i+2,id:v[idx('id')]||'',name:v[idx('name')]||'',note:v[idx('note')]||'',status:v[idx('status')]||'Active'}));
    const invalid=records.filter(x=>!x.id||!x.name),valid=records.filter(x=>x.id&&x.name);dialog('Konfirmasi Upload',`<p>${valid.length} valid, ${invalid.length} belum lengkap. Baris yang belum lengkap dapat dilengkapi lalu diunggah kembali.</p><div class="ge-table-wrap"><table><thead><tr><th>Baris</th><th>ID</th><th>Nama</th><th>Status</th></tr></thead><tbody>${records.slice(0,20).map(x=>`<tr><td>${x.row}</td><td>${esc(x.id)}</td><td>${esc(x.name)}</td><td>${x.id&&x.name?'Siap':'Belum lengkap'}</td></tr>`).join('')}</tbody></table></div>`,async()=>{const existing=new Set(rows().map(x=>x.id.toLocaleLowerCase()));let added=0;for(const x of valid){if(existing.has(x.id.toLocaleLowerCase()))continue;state.referenceCatalog.push({kind,id:x.id,name:x.name,note:x.note,status:x.status});existing.add(x.id.toLocaleLowerCase());added++}await persist();status(`${added} ID tersimpan; ${invalid.length} belum lengkap; ${valid.length-added} sudah ada.`)});
  }).catch(e=>status('Upload gagal: '+e.message))}
  function publishMasterReferences(){
    window.GEMasterData={
      state,
      getCollection:(name)=>Array.isArray(state?.[name])?[...state[name]]:[],
      getCurrencies:()=>[...(state?.currencies||[])],
      getExchangeRates:()=>[...(state?.exchangeRates||[])],
      getStations:()=>[...(state?.airports||[])],
      getPersonnel:()=>[...(state?.personnel||[])],
      getTouchPoints:()=>[...(state?.touchpoints||[])],
      getTypes:(type)=>rows().filter(x=>x.kind===type),
      ready:true
    };
    window.dispatchEvent(new CustomEvent('ge-master-data-ready'));
  }
  async function init(){const main=document.querySelector('body > .shell > .main')||document.querySelector('main');const existing=main?.querySelector('.ge-panel');const tabs=existing?.querySelector('.ge-ref-tabs');if(!tabs)return;
    const tabButton=document.createElement('button');tabButton.type='button';tabButton.textContent='Jenis & Referensi';tabButton.dataset.planningTab='1';tabs.prepend(tabButton);
    const idButton=document.createElement('button');idButton.type='button';idButton.textContent='ID';idButton.dataset.idTab='1';tabs.insertBefore(idButton, tabs.querySelector('[data-ref-tab]'));
    host.hidden=true;idHost.hidden=true;existing.appendChild(host);existing.appendChild(idHost);
    const select=()=>{const selected=tabButton.classList.contains('active'),selectedId=idButton.classList.contains('active');existing.querySelectorAll(':scope > :not(.ge-ref-tabs):not(#geIdCatalog):not(#geEntityCatalog)').forEach(el=>el.hidden=selected||selectedId);host.hidden=!selected;idHost.hidden=!selectedId};
    const activate=which=>{tabs.querySelectorAll('button').forEach(b=>b.classList.remove('active'));which.classList.add('active');select()};
    tabButton.onclick=()=>activate(tabButton);idButton.onclick=()=>{activate(idButton);renderEntities()};
    tabs.querySelectorAll('[data-ref-tab]').forEach(b=>b.addEventListener('click',()=>{tabButton.classList.remove('active');idButton.classList.remove('active');select()}));
    const bind=(id,event,handler)=>{const el=$(id);if(el)el[event]=handler;return el};
    bind('idCatalogType','onchange',e=>{kind=e.target.value;render()});
    bind('idCatalogSearch','oninput',render);
    bind('idCatalogAdd','onclick',()=>edit());
    bind('idCatalogTemplate','onclick',()=>download('id,name,status,note\r\n',`Template_ID_${kind}.csv`));
    bind('idCatalogExport','onclick',()=>download('id,name,status,note\r\n'+rows().map(x=>[x.id,x.name,x.status,x.note].map(csvCell).join(',')).join('\r\n'),`ID_${kind}.csv`));
    bind('idCatalogUpload','onclick',()=>$('idCatalogFile')?.click());
    bind('idCatalogFile','onchange',e=>{upload(e.target.files?.[0]);e.target.value=''});
    try{await GEStore.waitAuth();state=await GEStore.hydrate(['referenceCatalog','serviceAlignments','airlines','aircraftConfigs','currencies','exchangeRates','touchpoints','personnel','airports','groundHandlers','serviceProcurement','boSpaces','airportSystems','lounges','facilities']);publishMasterReferences();render();tabButton.click();renderEntities();status('Daftar referensi siap dikelola.')}
    catch(e){$('idCatalogRows').innerHTML='<tr><td colspan="5">Katalog belum dapat dimuat. Coba buka ulang halaman.</td></tr>';status(e.message)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
