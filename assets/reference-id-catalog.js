/* Planning category editor within the existing Master Data tabs. */
(function(){
  'use strict';
  if(!/master-data(?:\.html)?$/i.test(new URLSearchParams(location.search).get('page')||location.pathname.split('/').pop()||''))return;
  const types=[
    ['providerCategory','Jenis Service & Provider'],['spaceType','Jenis Space & Building'],
    ['materialType','Jenis Material, Tools & Equipment'],['systemType','Jenis Airport Systems'],
    ['planningDocumentType','Jenis Planning Documents']
  ];
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const names=Object.fromEntries(types);
  const baseCategories={providerCategory:[['LOUNGE','Lounge / Tenant / Snack Box'],['GHA','Ground Handling Agent'],['AIRPORT_OPERATOR','Airport Operator']],spaceType:[['OFFICE','Perkantoran'],['SERVICE','Area Layanan']],materialType:[['DOCUMENT','Dokumen'],['LABEL','Label'],['TOOLS','Tools'],['EQUIPMENT','Equipment']],systemType:[['HARDWARE','Hardware'],['SOFTWARE','Software']],planningDocumentType:[['FRA','FRA'],['TOR','TOR']]};
  let state,kind=types[0][0];
  const canEdit=()=>typeof gxCanManage==='function'?!!gxCanManage():['Super Admin','Admin'].includes((window.gxGetSession?.()||{}).role);
  const host=document.createElement('section');host.className='ge-panel ge-id-catalog';host.id='geIdCatalog';
  host.innerHTML=`<h2>Jenis Planning Workspace</h2><p>Kelola jenis halaman Planning. Ground Touch Points dan Journey Area tetap menggunakan daftar referensi yang sudah ada; pengelompokannya dapat diubah melalui Ground Touch Points.</p>
    <div class="ge-ref-toolbar"><label>Kelompok <select id="idCatalogType" class="ge-input">${types.map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label>
    <input id="idCatalogSearch" class="ge-input" placeholder="Cari ID atau nama">
    <button id="idCatalogAdd" class="ge-btn primary" type="button">+ Tambah Satuan</button>
    <button id="idCatalogTemplate" class="ge-btn" type="button">Unduh Template</button>
    <button id="idCatalogUpload" class="ge-btn" type="button">Upload Data</button>
    <button id="idCatalogExport" class="ge-btn" type="button">Unduh Data</button>
    <button id="idCatalogInventory" class="ge-btn" type="button">Unduh Inventaris Existing</button>
    <input id="idCatalogFile" type="file" accept=".csv,text/csv" hidden></div>
    <div class="ge-table-wrap"><table><thead><tr><th>ID</th><th>Nama</th><th>Status</th><th>Catatan</th><th>Aksi</th></tr></thead><tbody id="idCatalogRows"><tr><td colspan="5">Memuat katalog…</td></tr></tbody></table></div>
    <p id="idCatalogStatus" role="status" aria-live="polite"></p>
    <div id="idCatalogDialog" class="ge-id-dialog" hidden></div>`;
  function $(id){return host.querySelector('#'+id)}
  function rows(){const stored=(state?.referenceCatalog||[]).filter(x=>x.kind===kind);return [...(baseCategories[kind]||[]).filter(([id])=>!stored.some(x=>x.id===id)).map(([id,name])=>({kind,id,name,status:'Active',note:'Kategori dasar',builtIn:true})),...stored]}
  function status(message){$('idCatalogStatus').textContent=message}
  function render(){const q=$('idCatalogSearch').value.trim().toLocaleLowerCase();const r=rows().filter(x=>[x.id,x.name,x.note].some(v=>String(v||'').toLocaleLowerCase().includes(q)));
    $('idCatalogRows').innerHTML=r.map(x=>`<tr><td><code>${esc(x.id)}</code></td><td>${esc(x.name)}</td><td>${esc(x.status||'Active')}</td><td>${esc(x.note||'—')}</td><td>${x.builtIn?'Kategori dasar':canEdit()?`<button type="button" class="ge-btn compact" data-edit="${esc(x.id)}">Edit</button> <button type="button" class="ge-btn compact" data-remove="${esc(x.id)}">Nonaktifkan</button>`:'—'}</td></tr>`).join('')||'<tr><td colspan="5">Belum ada ID pada kategori ini.</td></tr>';
    host.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>edit((state.referenceCatalog||[]).find(x=>x.kind===kind&&x.id===b.dataset.edit)));
    host.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>remove((state.referenceCatalog||[]).find(x=>x.kind===kind&&x.id===b.dataset.remove)));
    ['idCatalogAdd','idCatalogUpload'].forEach(id=>$(id).hidden=!canEdit());
  }
  function dialog(title,content,save){const d=$('idCatalogDialog');d.hidden=false;d.innerHTML=`<div class="ge-id-backdrop"><div class="ge-id-modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h3>${esc(title)}</h3>${content}<p id="idDialogStatus" role="status"></p><div class="ge-id-actions"><button type="button" data-cancel class="ge-btn">Batal</button><button type="button" data-save class="ge-btn primary">Simpan</button></div></div></div>`;
    d.querySelector('[data-cancel]').onclick=()=>{d.hidden=true;d.replaceChildren()};d.querySelector('[data-save]').onclick=async e=>{e.target.disabled=true;try{await save(d);d.hidden=true;d.replaceChildren();render()}catch(err){d.querySelector('#idDialogStatus').textContent='Gagal menyimpan: '+err.message;e.target.disabled=false}};
  }
  async function persist(){GEStore.save(state);await GEStore.flush();status('Data berhasil disimpan ke Firestore.')}
  function edit(x){dialog(x?'Edit ID':'Tambah ID',`<label>ID / Kode <input id="idEditCode" class="ge-input" value="${esc(x?.id||'')}" ${x?'readonly':''} placeholder="Contoh: GHA"></label><label>Nama <input id="idEditName" class="ge-input" value="${esc(x?.name||'')}"></label><label>Catatan <input id="idEditNote" class="ge-input" value="${esc(x?.note||'')}"></label><label>Status <select id="idEditState" class="ge-input"><option ${x?.status!=='Inactive'?'selected':''}>Active</option><option ${x?.status==='Inactive'?'selected':''}>Inactive</option></select></label>`,async d=>{
    const code=d.querySelector('#idEditCode').value.trim(),name=d.querySelector('#idEditName').value.trim();if(!code||!name)throw Error('ID dan nama wajib diisi.');if(!x&&rows().some(v=>v.id.toLocaleLowerCase()===code.toLocaleLowerCase()))throw Error('ID sudah ada pada kategori ini.');
    const item={...x,kind,id:code,name,note:d.querySelector('#idEditNote').value.trim(),status:d.querySelector('#idEditState').value};if(x)Object.assign(x,item);else state.referenceCatalog.push(item);await persist();
  })}
  function remove(x){if(!x)return;dialog('Nonaktifkan ID',`<p>ID <b>${esc(x.id)}</b> akan dinonaktifkan. ID dan riwayat pemakaiannya tetap tersimpan.</p>`,async()=>{x.status='Inactive';await persist()})}
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
  async function init(){const main=document.querySelector('body > .shell > .main')||document.querySelector('main');const existing=main?.querySelector('.ge-panel');const tabs=existing?.querySelector('.ge-ref-tabs');if(!tabs)return;
    const tabButton=document.createElement('button');tabButton.type='button';tabButton.textContent='Jenis Planning Workspace';tabButton.dataset.planningTab='1';tabs.appendChild(tabButton);
    host.hidden=true;existing.insertAdjacentElement('afterend',host);
    const select=()=>{const selected=tabButton.classList.contains('active');existing.querySelectorAll(':scope > :not(.ge-ref-tabs)').forEach(el=>el.hidden=selected);host.hidden=!selected};
    tabButton.onclick=()=>{tabs.querySelectorAll('button').forEach(b=>b.classList.remove('active'));tabButton.classList.add('active');select()};
    tabs.querySelectorAll('[data-ref-tab]').forEach(b=>b.addEventListener('click',()=>{tabButton.classList.remove('active');select()}));
    $('idCatalogType').onchange=e=>{kind=e.target.value;render()};$('idCatalogSearch').oninput=render;$('idCatalogAdd').onclick=()=>edit();$('idCatalogTemplate').onclick=()=>download('id,name,status,note\r\n',`Template_ID_${kind}.csv`);$('idCatalogExport').onclick=()=>download('id,name,status,note\r\n'+rows().map(x=>[x.id,x.name,x.status,x.note].map(csvCell).join(',')).join('\r\n'),`ID_${kind}.csv`);$('idCatalogInventory').onclick=inventory;$('idCatalogUpload').onclick=()=>$('idCatalogFile').click();$('idCatalogFile').onchange=e=>{upload(e.target.files?.[0]);e.target.value=''};
    try{await GEStore.waitAuth();state=await GEStore.hydrate(['referenceCatalog']);render();status('Jenis Planning siap dikelola.')}
    catch(e){$('idCatalogRows').innerHTML='<tr><td colspan="5">Katalog belum dapat dimuat. Coba buka ulang halaman.</td></tr>';status(e.message)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
