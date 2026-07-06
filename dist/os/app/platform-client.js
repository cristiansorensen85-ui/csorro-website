(function(){
  const cfg = window.SORRO_SUPABASE || {};
  const ready = !!(cfg.url && cfg.anonKey && window.supabase);
  const status = {
    mode: ready ? 'live' : 'demo',
    message: ready ? 'Connected to Supabase' : 'Demo mode: add Supabase URL + anon key in /os/app/platform-config.js'
  };
  const client = ready ? window.supabase.createClient(cfg.url, cfg.anonKey) : null;

  const demo = {
    profile: { id:'demo-user', display_name: 'Cristian Sorensen', full_name:'Cristian Sorensen', initials: 'C' },
    workspaces: [
      { id: 'demo-ryan', name: 'RyanNotBrian', privacy: 'Private', visibility:'private', project_count: 1 },
      { id: 'demo-csorro', name: 'CSorro Ltd', privacy: 'Private', visibility:'private', project_count: 1 },
      { id: 'demo-hull', name: 'Hull Podcast', privacy: 'Private', visibility:'private', project_count: 1 }
    ],
    projects: [
      { id: 'demo-recording', workspace_id: 'demo-ryan', name: 'Ryan Recording Prep', status: 'review', phase:'Review', progress:72, description: 'Recording prep, assets, thumbnail approval and team updates.' },
      { id: 'demo-os', workspace_id: 'demo-csorro', name: 'Sorro Build', status: 'active', phase:'Foundation', progress:51, description: 'Build the operating system foundation.' }
    ]
  };

  function initials(name){return (name||'C').split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase()||'C'}
  function redirectUrl(path='/os/app/login/'){ return `${window.location.origin}${path}`; }

  async function session(){ if(!client) return null; const { data } = await client.auth.getSession(); return data.session || null; }
  async function user(){ const s = await session(); return s ? s.user : null; }
  async function requireUser(){ const u = await user(); if(!u) throw new Error('Please sign in first.'); return u; }

  async function ensureProfile(){
    if(!client) return demo.profile;
    const s = await session();
    if(!s) return null;
    const meta = s.user.user_metadata || {};
    const display = meta.full_name || meta.name || s.user.email?.split('@')[0] || 'CSorro User';
    const { data, error } = await client.rpc('ensure_user_profile');
    if(!error && data) return Array.isArray(data) ? data[0] : data;
    const { data:existing } = await client.from('profiles').select('*').eq('id', s.user.id).maybeSingle();
    if(existing) return existing;
    const { data:created, error:createError } = await client.from('profiles').insert({ id:s.user.id, display_name:display }).select('*').single();
    if(createError) throw createError;
    return created;
  }

  async function profile(){
    if(!client) return demo.profile;
    const s = await session();
    if(!s) return null;
    const { data, error } = await client.from('profiles').select('*').eq('id', s.user.id).maybeSingle();
    if(error) { console.warn('profile load error', error); return null; }
    return data || { id:s.user.id, display_name:s.user.email, initials:initials(s.user.email) };
  }

  async function workspaces(){
    if(!client) return demo.workspaces;
    const { data, error } = await client.from('workspaces').select('id,name,visibility,showcase_enabled,storage_used_mb,created_at').order('created_at', { ascending:false });
    if(error) { console.warn('workspace load error', error); return []; }
    return (data || []).map(w => ({ ...w, privacy: w.visibility === 'public' ? 'Public' : 'Private' }));
  }

  async function projects(workspaceId){
    if(!client) return demo.projects.filter(p => !workspaceId || p.workspace_id === workspaceId || String(workspaceId).startsWith('demo'));
    let q = client.from('projects').select('*').order('created_at', { ascending:false });
    if(workspaceId) q = q.eq('workspace_id', workspaceId);
    const { data, error } = await q;
    if(error) { console.warn('project load error', error); return []; }
    return data || [];
  }

  async function signIn(email,password){
    if(!client) throw new Error('Supabase is not configured yet.');
    return client.auth.signInWithPassword({ email, password });
  }
  async function signUp(email,password,fullName){
    if(!client) throw new Error('Supabase is not configured yet.');
    return client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || '' },
        emailRedirectTo: redirectUrl('/os/app/login/?verified=1')
      }
    });
  }
  async function sendPasswordReset(email){
    if(!client) throw new Error('Supabase is not configured yet.');
    return client.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl('/os/app/login/?mode=recovery') });
  }
  async function updatePassword(newPassword){
    if(!client) throw new Error('Supabase is not configured yet.');
    return client.auth.updateUser({ password: newPassword });
  }
  async function signOut(){ if(client) await client.auth.signOut(); location.href='/os/app/login/'; }
  function onAuthStateChange(handler){ return client ? client.auth.onAuthStateChange(handler) : null; }

  async function createWorkspace(payload){
    if(!client){
      const local = { id:'local-'+Date.now(), ...payload, visibility:'private', privacy:'Private', created_at:new Date().toISOString(), demo:true };
      localStorage.setItem('csorroCurrentWorkspace', JSON.stringify(local));
      return local;
    }
    await ensureProfile();
    const name = (payload && payload.name ? payload.name : 'New Workspace').trim();
    const type = payload?.type || 'Workspace';
    const preset = payload?.preset || 'starter';
    const priorities = payload?.priorities || [];

    const rpc = await client.rpc('create_workspace_with_defaults', {
      workspace_name: name,
      workspace_type: type,
      workspace_preset: preset,
      workspace_modules: priorities
    });
    if(!rpc.error && rpc.data) return Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;

    console.warn('RPC create_workspace_with_defaults unavailable, falling back to direct inserts:', rpc.error);
    const u = await requireUser();
    const { data:w, error:wErr } = await client.from('workspaces')
      .insert({ owner_id:u.id, name, description:`${type} workspace`, visibility:'private' })
      .select().single();
    if(wErr) throw wErr;

    await client.from('workspace_members').insert({ workspace_id:w.id, user_id:u.id, role_name:'Owner', status:'active', joined_at:new Date().toISOString() });
    const { data:p } = await client.from('projects').insert({ workspace_id:w.id, owner_id:u.id, name:'First Project', slug:'first-project', status:'planning', phase:'Setup', progress:0, description:'Your first project in this workspace.' }).select().single();
    if(p) await client.from('project_members').insert({ project_id:p.id, user_id:u.id, role_name:'Owner', status:'active' });
    return { workspace_id:w.id, project_id:p?.id || null, name:w.name };
  }

  async function createProject(workspaceId, payload){
    if(!client) throw new Error('Connect Supabase before saving live projects.');
    const u = await requireUser();
    const name = (payload?.name || 'New Project').trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || 'new-project';
    const { data, error } = await client.from('projects').insert({ workspace_id:workspaceId, owner_id:u.id, name, slug, status:'planning', phase:'Setup', progress:0, description:payload?.description || '' }).select().single();
    if(error) throw error;
    await client.from('project_members').insert({ project_id:data.id, user_id:u.id, role_name:'Owner', status:'active' });
    return data;
  }



  async function networkPosts(){
    if(!client){
      return [
        { id:'demo-1', post_type:'looking_for_work', title:'Editor open for work', body:'Available for gaming edits and creator projects this month. Portfolio ready.', author_name:'Creative Editor', like_count:24, comment_count:6, created_at:new Date().toISOString() },
        { id:'demo-2', post_type:'hiring', title:'Looking for thumbnail artist', body:'RyanNotBrian-style gaming thumbnail artist needed for a short project.', author_name:'Studio Manager', like_count:41, comment_count:12, created_at:new Date().toISOString() },
        { id:'demo-3', post_type:'product_update', title:'Sorro platform update', body:'Modules, Network, Production Review and auth foundation are moving into the same engine.', author_name:'Sorro', like_count:88, comment_count:18, created_at:new Date().toISOString() }
      ];
    }
    const { data, error } = await client.from('network_posts').select('*').order('created_at', { ascending:false }).limit(30);
    if(error){ console.warn('network post load error', error); return []; }
    return data || [];
  }

  async function createNetworkPost(payload){
    if(!client){
      const local = { id:'local-post-'+Date.now(), ...payload, like_count:0, comment_count:0, created_at:new Date().toISOString(), author_name:'You' };
      const list = JSON.parse(localStorage.getItem('csorroNetworkPosts') || '[]');
      list.unshift(local);
      localStorage.setItem('csorroNetworkPosts', JSON.stringify(list));
      return local;
    }
    const u = await requireUser();
    const { data, error } = await client.from('network_posts').insert({
      author_id:u.id,
      post_type:payload.post_type || 'general',
      title:payload.title || null,
      body:payload.body || '',
      image_url:payload.image_url || null,
      link_url:payload.link_url || null,
      visibility:payload.visibility || 'network'
    }).select().single();
    if(error) throw error;
    return data;
  }

  async function workspaceModules(workspaceId){
    if(!client || !workspaceId){
      return [
        { module_key:'production', module_name:'Production', enabled:true },
        { module_key:'knowledge', module_name:'Knowledge Base', enabled:true },
        { module_key:'crm', module_name:'CRM', enabled:false },
        { module_key:'client_portal', module_name:'Client Portal', enabled:false },
        { module_key:'automation', module_name:'Automation', enabled:false }
      ];
    }
    const { data, error } = await client.from('workspace_modules').select('*').eq('workspace_id', workspaceId).order('module_name');
    if(error){ console.warn('workspace modules load error', error); return []; }
    return data || [];
  }

  async function setWorkspaceModule(workspaceId, moduleKey, enabled){
    if(!client){
      const key='csorroModules:'+workspaceId;
      const data=JSON.parse(localStorage.getItem(key)||'{}');
      data[moduleKey]=!!enabled;
      localStorage.setItem(key, JSON.stringify(data));
      return { workspace_id:workspaceId, module_key:moduleKey, enabled:!!enabled };
    }
    const prof = await ensureProfile();
    const names={production:'Production',knowledge:'Knowledge Base',crm:'CRM',client_portal:'Client Portal',automation:'Automation'};
    const { data, error } = await client.from('workspace_modules').upsert({
      workspace_id:workspaceId,
      module_key:moduleKey,
      module_name:names[moduleKey] || moduleKey,
      enabled:!!enabled,
      enabled_by:prof?.id || null
    }, { onConflict:'workspace_id,module_key' }).select().single();
    if(error) throw error;
    return data;
  }

  function renderBackendBadge(){
    document.querySelectorAll('[data-backend-status]').forEach(el => {
      el.textContent = status.mode === 'live' ? 'Live backend' : 'Demo data';
      el.className = 'mini-label ' + (status.mode === 'live' ? 'green' : 'amber');
      el.title = status.message;
    });
  }

  async function hydrateShell(){
    renderBackendBadge();
    const prof = await profile().catch(()=>null);
    document.querySelectorAll('[data-user-initial]').forEach(el => { el.textContent = initials(prof?.display_name || prof?.full_name || 'C'); });
    document.querySelectorAll('[data-user-name]').forEach(el => { el.textContent = prof?.display_name || prof?.full_name || 'Cristian'; });
    document.querySelectorAll('[data-auth-action="logout"]').forEach(el => { el.addEventListener('click', (e)=>{ e.preventDefault(); signOut(); }); });
  }

  document.addEventListener('DOMContentLoaded', hydrateShell);

  window.CSorroPlatform = { client, status, session, user, requireUser, profile, ensureProfile, workspaces, projects, signIn, signUp, sendPasswordReset, updatePassword, signOut, onAuthStateChange, createWorkspace, createProject, networkPosts, createNetworkPost, workspaceModules, setWorkspaceModule, hydrateShell };
})();
