(function(){
let mode='signin';
const $=s=>document.querySelector(s);
function setMode(next){mode=next; $('#signInTab').classList.toggle('active',mode==='signin'); $('#signUpTab').classList.toggle('active',mode==='signup'); $('#fullName').style.display=mode==='signup'?'block':'none'; $('#authTitle').textContent=mode==='signin'?'Sign in':'Create account'; $('#authIntro').textContent=mode==='signin'?'Use your CSorro account to access your workspaces.':'Create your CSorro account and start with a private workspace.'; $('#authSubmit').textContent=mode==='signin'?'Sign in':'Create account';}
$('#signInTab').onclick=()=>setMode('signin'); $('#signUpTab').onclick=()=>setMode('signup');
$('#authForm').onsubmit=async e=>{e.preventDefault(); const msg=$('#authMessage'); msg.textContent='Working...'; try{const email=$('#email').value.trim(), password=$('#password').value, name=$('#fullName').value.trim(); const res=mode==='signin'?await CSorroPlatform.signIn(email,password):await CSorroPlatform.signUp(email,password,name); if(res.error) throw res.error; msg.textContent=mode==='signin'?'Signed in. Opening Mission Control...':'Account created. Check email if confirmation is enabled, then sign in.'; if(mode==='signin') setTimeout(()=>location.href='/os/app/',700);}catch(err){msg.textContent=err.message||'Something went wrong.';}};
})();
