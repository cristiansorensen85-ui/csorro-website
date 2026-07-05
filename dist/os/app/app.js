(function(){
  const qs=(s)=>document.querySelector(s);
  document.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); const s=qs('.search'); if(s) s.classList.add('pulse'); setTimeout(()=>s&&s.classList.remove('pulse'),500); }});
  async function loadLiveWorkspaceData(){
    if(!window.CSorroPlatform) return;
    const switcher=qs('#sidebarWorkspaceSwitcher');
    const list=await CSorroPlatform.workspaces().catch(()=>[]);
    if(switcher && list && list.length){ switcher.innerHTML=''; list.forEach(w=>{ const opt=document.createElement('option'); opt.value=w.id; opt.textContent=w.name; switcher.appendChild(opt); }); }
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(loadLiveWorkspaceData,120));
})();
