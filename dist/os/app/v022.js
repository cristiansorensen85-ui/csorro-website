
(function(){
  const master=document.querySelector('[data-showcase-master]');
  if(master){const panel=document.querySelector('[data-showcase]'); master.onchange=()=>panel.classList.toggle('enabled',master.checked);}
  const feed=document.getElementById('networkFeed');
  if(feed){
    const key='csorroNetwork022';
    const seed=[
      {type:'Product Update',name:'CSorro OS',text:'v0.1 foundation is being built: private workspaces, project hubs, people permissions, network feed and public showcase controls.',img:''},
      {type:'Looking for Work',name:'Thumbnail Artist',text:'Open for Minecraft and podcast artwork this month. View my portfolio and invite me to a project.',img:''},
      {type:'Hiring',name:'RyanNotBrian Workspace',text:'Looking for a Minecraft builder for a short production. Apply through CSorro and attach portfolio examples.',img:''}
    ];
    let posts=JSON.parse(localStorage.getItem(key)||'null')||seed;
    function esc(s){return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
    function render(){feed.innerHTML=posts.map(p=>`<article class="feed-post"><header><div><strong>${esc(p.name)}</strong><p class="type">${esc(p.type)}</p></div><span class="muted">Network</span></header><p>${esc(p.text)}</p>${p.img?`<img src="${esc(p.img)}" alt="Post image"/>`:''}<div class="feed-actions"><button>View Portfolio</button><button>Message</button><button>Invite to Project</button></div></article>`).join('');}
    document.getElementById('addPost')?.addEventListener('click',()=>{const text=document.getElementById('postText').value.trim(); if(!text)return; posts.unshift({type:document.getElementById('postType').value,name:'Cristian / CSorro',text,img:document.getElementById('postImage').value.trim()}); localStorage.setItem(key,JSON.stringify(posts)); document.getElementById('postText').value=''; document.getElementById('postImage').value=''; render();});
    render();
  }
})();
