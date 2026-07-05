-- CSorro OS Core Platform Schema v1
-- Run inside Supabase SQL Editor on the csorro-os-dev project.
-- This creates the first backend foundation for accounts, workspaces, projects,
-- permissions, tasks, chat, assets, whiteboards, activity and notifications.

create extension if not exists "pgcrypto";

-- ---------------------------------------------
-- Enums
-- ---------------------------------------------
do $$ begin
  create type public.visibility_level as enum ('private', 'workspace', 'project', 'network', 'public');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.member_status as enum ('invited', 'active', 'suspended', 'removed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.project_status as enum ('planning', 'active', 'review', 'blocked', 'done', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.task_status as enum ('idea', 'todo', 'doing', 'review', 'approved', 'done', 'blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.chat_room_type as enum ('global_dm', 'workspace_channel', 'project_chat', 'private_project_room');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.asset_scope as enum ('personal', 'workspace', 'project', 'showcase');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------
-- Helpers
-- ---------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------
-- Profiles
-- ---------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  avatar_url text,
  bio text,
  role_title text,
  public_profile boolean not null default false,
  creator_mode boolean not null default false,
  availability text default 'not_set',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------
-- Plans / subscriptions
-- ---------------------------------------------
create table if not exists public.plans (
  id text primary key,
  name text not null,
  monthly_price_gbp numeric(8,2) not null default 0,
  yearly_price_gbp numeric(8,2),
  workspace_limit int,
  project_limit int,
  storage_limit_mb int,
  ai_enabled boolean not null default false,
  advanced_permissions boolean not null default false,
  public_showcase boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.plans (id, name, monthly_price_gbp, yearly_price_gbp, workspace_limit, project_limit, storage_limit_mb, ai_enabled, advanced_permissions, public_showcase)
values
  ('free', 'Free', 0, 0, 3, 3, 2048, false, false, true),
  ('creator', 'Creator', 4.99, 49.99, 6, 25, 10240, true, false, true),
  ('studio', 'Studio', 9.99, 99.99, 10, 100, 51200, true, true, true),
  ('business', 'Business', 19.99, 199.99, null, null, 512000, true, true, true)
on conflict (id) do update set
  name = excluded.name,
  monthly_price_gbp = excluded.monthly_price_gbp,
  yearly_price_gbp = excluded.yearly_price_gbp,
  workspace_limit = excluded.workspace_limit,
  project_limit = excluded.project_limit,
  storage_limit_mb = excluded.storage_limit_mb,
  ai_enabled = excluded.ai_enabled,
  advanced_permissions = excluded.advanced_permissions,
  public_showcase = excluded.public_showcase;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid,
  plan_id text not null references public.plans(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_owner_check check (user_id is not null or workspace_id is not null)
);

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

-- ---------------------------------------------
-- Workspaces
-- ---------------------------------------------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text unique,
  description text,
  logo_url text,
  website_url text,
  visibility public.visibility_level not null default 'private',
  showcase_enabled boolean not null default false,
  show_team boolean not null default false,
  show_projects boolean not null default false,
  show_portfolio boolean not null default false,
  show_careers boolean not null default false,
  storage_used_mb int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions
  drop constraint if exists subscriptions_workspace_id_fkey;
alter table public.subscriptions
  add constraint subscriptions_workspace_id_fkey foreign key (workspace_id) references public.workspaces(id) on delete cascade;

drop trigger if exists trg_workspaces_updated_at on public.workspaces;
create trigger trg_workspaces_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

create table if not exists public.workspace_roles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  is_system boolean not null default false,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(workspace_id, name)
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid references public.workspace_roles(id) on delete set null,
  role_name text not null default 'Member',
  status public.member_status not null default 'active',
  invited_by uuid references public.profiles(id),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  unique(workspace_id, user_id)
);

create table if not exists public.workspace_permission_overrides (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  permissions jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, user_id)
);

drop trigger if exists trg_workspace_permission_overrides_updated_at on public.workspace_permission_overrides;
create trigger trg_workspace_permission_overrides_updated_at
before update on public.workspace_permission_overrides
for each row execute function public.set_updated_at();

-- ---------------------------------------------
-- Projects
-- ---------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text,
  description text,
  status public.project_status not null default 'planning',
  phase text default 'Foundation',
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  current_blocker text,
  visibility public.visibility_level not null default 'private',
  showcase_enabled boolean not null default false,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, slug)
);

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_name text not null default 'Member',
  status public.member_status not null default 'active',
  created_at timestamptz not null default now(),
  unique(project_id, user_id)
);

create table if not exists public.project_permission_overrides (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  permissions jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, user_id)
);

drop trigger if exists trg_project_permission_overrides_updated_at on public.project_permission_overrides;
create trigger trg_project_permission_overrides_updated_at
before update on public.project_permission_overrides
for each row execute function public.set_updated_at();

-- ---------------------------------------------
-- Activity / Tasks
-- ---------------------------------------------
create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  title text not null,
  body text,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  priority text not null default 'normal',
  assignee_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  due_date date,
  labels text[] not null default '{}',
  checklist jsonb not null default '[]'::jsonb,
  links jsonb not null default '[]'::jsonb,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------
-- Chat
-- ---------------------------------------------
create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  room_type public.chat_room_type not null,
  name text not null,
  description text,
  is_private boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_chat_rooms_updated_at on public.chat_rooms;
create trigger trg_chat_rooms_updated_at
before update on public.chat_rooms
for each row execute function public.set_updated_at();

create table if not exists public.chat_room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_name text not null default 'Member',
  created_at timestamptz not null default now(),
  unique(room_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text,
  linked_type text,
  linked_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

-- ---------------------------------------------
-- Assets / whiteboards / notifications / invites
-- ---------------------------------------------
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  scope public.asset_scope not null default 'personal',
  name text not null,
  storage_bucket text,
  storage_path text,
  mime_type text,
  size_bytes bigint not null default 0,
  visibility public.visibility_level not null default 'private',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_assets_updated_at on public.assets;
create trigger trg_assets_updated_at
before update on public.assets
for each row execute function public.set_updated_at();

create table if not exists public.whiteboards (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  board_data jsonb not null default '{}'::jsonb,
  preview_asset_id uuid references public.assets(id) on delete set null,
  version int not null default 1,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_whiteboards_updated_at on public.whiteboards;
create trigger trg_whiteboards_updated_at
before update on public.whiteboards
for each row execute function public.set_updated_at();

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  body text,
  target_type text,
  target_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  email text,
  role_name text not null default 'Guest',
  permissions jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz,
  accepted_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------
-- Membership helper functions for RLS
-- ---------------------------------------------
create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
  or exists (
    select 1
    from public.workspaces w
    where w.id = target_workspace_id
      and w.owner_id = auth.uid()
  );
$$;

create or replace function public.is_project_member(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_members pm
    where pm.project_id = target_project_id
      and pm.user_id = auth.uid()
      and pm.status = 'active'
  )
  or exists (
    select 1
    from public.projects p
    where p.id = target_project_id
      and public.is_workspace_member(p.workspace_id)
  );
$$;

create or replace function public.is_chat_room_member(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.chat_room_members crm
    where crm.room_id = target_room_id
      and crm.user_id = auth.uid()
  )
  or exists (
    select 1 from public.chat_rooms cr
    where cr.id = target_room_id
      and cr.is_private = false
      and (
        (cr.project_id is not null and public.is_project_member(cr.project_id))
        or (cr.workspace_id is not null and public.is_workspace_member(cr.workspace_id))
      )
  );
$$;

-- ---------------------------------------------
-- Enable RLS
-- ---------------------------------------------
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_roles enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_permission_overrides enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_permission_overrides enable row level security;
alter table public.activity_events enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_room_members enable row level security;
alter table public.chat_messages enable row level security;
alter table public.assets enable row level security;
alter table public.whiteboards enable row level security;
alter table public.notifications enable row level security;
alter table public.invites enable row level security;

-- ---------------------------------------------
-- Basic RLS policies
-- ---------------------------------------------
-- Profiles
create policy "profiles_select_self_or_public" on public.profiles
for select using (id = auth.uid() or public_profile = true);
create policy "profiles_update_self" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_insert_self" on public.profiles
for insert with check (id = auth.uid());

-- Plans are public readable.
create policy "plans_select_all" on public.plans
for select using (true);

-- Workspaces
create policy "workspaces_select_member_or_public" on public.workspaces
for select using (public.is_workspace_member(id) or visibility = 'public' or showcase_enabled = true);
create policy "workspaces_insert_owner" on public.workspaces
for insert with check (owner_id = auth.uid());
create policy "workspaces_update_owner" on public.workspaces
for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "workspaces_delete_owner" on public.workspaces
for delete using (owner_id = auth.uid());

-- Workspace children
create policy "workspace_members_select_workspace" on public.workspace_members
for select using (public.is_workspace_member(workspace_id));
create policy "workspace_members_insert_owner" on public.workspace_members
for insert with check (public.is_workspace_member(workspace_id));
create policy "workspace_members_update_owner" on public.workspace_members
for update using (public.is_workspace_member(workspace_id));

create policy "workspace_roles_select_workspace" on public.workspace_roles
for select using (workspace_id is null or public.is_workspace_member(workspace_id));
create policy "workspace_roles_manage_workspace" on public.workspace_roles
for all using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "workspace_overrides_select_workspace" on public.workspace_permission_overrides
for select using (public.is_workspace_member(workspace_id));
create policy "workspace_overrides_manage_workspace" on public.workspace_permission_overrides
for all using (public.is_workspace_member(workspace_id));

-- Projects
create policy "projects_select_member_or_public" on public.projects
for select using (public.is_workspace_member(workspace_id) or public.is_project_member(id) or visibility = 'public' or showcase_enabled = true);
create policy "projects_insert_workspace_member" on public.projects
for insert with check (public.is_workspace_member(workspace_id));
create policy "projects_update_workspace_member" on public.projects
for update using (public.is_workspace_member(workspace_id));
create policy "projects_delete_workspace_member" on public.projects
for delete using (public.is_workspace_member(workspace_id));

create policy "project_members_select_project" on public.project_members
for select using (public.is_project_member(project_id));
create policy "project_members_manage_project" on public.project_members
for all using (public.is_project_member(project_id));

create policy "project_overrides_select_project" on public.project_permission_overrides
for select using (public.is_project_member(project_id));
create policy "project_overrides_manage_project" on public.project_permission_overrides
for all using (public.is_project_member(project_id));

-- Project module tables
create policy "activity_select_project" on public.activity_events
for select using ((project_id is not null and public.is_project_member(project_id)) or (workspace_id is not null and public.is_workspace_member(workspace_id)));
create policy "activity_insert_member" on public.activity_events
for insert with check ((project_id is not null and public.is_project_member(project_id)) or (workspace_id is not null and public.is_workspace_member(workspace_id)));

create policy "tasks_select_project" on public.tasks
for select using (public.is_project_member(project_id));
create policy "tasks_manage_project" on public.tasks
for all using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

create policy "task_comments_select_task_project" on public.task_comments
for select using (exists (select 1 from public.tasks t where t.id = task_id and public.is_project_member(t.project_id)));
create policy "task_comments_insert_task_project" on public.task_comments
for insert with check (exists (select 1 from public.tasks t where t.id = task_id and public.is_project_member(t.project_id)));

create policy "chat_rooms_select_member" on public.chat_rooms
for select using (public.is_chat_room_member(id));
create policy "chat_rooms_manage_workspace_project" on public.chat_rooms
for all using ((project_id is not null and public.is_project_member(project_id)) or (workspace_id is not null and public.is_workspace_member(workspace_id)))
with check ((project_id is not null and public.is_project_member(project_id)) or (workspace_id is not null and public.is_workspace_member(workspace_id)));

create policy "chat_room_members_select_room" on public.chat_room_members
for select using (public.is_chat_room_member(room_id));
create policy "chat_room_members_manage_room" on public.chat_room_members
for all using (public.is_chat_room_member(room_id));

create policy "chat_messages_select_room" on public.chat_messages
for select using (public.is_chat_room_member(room_id));
create policy "chat_messages_insert_room" on public.chat_messages
for insert with check (public.is_chat_room_member(room_id));
create policy "chat_messages_update_own" on public.chat_messages
for update using (author_id = auth.uid()) with check (author_id = auth.uid());

create policy "assets_select_allowed" on public.assets
for select using (
  owner_id = auth.uid()
  or (project_id is not null and public.is_project_member(project_id))
  or (workspace_id is not null and public.is_workspace_member(workspace_id))
  or visibility = 'public'
);
create policy "assets_manage_allowed" on public.assets
for all using (
  owner_id = auth.uid()
  or (project_id is not null and public.is_project_member(project_id))
  or (workspace_id is not null and public.is_workspace_member(workspace_id))
) with check (
  owner_id = auth.uid()
  or (project_id is not null and public.is_project_member(project_id))
  or (workspace_id is not null and public.is_workspace_member(workspace_id))
);

create policy "whiteboards_select_project" on public.whiteboards
for select using (public.is_project_member(project_id));
create policy "whiteboards_manage_project" on public.whiteboards
for all using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

create policy "notifications_select_self" on public.notifications
for select using (user_id = auth.uid());
create policy "notifications_update_self" on public.notifications
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "invites_select_creator_or_email" on public.invites
for select using (created_by = auth.uid() or accepted_by = auth.uid());
create policy "invites_manage_workspace" on public.invites
for all using (workspace_id is null or public.is_workspace_member(workspace_id));

-- ---------------------------------------------
-- Indexes
-- ---------------------------------------------
create index if not exists idx_workspace_members_workspace on public.workspace_members(workspace_id);
create index if not exists idx_workspace_members_user on public.workspace_members(user_id);
create index if not exists idx_projects_workspace on public.projects(workspace_id);
create index if not exists idx_project_members_project on public.project_members(project_id);
create index if not exists idx_project_members_user on public.project_members(user_id);
create index if not exists idx_tasks_project_status on public.tasks(project_id, status);
create index if not exists idx_activity_project_created on public.activity_events(project_id, created_at desc);
create index if not exists idx_chat_messages_room_created on public.chat_messages(room_id, created_at desc);
create index if not exists idx_assets_project on public.assets(project_id);
create index if not exists idx_notifications_user_created on public.notifications(user_id, created_at desc);

-- ---------------------------------------------
-- Storage buckets
-- ---------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('personal-assets', 'personal-assets', false),
  ('workspace-assets', 'workspace-assets', false),
  ('project-assets', 'project-assets', false),
  ('showcase-assets', 'showcase-assets', true),
  ('whiteboard-exports', 'whiteboard-exports', false)
on conflict (id) do nothing;
