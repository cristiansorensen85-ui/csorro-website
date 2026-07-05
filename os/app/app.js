const greetingEl=document.getElementById("greeting");const coreTitle=document.getElementById("coreTitle");const corePanel=document.getElementById("corePanel");const coreResponse=document.getElementById("coreResponse");const coreQuestion=document.getElementById("coreQuestion");
function updateGreeting(){const h=new Date().getHours();let g="Good Morning",s="Morning";if(h>=12&&h<18){g="Good Afternoon";s="Afternoon"}if(h>=18){g="Good Evening";s="Evening"}greetingEl.textContent=`${g}, Cristian.`;coreTitle.innerHTML=`${s} Cristian.<br/>I’ve organised your day.`}
function openCore(q=""){corePanel.classList.remove("hidden");if(q){coreQuestion.value=q;answerCore(q)}else setTimeout(()=>coreQuestion.focus(),80)}
function closeCore(){corePanel.classList.add("hidden")}
function answerCore(raw){const q=(raw||coreQuestion.value||"").trim();if(!q)return;coreResponse.innerHTML=`<div class="message"><b>You</b><p>${q}</p></div><div class="message"><b>CORE</b><p class="thinking">Checking OS data first...</p></div>`;setTimeout(()=>{let r="I searched your OS first. Here are the most relevant results.";let groups=[["Projects",[["Ryan Recording","Starts in 2 hours"],["Hull Podcast Artwork","Awaiting approval"],["CSorro OS","Active build"]]],["Assets",[["Episode17_Thumbnail_Final.png","RyanNotBrian / Assets"],["HullPodcast_Artwork_v2.png","Hull Podcast / Artwork"]]],["People",[["Ryan","Creator"],["New Creator Applicant","Needs review"]]]];if(q.toLowerCase().includes("first")||q.toLowerCase().includes("briefing"))r="Start with Hull Podcast artwork because it is blocking the next step. Then prepare Ryan recording.";let html=`<div class="message"><b>CORE</b><p>${r}</p><div class="os-first">OS data first • Web later</div>`;groups.forEach(([name,rows])=>{html+=`<div class="result-group"><h4>${name}</h4>`;rows.forEach(([a,b])=>html+=`<div class="result"><strong>${a}</strong><span>${b}</span></div>`);html+=`</div>`});coreResponse.innerHTML=`<div class="message"><b>You</b><p>${q}</p></div>`+html+`</div>`},450)}
function loadWorkspace(){const saved=localStorage.getItem("csorroCurrentWorkspace");if(!saved)return;try{const w=JSON.parse(saved);const grid=document.getElementById("workspaceGrid");const card=document.createElement("article");card.className="workspace-card";card.dataset.coreQuery=`Open ${w.name}`;card.innerHTML=`<small class="tag active">${w.type||"Workspace"}</small><h3>${w.name}</h3><p>${(w.priorities||[]).slice(0,3).join(", ")||"Ready to organise."}</p><div class="bar"><i style="width:${w.progress||18}%"></i><span>${w.progress||18}%</span></div>`;grid.prepend(card)}catch(e){}}
updateGreeting();loadWorkspace();
document.getElementById("openCorePanel").addEventListener("click",()=>openCore());document.getElementById("openCoreMini").addEventListener("click",()=>openCore());document.getElementById("openCoreSearch").addEventListener("click",()=>openCore());document.getElementById("openFullBriefing").addEventListener("click",()=>openCore("Give me my full briefing"));document.getElementById("closeCorePanel").addEventListener("click",closeCore);document.getElementById("askCoreButton").addEventListener("click",()=>answerCore());coreQuestion.addEventListener("keydown",e=>{if(e.key==="Enter")answerCore()});document.querySelectorAll("[data-core-query],[data-query]").forEach(el=>el.addEventListener("click",()=>openCore(el.dataset.coreQuery||el.dataset.query)));document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openCore()}if(e.key==="Escape")closeCore()});

async function loadLiveWorkspaceData(){
  if(!window.CSorroPlatform) return;
  const switcher=document.getElementById('sidebarWorkspaceSwitcher');
  const grid=document.getElementById('workspaceGrid');
  const prof=await CSorroPlatform.profile().catch(()=>null);
  if(prof && greetingEl){
    const first=(prof.display_name||prof.full_name||'Cristian').split(' ')[0];
    const h=new Date().getHours();
    let g='Good Morning'; if(h>=12&&h<18) g='Good Afternoon'; if(h>=18) g='Good Evening';
    greetingEl.textContent=`${g}, ${first}.`;
  }
  const list=await CSorroPlatform.workspaces().catch(()=>[]);
  if(switcher && list.length){
    switcher.innerHTML='';
    list.forEach(w=>{
      const opt=document.createElement('option');
      opt.value=w.id; opt.textContent=`${w.name} · ${w.privacy||w.visibility||'Private'}`;
      switcher.appendChild(opt);
    });
  }
  if(grid && list.length){
    grid.innerHTML='';
    list.slice(0,6).forEach(w=>{
      const card=document.createElement('article');
      card.className='workspace-card';
      card.innerHTML=`<small class="tag active">${w.privacy||'Private'}</small><h3>${w.name}</h3><p>Live workspace from Supabase. Open it to create projects, invite people and manage privacy.</p><div class="bar"><i style="width:24%"></i><span>Live</span></div>`;
      card.addEventListener('click',()=>{ localStorage.setItem('csorroActiveWorkspaceId', w.id); location.href='/os/app/workspace/'; });
      grid.appendChild(card);
    });
  }
}

document.addEventListener('DOMContentLoaded',()=>setTimeout(loadLiveWorkspaceData,100));
