/* Read-only portfolio of existing planning records; child CRUD remains untouched. */
(function(){
  'use strict';
  const p=new URLSearchParams(location.search).get('page')||location.pathname.split('/').pop()?.replace(/\.html$/,'');
  if(p!=='planning-workspace')return;
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const groups=[
    ['service','Service & Provider','lounge-list.html'],['space','Space & Building','branch-office-planning.html?panel=space'],
    ['material','Station Material, Tools & Equipment','service-planning.html?panel=material'],
    ['system','Airport Systems','branch-office-planning.html?panel=systems'],
    ['document','Planning Documents','planning-documents.html'],['gaso','GASO','gaso-planning.html']
  ];
  const links=Object.fromEntries(groups.map(([id,,href])=>[id,href]));
  const host=document.createElement('section');host.id='gePlanningPortfolio';host.className='ge-planning-portfolio ge-panel';
  host.innerHTML=`<h2>All Planning / Portfolio Overview</h2><p>Record dari halaman existing; buka child untuk melihat atau mengubah detail. Angka berikut adalah jumlah record, bukan skor klasifikasi BO.</p>
    <div class="ge-planning-portfolio-filters"><label>Area <select id="portfolioArea" class="ge-input"><option value="">Semua area</option><option value="BO">BO / Airport / Station</option><option value="GASO">GASO</option></select></label>
    <label>Lokasi <select id="portfolioStation" class="ge-input"><option value="">Semua lokasi</option></select></label>
    <label>Kelompok <select id="portfolioGroup" class="ge-input"><option value="">Semua kelompok</option>${groups.map(([id,name])=>`<option value="${id}">${esc(name)}</option>`).join('')}</select></label>
    <label>Cari <input id="portfolioQuery" class="ge-input" placeholder="Nama, penyedia, referensi"></label></div>
    <div id="portfolioCounts" class="ge-planning-portfolio-counts"></div><div class="ge-table-wrap"><table><thead><tr><th>Kelompok</th><th>Jenis</th><th>Nama / Record</th><th>Lokasi</th><th>Provider / Referensi</th><th>Status</th><th>Detail</th></tr></thead><tbody id="portfolioRows"><tr><td colspan="7">Memuat data…</td></tr></tbody></table></div><p id="portfolioStatus" role="status"></p>`;
  function $(id){return host.querySelector('#'+id)}
  let all=[];
  const str=x=>Array.isArray(x)?x.join(', '):String(x??'');
  const loc=x=>str(x.stations||x.stationCodes||x.stationCode||x.airport||x.station||x.gasoCode||x.code||'').trim();
  function make(key,kind,x){const station=loc(x),type=str(x.serviceType||x.type||x.category||x.facilityType||x.materialType||kind);
    return {key,kind,type,name:str(x.name||x.serviceName||x.assetName||x.materialName||x.systemName||x.title||x.planningItem||x.officeName||x.area||x.location||'Record '+(x.id||'')),station,
      provider:str(x.provider||x.vendor||x.partner||x.reference||x.documentNumber||x.agreement||''),status:str(x.status||x.contractStatus||x.availability||''),id:x.id};
  }
  function collect(d){const list=[];function add(coll,key,kind){(d[coll]||[]).forEach(x=>list.push(make(key,kind,x)))}
    add('lounges','service','Lounge / Tenant / Snack Box');add('serviceProcurement','service','Service Procurement');
    add('boSpaces','space','Space & Building');add('stationMaterials','material','Station Material');
    add('airportSystems','system','Airport System');add('documents','document','Planning Document');
    add('gasoMaster','gaso','GASO Office');add('gasoServiceSupport','gaso','Service Support');add('gasoPlanningService','gaso','Planning Service');
    return list;
  }
  function render(){const area=$('portfolioArea').value,station=$('portfolioStation').value,group=$('portfolioGroup').value,q=$('portfolioQuery').value.toLocaleLowerCase().trim();
    const filtered=all.filter(x=>(!area||(area==='GASO')===(x.key==='gaso'))&&(!station||x.station.toUpperCase().split(/[,;]+/).map(s=>s.trim()).includes(station))&&(!group||x.key===group)&&(!q||[x.name,x.type,x.station,x.provider].join(' ').toLocaleLowerCase().includes(q)));
    $('portfolioCounts').innerHTML=groups.map(([key,name,href])=>`<a href="${href}"><b>${filtered.filter(x=>x.key===key).length}</b><span>${esc(name)}</span></a>`).join('');
    $('portfolioRows').innerHTML=filtered.map(x=>`<tr><td>${esc(groups.find(g=>g[0]===x.key)?.[1]||x.key)}</td><td>${esc(x.type)}</td><td>${esc(x.name)}</td><td>${esc(x.station||'—')}</td><td>${esc(x.provider||'—')}</td><td>${esc(x.status||'—')}</td><td><a class="ge-btn compact" href="${links[x.key]}">Buka child</a></td></tr>`).join('')||'<tr><td colspan="7">Tidak ada record pada filter ini.</td></tr>';
    $('portfolioStatus').textContent=`${filtered.length} dari ${all.length} record ditampilkan. Detail dan perubahan berada pada halaman child existing.`;
  }
  async function init(){const main=document.querySelector('body > .shell > .main')||document.querySelector('main');if(!main)return;const intro=main.querySelector('.ge-planning-workspace-intro');(intro||main.firstElementChild)?.insertAdjacentElement('afterend',host);
    ['portfolioArea','portfolioStation','portfolioGroup','portfolioQuery'].forEach(id=>$(id).addEventListener(id==='portfolioQuery'?'input':'change',render));
    try{await GEStore.waitAuth();const d=await GEStore.hydrate(['lounges','serviceProcurement','boSpaces','stationMaterials','airportSystems','documents','gasoMaster','gasoServiceSupport','gasoPlanningService','airports']);all=collect(d);const stations=[...new Set((d.airports||[]).map(x=>String(x.code||x.airportCode||x.iata||x.stationCode||'').toUpperCase()).concat(all.map(x=>x.station.toUpperCase())).filter(x=>x&&!x.includes(',')))].sort();$('portfolioStation').innerHTML='<option value="">Semua lokasi</option>'+stations.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');render()}
    catch(e){$('portfolioRows').innerHTML='<tr><td colspan="7">Data belum dapat dimuat. Coba buka kembali halaman.</td></tr>';$('portfolioStatus').textContent=e.message}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
