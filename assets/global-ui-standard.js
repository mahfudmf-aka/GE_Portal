/* GLOBAL UI STANDARD — canonical runtime normalization for shared controls. */
(function(){
  'use strict';
  if(window.__GE_GLOBAL_UI_STANDARD__) return;
  window.__GE_GLOBAL_UI_STANDARD__=true;

  const labels=[
    [/^Simpan Perubahan$/i,'Save Changes'],
    [/^Simpan Update$/i,'Save Update'],
    [/^Simpan Service$/i,'Save Service'],
    [/^Simpan Kegiatan$/i,'Save Activity'],
    [/^Simpan Draft$/i,'Save Draft'],
    [/^Simpan Presentation$/i,'Save Presentation'],
    [/^Simpan Layout Draft$/i,'Save Layout Draft'],
    [/^Simpan Menu Draft$/i,'Save Menu Draft'],
    [/^Simpan$/i,'Save'],
    [/^Batal Koreksi$/i,'Cancel Correction'],
    [/^Batal$/i,'Cancel'],
    [/^Hapus$/i,'Delete'],
    [/^Tutup$/i,'Close'],
    [/^Unduh Template$/i,'Download Template'],
    [/^Unduh CSV Template$/i,'Download CSV Template'],
    [/^Unduh Data$/i,'Download Data'],
    [/^Unggah Data$/i,'Upload Data'],
    [/^Unggah Dokumen$/i,'Upload Document'],
    [/^Tambah (.+)$/i,'Add $1'],
    [/^\+ Tambah (.+)$/i,'+ Add $1'],
    [/^Kembali ke (.+)$/i,'Back to $1'],
    [/^Kembali$/i,'Back'],
    [/^Cari$/i,'Search'],
    [/^Reset$/i,'Reset']
  ];

  function actionElements(root=document){
    return root.querySelectorAll?.('#cleanPageOutlet button, #cleanPageOutlet a.btn, #cleanPageOutlet .ge-btn, #cleanPageOutlet input[type="button"], #cleanPageOutlet input[type="submit"], .modal-backdrop button, .modal-backdrop .btn, .modal-backdrop .ge-btn, .tp-modal-backdrop button, .tp-modal-backdrop .btn, .tp-modal-backdrop .ge-btn, .ge-viewport-overlay button, .ge-viewport-overlay .btn, .ge-viewport-overlay .ge-btn')||[];
  }
  function normalize(root=document){
    actionElements(root).forEach(el=>{
      if(el.dataset.uiStandardSkip==='1') return;
      const text=(el.textContent||'').replace(/\s+/g,' ').trim();
      for(const [re,out] of labels){
        if(re.test(text)){
          el.textContent=out.replace('$1',text.replace(re,'$1'));
          break;
        }
      }
    });
  }
  function init(){
    normalize(document);
    new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1)normalize(n)}))).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
