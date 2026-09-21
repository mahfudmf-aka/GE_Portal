(function(){
  function toClean(href){
    if(!href) return href;
    var m=href.match(/(?:^|\/)([^\/?#]+)\.html(?:\?([^#]*))?/);
    if(!m || m[1]==='login' || m[1]==='change-password') return href;
    var route=m[1], q=m[2]||'';
    var alias=(window.P40_CLEAN_ALIASES||{})[route]||route;
    var parts=alias.split('?'); route=parts[0];
    var params=new URLSearchParams(parts[1]||'');
    new URLSearchParams(q).forEach((v,k)=>params.set(k,v));
    params.set('page',route);
    return 'app.html?'+params.toString();
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href]'); if(!a) return;
    var h=a.getAttribute('href'); if(!h || /^(https?:|mailto:|tel:|#)/i.test(h)) return;
    var n=toClean(h); if(n!==h){e.preventDefault(); location.href=n;}
  },true);
  window.p40CleanRoute=toClean;
})();