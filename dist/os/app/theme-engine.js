(function(){
  const defaults={theme:'midnight',accent:'amber',density:'comfortable',focus:'off'};
  const read=(k)=>localStorage.getItem('csorro_'+k)||defaults[k];
  function apply(){
    document.body.dataset.theme=read('theme');
    document.body.dataset.accent=read('accent');
    document.body.dataset.density=read('density');
    document.body.dataset.focus=read('focus');
    document.querySelectorAll('[data-theme-choice]').forEach(b=>b.classList.toggle('active',b.dataset.themeChoice===read('theme')));
    document.querySelectorAll('[data-accent-choice]').forEach(b=>b.classList.toggle('active',b.dataset.accentChoice===read('accent')));
    document.querySelectorAll('[data-density-choice]').forEach(b=>b.classList.toggle('active',b.dataset.densityChoice===read('density')));
    document.querySelectorAll('[data-focus-toggle]').forEach(b=>b.textContent=read('focus')==='on'?'Turn Focus Off':'Turn Focus On');
  }
  window.csorroAppearance={setTheme(v){localStorage.setItem('csorro_theme',v);apply()},setAccent(v){localStorage.setItem('csorro_accent',v);apply()},setDensity(v){localStorage.setItem('csorro_density',v);apply()},toggleFocus(){localStorage.setItem('csorro_focus',read('focus')==='on'?'off':'on');apply()},apply};
  document.addEventListener('click',function(e){
    const theme=e.target.closest('[data-theme-choice]'); if(theme){window.csorroAppearance.setTheme(theme.dataset.themeChoice);return;}
    const accent=e.target.closest('[data-accent-choice]'); if(accent){window.csorroAppearance.setAccent(accent.dataset.accentChoice);return;}
    const density=e.target.closest('[data-density-choice]'); if(density){window.csorroAppearance.setDensity(density.dataset.densityChoice);return;}
    const focus=e.target.closest('[data-focus-toggle]'); if(focus){window.csorroAppearance.toggleFocus();return;}
  });
  document.addEventListener('keydown',function(e){
    if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='f'){e.preventDefault();window.csorroAppearance.toggleFocus();}
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
