
(function(){
const key='csorroGlobalMessages039';
const seed={active:'sarah',convos:{
 sarah:{name:'Sarah Thompson',context:'Request · outside workspace',type:'request',messages:[['Sarah','Hi Cristian, I am a thumbnail artist and would love to show you my portfolio.'],['You','Thanks Sarah, send your portfolio and availability.']]},
 ryan:{name:'Ryan',context:'RyanNotBrian / Recording Prep',type:'project',messages:[['Ryan','Can we move the recording to 7pm and keep artwork approval in the private room?']]},
 team:{name:'CSorro Team',context:'CSorro Ltd / Announcements',type:'workspace',messages:[['CSorro Team','Build feedback has been added to the OS project hub.']]},
 tom:{name:'Tom Builder',context:'Direct message',type:'dm',messages:[['Tom','I have uploaded the world build screenshots for review.']]}
}};
let state=JSON.parse(localStorage.getItem(key)||'null')||seed; const save=()=>localStorage.setItem(key,JSON.stringify(state));
const $=s=>document.querySelector(s); function esc(s){return String(s||'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function render(){const list=$('#globalConversationList'), body=$('#globalConversationBody'), title=$('#globalThreadTitle'); if(!list||!body)return; list.innerHTML=Object.entries(state.convos).map(([id,c])=>`<article class="${state.active===id?'active':''}" data-id="${id}"><b>${esc(c.name)}</b><small>${esc(c.context)}</small><p>${esc((c.messages.at(-1)||['',''])[1])}</p><span class="mini-label ${c.type==='request'?'green':c.type==='project'?'amber':'blue'}">${esc(c.type)}</span></article>`).join(''); list.querySelectorAll('[data-id]').forEach(a=>a.onclick=()=>{state.active=a.dataset.id; save(); render();}); const c=state.convos[state.active]||Object.values(state.convos)[0]; title.innerHTML=`<h2>${esc(c.name)}</h2><p class="muted">${esc(c.context)} · ${c.type==='request'?'not in a workspace yet':'CSorro message layer'}</p>`; body.innerHTML=c.messages.map(m=>`<div class="message ${m[0]==='You'?'me':''}"><b>${esc(m[0])}</b>${esc(m[1])}<small>Now</small></div>`).join(''); body.scrollTop=body.scrollHeight;}
$('#globalMsgForm')?.addEventListener('submit',e=>{e.preventDefault(); const input=$('#globalMsgInput'); const c=state.convos[state.active]; const txt=input.value.trim(); if(!txt||!c)return; c.messages.push(['You',txt]); input.value=''; save(); render();});
$('#newGlobalMessage')?.addEventListener('click',()=>{const name=prompt('Who is the message to/from?'); if(!name)return; const id=name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+Date.now().toString(36); state.convos[id]={name,context:'Direct message',type:'dm',messages:[[name,'New conversation started.']]}; state.active=id; save(); render();});
render();
})();
