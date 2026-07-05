(function(){
  const buttons=document.querySelectorAll('[data-module]');
  buttons.forEach(btn=>btn.addEventListener('click', async ()=>{
    btn.classList.toggle('active');
    const workspaceId=localStorage.getItem('csorroActiveWorkspaceId') || 'demo-csorro';
    const enabled=btn.classList.contains('active');
    try{ if(window.CSorroPlatform) await CSorroPlatform.setWorkspaceModule(workspaceId, btn.dataset.module, enabled); }
    catch(err){ console.warn(err); }
  }));
})();
