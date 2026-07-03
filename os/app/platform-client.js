(function(){
  const cfg = window.CSORRO_SUPABASE || {};
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
      { id: 'demo-os', workspace_id: 'demo-csorro', name: 'CSorro OS Build', status: 'active', phase:'Foundation', progress:51, description: 'Build the operating system foundation.' }
    ]
  };

  function initials(name){return (name||'C').split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase()||'C'}

  async function session(){ if(!client) return null; const { data } = await client.auth.getSession(); return data.session || null; }
  async function user(){ const s = await session(); return s ? s.user : null; }
  async function requireUser(){ const u = await user(); if(!u) throw new Error('Please sign in first.'); return u; }

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

  async function signIn(email,password){ if(!client) throw new Error('Supabase is not configured yet.'); return client.auth.signInWithPassword({ email, password }); }
  async function signUp(email,password,fullName){
    if(!client) throw new Error('Supabase is not configured yet.');
    return client.auth.signUp({ email, password, options: { data: { full_name: fullName || '' } } });
  }
  async function signOut(){ if(client) await client.auth.signOut(); location.href='/os/app/login/'; }

  async function createWorkspace(payload){
    if(!client){
      const local = { id:'local-'+Date.now(), ...payload, visibility:'private', privacy:'Private', created_at:new Date().toISOString(), demo:true };
      localStorage.setItem('csorroCurrentWorkspace', JSON.stringify(local));
      return local;
    }
    const u = await requireUser();
    const name = (payload && payload.name ? payload.name : 'New Workspace').trim();
    const type = payload?.type || 'Workspace';
    const preset = payload?.preset || 'starter';
    const priorities = payload?.priorities || [];

    // Preferred: one secure backend call creates workspace, membership, roles, default project and chat.
    const rpc = await client.rpc('create_workspace_with_defaults', {
      workspace_name: name,
      workspace_type: type,
      workspace_preset: preset,
      workspace_modules: priorities
    });
    if(!rpc.error && rpc.data) return Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;

    console.warn('RPC create_workspace_with_defaults unavailable, falling back to direct inserts:', rpc.error);

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
  }

  document.addEventListener('DOMContentLoaded', hydrateShell);

  window.CSorroPlatform = { client, status, session, user, profile, workspaces, projects, signIn, signUp, signOut, createWorkspace, createProject, hydrateShell };
})();
