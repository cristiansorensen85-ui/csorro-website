(function(){
  const feed=document.getElementById('networkFeed');
  const form=document.getElementById('networkComposer');
  const type=document.getElementById('postType');
  const title=document.getElementById('postTitle');
  const body=document.getElementById('postBody');
  const link=document.getElementById('postLink');
  const image=document.getElementById('postImage');
  const status=document.getElementById('networkStatus');
  const filters=document.querySelectorAll('[data-network-filter]');
  let active='all';
  let posts=[];

  function label(t){
    return ({looking_for_work:'Looking for Work',hiring:'Hiring',showcase:'Showcase',product_update:'Product Update',tutorial:'Tutorial',community_question:'Question',general:'General'}[t]||t||'General');
  }
  function tone(t){ return t==='hiring'?'green':t==='looking_for_work'?'amber':t==='showcase'?'blue':'purple'; }
  function escape(s){ return String(s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function initials(name){ return (name||'CS').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase(); }
  function author(p){ return p.author_name || p.author_display_name || p.title_author || 'CSorro Member'; }
  function render(){
    if(!feed) return;
    const shown=posts.filter(p=>active==='all'||p.post_type===active);
    if(!shown.length){
      feed.innerHTML='<article class="os-card empty-state"><h3>No posts yet</h3><p>Create the first professional update, hiring post or showcase.</p></article>';
      return;
    }
    feed.innerHTML=shown.map(p=>`<article class="network-post-card" data-post-id="${escape(p.id)}">
      <header>
        <span class="network-avatar">${escape(initials(author(p)))}</span>
        <div><strong>${escape(author(p))}</strong><small>${escape(label(p.post_type))} · ${new Date(p.created_at||Date.now()).toLocaleDateString()}</small></div>
        <span class="mini-label ${tone(p.post_type)}">${escape(label(p.post_type))}</span>
      </header>
      ${p.title?`<h3>${escape(p.title)}</h3>`:''}
      <p>${escape(p.body)}</p>
      ${p.image_url?`<div class="network-image"><img src="${escape(p.image_url)}" alt="Network post image" loading="lazy"></div>`:''}
      <footer>
        <button data-like-post="${escape(p.id)}">♡ ${p.like_count||0}</button>
        <button>💬 ${p.comment_count||0}</button>
        ${p.link_url?`<a href="${escape(p.link_url)}">Open link</a>`:'<button>View profile</button>'}
        <button>Invite</button>
      </footer>
    </article>`).join('');
  }
  async function load(){
    const local=JSON.parse(localStorage.getItem('csorroNetworkPosts')||'[]');
    const live=window.CSorroPlatform ? await CSorroPlatform.networkPosts().catch(()=>[]) : [];
    posts=[...local, ...live];
    render();
  }
  filters.forEach(btn=>btn.addEventListener('click',()=>{
    active=btn.dataset.networkFilter;
    filters.forEach(b=>b.classList.toggle('active', b===btn));
    render();
  }));
  form?.addEventListener('submit', async e=>{
    e.preventDefault();
    const payload={ post_type:type.value, title:title.value.trim(), body:body.value.trim(), link_url:link.value.trim(), image_url:image.value.trim(), visibility:'network' };
    if(!payload.body){ body.focus(); return; }
    status.textContent='Posting...';
    try{
      const created=window.CSorroPlatform ? await CSorroPlatform.createNetworkPost(payload) : payload;
      posts.unshift({ ...created, author_name:'You' });
      form.reset();
      status.textContent='Posted to Network';
      render();
    }catch(err){
      status.textContent=err.message || 'Could not post yet';
    }
  });
  load();
})();
