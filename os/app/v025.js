
(function(){
  const $=(s,scope=document)=>scope.querySelector(s);
  const $$=(s,scope=document)=>Array.from(scope.querySelectorAll(s));
  const commands=[
    {icon:'⌘', title:'Open Mission Control', hint:'Dashboard overview', url:'/os/app/'},
    {icon:'▧', title:'Open Projects', hint:'Production hub and project boards', url:'/os/app/projects/'},
    {icon:'◈', title:'Open Studio Review', hint:'Timestamp notes and approvals', url:'/os/app/studio/'},
    {icon:'▤', title:'Open Files', hint:'Workspace storage and assets', url:'/os/app/storage/'},
    {icon:'◷', title:'Open Calendar', hint:'Schedule and recording plan', url:'/os/app/calendar/'},
    {icon:'◎', title:'Open People', hint:'Teams, clients and creators', url:'/os/app/people/'},
    {icon:'⚙', title:'Open Settings', hint:'Theme, workspace and account controls', url:'/os/app/settings/'},
    {icon:'✦', title:'Prepare client update', hint:'CORE will group progress and blockers', action:'toast'},
    {icon:'✓', title:'Create review checklist', hint:'Turn studio notes into tasks', action:'toast'}
  ];
  function toast(msg){
    let t=$('.v25-toast');
    if(!t){t=document.createElement('div');t.className='v25-toast';document.body.appendChild(t)}
    t.textContent=msg||'Sorro OS action prepared';
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),2400);
  }
  function ensurePalette(){
    let wrap=$('.v25-palette-backdrop');
    if(wrap) return wrap;
    wrap=document.createElement('div');
    wrap.className='v25-palette-backdrop';
    wrap.innerHTML=`<section class="v25-palette" role="dialog" aria-modal="true" aria-label="Sorro command palette">
      <header><span class="v25-pill">CORE</span><input id="v25CommandInput" placeholder="Search Sorro OS or run a command..." autocomplete="off"><kbd>Esc</kbd></header>
      <div class="v25-results" id="v25Results"></div>
    </section>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap) closePalette()});
    $('#v25CommandInput',wrap).addEventListener('input',renderResults);
    $('#v25CommandInput',wrap).addEventListener('keydown',e=>{
      const items=$$('.v25-result',wrap); let idx=items.findIndex(x=>x.classList.contains('active'));
      if(e.key==='ArrowDown'){e.preventDefault(); items[Math.min(items.length-1,idx+1)]?.classList.add('active'); if(idx>=0)items[idx].classList.remove('active')}
      if(e.key==='ArrowUp'){e.preventDefault(); items[Math.max(0,idx-1)]?.classList.add('active'); if(idx>=0)items[idx].classList.remove('active')}
      if(e.key==='Enter'){e.preventDefault(); (items[idx]||items[0])?.click()}
    });
    renderResults();
    return wrap;
  }
  function renderResults(){
    const wrap=ensurePalette();
    const q=($('#v25CommandInput',wrap).value||'').toLowerCase().trim();
    const out=$('#v25Results',wrap);
    const list=commands.filter(c=>!q || (c.title+' '+c.hint).toLowerCase().includes(q)).slice(0,7);
    out.innerHTML=list.map((c,i)=>`<button class="v25-result ${i===0?'active':''}" data-url="${c.url||''}" data-action="${c.action||''}">
      <i>${c.icon}</i><span><b>${c.title}</b><small>${c.hint}</small></span><em>↵</em></button>`).join('');
    $$('.v25-result',out).forEach(btn=>btn.addEventListener('click',()=>{
      const action=btn.dataset.action, url=btn.dataset.url;
      closePalette();
      if(action==='toast') toast(btn.querySelector('b').textContent+' prepared');
      else if(url) location.href=url;
    }));
  }
  function openPalette(){
    const wrap=ensurePalette();
    wrap.classList.add('open');
    renderResults();
    setTimeout(()=>$('#v25CommandInput',wrap)?.focus(),30);
  }
  function closePalette(){ $('.v25-palette-backdrop')?.classList.remove('open'); }
  function initTheme(){
    const saved=localStorage.getItem('sorro-theme')||'neo';
    document.body.dataset.theme=saved;
    document.body.dataset.density=localStorage.getItem('sorro-density')||'comfortable';
    $$('[data-v25-theme]').forEach(b=>b.addEventListener('click',()=>{document.body.dataset.theme=b.dataset.v25Theme;localStorage.setItem('sorro-theme',b.dataset.v25Theme);toast('Theme set to '+b.dataset.v25Theme)}));
    $$('[data-v25-density]').forEach(b=>b.addEventListener('click',()=>{document.body.dataset.density=b.dataset.v25Density;localStorage.setItem('sorro-density',b.dataset.v25Density);toast('Density set to '+b.dataset.v25Density)}));
  }
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPalette()}
    if(e.key==='Escape') closePalette();
  });
  document.addEventListener('DOMContentLoaded',()=>{
    initTheme();
    $$('.command-search,#openCommand,.os-search-trigger,[data-open-command]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();openPalette()}));
    $$('.v25-toast-trigger').forEach(el=>el.addEventListener('click',()=>toast(el.dataset.toast||'Saved in Sorro OS')));
  });
  window.SorroCommandPalette={open:openPalette,toast};
})();
