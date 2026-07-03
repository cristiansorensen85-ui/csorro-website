(function(){
  const cfg = window.CSORRO_SUPABASE || {};
  const ready = !!(cfg.url && cfg.anonKey && window.supabase);
  const status = { mode: ready ? 'live' : 'demo', message: ready ? 'Connected to Supabase' : 'Demo mode: add Supabase URL + anon key in /os/app/platform-config.js' };
  let client = null;
  if (ready) client = window.supabase.createClient(cfg.url, cfg.anonKey);

  const demo = {
    profile: { full_name: 'Cristian Sorensen', initials: 'C' },
    workspaces: [
      { id: 'demo-ryan', name: 'RyanNotBrian', privacy: 'Private', project_count: 1 },
      { id: 'demo-csorro', name: 'CSorro Ltd', privacy: 'Private', project_count: 1 },
      { id: 'demo-hull', name: 'Hull Podcast', privacy: 'Private', project_count: 1 }
    ],
    projects: [
      { id: 'demo-recording', workspace_id: 'demo-ryan', name: 'Ryan Recording Prep', status: 'Review', description: 'Recording prep, assets, thumbnail approval and team updates.' },
      { id: 'demo-os', workspace_id: 'demo-csorro', name: 'CSorro OS Build', status: 'Foundation', description: 'Build the operating system foundation.' }
    ]
  };

  async function session(){ if(!client) return null; const { data } = await client.auth.getSession(); return data.session || null; }
  async function profile(){
    if(!client) return demo.profile;
    const s = await session();
    if(!s) return null;
    const { data, error } = await client.from('profiles').select('*').eq('id', s.user.id).maybeSingle();
    if(error) { console.warn('profile load error', error); return null; }
    return data;
  }
  async function workspaces(){
    if(!client) return demo.workspaces;
    const { data, error } = await client.from('workspaces').select('id,name,privacy,created_at').order('created_at', { ascending:false });
    if(error) { console.warn('workspace load error', error); return []; }
    return data || [];
  }
  async function projects(workspaceId){
    if(!client) return demo.projects.filter(p => !workspaceId || p.workspace_id === workspaceId || workspaceId.startsWith('demo'));
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
  async function createWorkspace(name){
    if(!client) throw new Error('Connect Supabase before saving live workspaces.');
    const { data, error } = await client.from('workspaces').insert({ name, privacy:'private' }).select().single();
    if(error) throw error; return data;
  }

  function renderBackendBadge(){
    document.querySelectorAll('[data-backend-status]').forEach(el => {
      el.textContent = status.mode === 'live' ? 'Live backend' : 'Demo data';
      el.className = 'mini-label ' + (status.mode === 'live' ? 'green' : 'amber');
      el.title = status.message;
    });
  }
  document.addEventListener('DOMContentLoaded', renderBackendBadge);

  window.CSorroPlatform = { client, status, session, profile, workspaces, projects, signIn, signUp, signOut, createWorkspace };
})();
