-- CSorro OS Workspace Engine RPC v1
-- Run after 001_core_platform_schema.sql.
-- This lets the frontend create a workspace with safe defaults in one call.

create or replace function public.slugify(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(value,'')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.create_workspace_with_defaults(
  workspace_name text,
  workspace_type text default 'Workspace',
  workspace_preset text default 'starter',
  workspace_modules text[] default array[]::text[]
)
returns table(workspace_id uuid, project_id uuid, name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  ws_id uuid;
  pr_id uuid;
  base_slug text;
  final_slug text;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  base_slug := coalesce(nullif(public.slugify(workspace_name), ''), 'workspace');
  final_slug := base_slug || '-' || substr(gen_random_uuid()::text, 1, 6);

  insert into public.workspaces (owner_id, name, slug, description, visibility)
  values (uid, coalesce(nullif(workspace_name,''), 'New Workspace'), final_slug, coalesce(workspace_type,'Workspace') || ' workspace', 'private')
  returning id into ws_id;

  insert into public.workspace_members (workspace_id, user_id, role_name, status, joined_at)
  values (ws_id, uid, 'Owner', 'active', now())
  on conflict (workspace_id, user_id) do nothing;

  insert into public.workspace_roles (workspace_id, name, is_system, permissions)
  values
    (ws_id, 'Owner', true, '{"all":true}'::jsonb),
    (ws_id, 'Admin', true, '{"manage_projects":true,"manage_people":true,"manage_assets":true,"manage_chat":true}'::jsonb),
    (ws_id, 'Member', true, '{"view":true,"comment":true,"create_tasks":true,"upload_assets":true}'::jsonb),
    (ws_id, 'Guest', true, '{"view":true,"comment":true}'::jsonb)
  on conflict do nothing;

  insert into public.projects (workspace_id, owner_id, name, slug, description, status, phase, progress)
  values (ws_id, uid, 'First Project', 'first-project', 'Your first project in this workspace.', 'planning', 'Setup', 0)
  returning id into pr_id;

  insert into public.project_members (project_id, user_id, role_name, status)
  values (pr_id, uid, 'Owner', 'active')
  on conflict do nothing;

  insert into public.chat_rooms (workspace_id, project_id, name, type, is_private, created_by)
  values
    (ws_id, null, 'General', 'workspace_channel', false, uid),
    (ws_id, pr_id, 'Project Chat', 'project_chat', false, uid);

  insert into public.activity_events (workspace_id, project_id, actor_id, event_type, title, metadata)
  values (ws_id, pr_id, uid, 'workspace.created', 'Workspace created', jsonb_build_object('preset', workspace_preset, 'modules', workspace_modules));

  return query select ws_id, pr_id, workspace_name;
end;
$$;

grant execute on function public.create_workspace_with_defaults(text, text, text, text[]) to authenticated;
