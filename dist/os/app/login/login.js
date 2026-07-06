(function(){
  let mode='signin';
  const $=s=>document.querySelector(s);
  const params=new URLSearchParams(location.search);

  function setMessage(text, kind=''){
    const msg=$('#authMessage');
    msg.textContent=text;
    msg.classList.remove('auth-success','auth-error');
    if(kind) msg.classList.add(kind==='error'?'auth-error':'auth-success');
  }

  function setMode(next){
    mode=next;
    const isSignIn=mode==='signin', isSignup=mode==='signup', isRecover=mode==='recover', isReset=mode==='reset';
    $('#authTabs').style.display=isRecover||isReset?'none':'flex';
    $('#signInTab').classList.toggle('active',isSignIn);
    $('#signUpTab').classList.toggle('active',isSignup);
    $('#fullName').style.display=isSignup?'block':'none';
    $('#password').style.display=isRecover?'none':'block';
    $('#newPassword').style.display=isReset?'block':'none';
    $('#newPassword').required=isReset;
    $('#password').required=!isRecover;
    $('#forgotPassword').style.display=isSignIn?'inline-block':'none';
    $('#backToSignIn').style.display=isRecover||isReset?'inline-block':'none';

    const title={signin:'Sign in',signup:'Create account',recover:'Recover password',reset:'Set new password'}[mode];
    const intro={
      signin:'Use your Sorro account to access your workspaces.',
      signup:'Create your CSorro account and start with a private workspace.',
      recover:'Enter your email and CSorro will send a secure reset link.',
      reset:'Choose a new password for your CSorro account.'
    }[mode];
    const button={signin:'Sign in',signup:'Create account',recover:'Send recovery email',reset:'Update password'}[mode];
    $('#authTitle').textContent=title; $('#authIntro').textContent=intro; $('#authSubmit').textContent=button;
  }

  function detectRecovery(){
    const hash=new URLSearchParams((location.hash||'').replace(/^#/,''));
    if(params.get('mode')==='recovery' || hash.get('type')==='recovery'){
      setMode('reset');
      setMessage('Enter a new password to finish account recovery.','success');
      return true;
    }
    if(params.get('verified')) setMessage('Email confirmed. You can now sign in.','success');
    return false;
  }

  $('#signInTab').onclick=()=>{setMode('signin'); setMessage('Use your Sorro account to access your workspaces.');};
  $('#signUpTab').onclick=()=>{setMode('signup'); setMessage('Create your account. If email confirmation is enabled, check your inbox after submitting.');};
  $('#forgotPassword').onclick=()=>{setMode('recover'); setMessage('Enter your account email and we will send a recovery link.');};
  $('#backToSignIn').onclick=()=>{setMode('signin'); setMessage('Use your Sorro account to access your workspaces.');};

  $('#authForm').onsubmit=async e=>{
    e.preventDefault();
    const btn=$('#authSubmit');
    const original=btn.textContent;
    btn.disabled=true; btn.textContent='Working...'; setMessage('Working...');
    try{
      if(!window.CSorroPlatform || CSorroPlatform.status.mode!=='live') throw new Error('Supabase is not configured yet. Add your URL and anon key in /os/app/platform-config.js.');
      const email=$('#email').value.trim(), password=$('#password').value, name=$('#fullName').value.trim(), newPassword=$('#newPassword').value;
      let res;
      if(mode==='signin'){
        res=await CSorroPlatform.signIn(email,password);
        if(res.error) throw res.error;
        await CSorroPlatform.ensureProfile().catch(()=>null);
        setMessage('Signed in. Opening Mission Control...','success');
        setTimeout(()=>location.href='/os/app/',700);
      } else if(mode==='signup'){
        if(password.length<8) throw new Error('Password should be at least 8 characters.');
        res=await CSorroPlatform.signUp(email,password,name);
        if(res.error) throw res.error;
        setMessage('Account created. Check your email if confirmation is enabled, then sign in.','success');
        setMode('signin');
      } else if(mode==='recover'){
        res=await CSorroPlatform.sendPasswordReset(email);
        if(res.error) throw res.error;
        setMessage('Recovery email sent. Check your inbox and follow the secure link.','success');
      } else if(mode==='reset'){
        if(newPassword.length<8) throw new Error('New password should be at least 8 characters.');
        res=await CSorroPlatform.updatePassword(newPassword);
        if(res.error) throw res.error;
        setMessage('Password updated. Opening Mission Control...','success');
        setTimeout(()=>location.href='/os/app/',900);
      }
    }catch(err){ setMessage(err.message||'Something went wrong.','error'); }
    finally{ btn.disabled=false; btn.textContent=original; }
  };

  detectRecovery();
})();
