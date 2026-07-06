-- Sorro Workspace Storage Architecture v1
-- Run after 001-005. This shifts the product from isolated Assets to workspace-owned Storage.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.storage_library_type as enum ('project_media','brand_kit','client_review','knowledge_docs','templates','archive','trash','custom');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.file_review_status as enum ('draft','waiting_review','changes_requested','approved','archived');
exception when duplicate_object then null; end $$;

create table if not exists public.storage_libraries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  name text not null,
  library_type public.storage_library_type not null default 'custom',
  description text,
  default_visibility public.visibility_level not null default 'workspace',
  sort_order int not null default 0,
  is_system boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, name)
);

drop trigger if exists trg_storage_libraries_updated_at on public.storage_libraries;
create trigger trg_storage_libraries_updated_at
before update on public.storage_libraries
for each row execute function public.set_updated_at();

alter table public.assets add column if not exists library_id uuid references public.storage_libraries(id) on delete set null;
alter table public.assets add column if not exists parent_asset_id uuid references public.assets(id) on delete set null;
alter table public.assets add column if not exists original_asset_id uuid references public.assets(id) on delete set null;
alter table public.assets add column if not exists version_number int not null default 1;
alter table public.assets add column if not exists review_status public.file_review_status not null default 'draft';
alter table public.assets add column if not exists deleted_at timestamptz;
alter table public.assets add column if not exists checksum text;

create table if not exists public.asset_project_links (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  linked_by uuid references public.profiles(id) on delete set null,
  link_reason text,
  created_at timestamptz not null default now(),
  unique(asset_id, project_id)
);

create table if not exists public.asset_versions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  version_number int not null,
  storage_bucket text,
  storage_path text,
  file_name text,
  mime_type text,
  size_bytes bigint not null default 0,
  notes text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(asset_id, version_number)
);

create table if not exists public.asset_comments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  version_id uuid references public.asset_versions(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  timestamp_seconds numeric,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_asset_comments_updated_at on public.asset_comments;
create trigger trg_asset_comments_updated_at
before update on public.asset_comments
for each row execute function public.set_updated_at();

create table if not exists public.storage_permissions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  library_id uuid references public.storage_libraries(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete cascade,
  role_id uuid references public.workspace_roles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  can_view boolean not null default true,
  can_comment boolean not null default false,
  can_upload boolean not null default false,
  can_edit boolean not null default false,
  can_approve boolean not null default false,
  can_delete boolean not null default false,
  created_at timestamptz not null default now(),
  check (role_id is not null or user_id is not null)
);

create table if not exists public.workspace_storage_usage (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  used_bytes bigint not null default 0,
  last_calculated_at timestamptz not null default now()
);

create or replace function public.recalculate_workspace_storage(target_workspace_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare total bigint;
begin
  select coalesce(sum(size_bytes),0) into total
  from public.assets
  where workspace_id = target_workspace_id
    and deleted_at is null;

  insert into public.workspace_storage_usage(workspace_id, used_bytes, last_calculated_at)
  values(target_workspace_id, total, now())
  on conflict(workspace_id) do update set used_bytes = excluded.used_bytes, last_calculated_at = excluded.last_calculated_at;

  return total;
end;
$$;

create or replace function public.seed_default_storage_libraries(target_workspace_id uuid, target_user_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.storage_libraries(workspace_id, created_by, name, library_type, description, default_visibility, sort_order, is_system)
  values
    (target_workspace_id, target_user_id, 'Project Media', 'project_media', 'Clips, images, thumbnails, working files and review media.', 'workspace', 10, true),
    (target_workspace_id, target_user_id, 'Brand Kit', 'brand_kit', 'Logos, colours, style guides and reusable brand assets.', 'workspace', 20, true),
    (target_workspace_id, target_user_id, 'Client / Guest Review', 'client_review', 'Review links, approvals and client-facing media.', 'private', 30, true),
    (target_workspace_id, target_user_id, 'Knowledge & Docs', 'knowledge_docs', 'Briefs, SOPs, scripts and documentation.', 'workspace', 40, true),
    (target_workspace_id, target_user_id, 'Templates', 'templates', 'Reusable project, task and production templates.', 'workspace', 50, true),
    (target_workspace_id, target_user_id, 'Archive', 'archive', 'Completed and locked work.', 'private', 90, true),
    (target_workspace_id, target_user_id, 'Trash', 'trash', 'Recoverable deleted files.', 'private', 100, true)
  on conflict(workspace_id, name) do nothing;
end;
$$;

alter table public.storage_libraries enable row level security;
alter table public.asset_project_links enable row level security;
alter table public.asset_versions enable row level security;
alter table public.asset_comments enable row level security;
alter table public.storage_permissions enable row level security;
alter table public.workspace_storage_usage enable row level security;

do $$ begin
  create policy "storage_libraries_select_workspace_member" on public.storage_libraries for select using (public.is_workspace_member(workspace_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "storage_libraries_manage_workspace_member" on public.storage_libraries for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "asset_links_select_member" on public.asset_project_links for select using (
    exists (select 1 from public.projects p where p.id = project_id and (public.is_workspace_member(p.workspace_id) or public.is_project_member(p.id)))
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "asset_links_manage_member" on public.asset_project_links for all using (
    exists (select 1 from public.projects p where p.id = project_id and public.is_workspace_member(p.workspace_id))
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and public.is_workspace_member(p.workspace_id))
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "asset_versions_select_member" on public.asset_versions for select using (
    exists (select 1 from public.assets a where a.id = asset_id and public.is_workspace_member(a.workspace_id))
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "asset_versions_manage_member" on public.asset_versions for all using (
    exists (select 1 from public.assets a where a.id = asset_id and public.is_workspace_member(a.workspace_id))
  ) with check (
    exists (select 1 from public.assets a where a.id = asset_id and public.is_workspace_member(a.workspace_id))
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "asset_comments_select_member" on public.asset_comments for select using (
    exists (select 1 from public.assets a where a.id = asset_id and public.is_workspace_member(a.workspace_id))
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "asset_comments_manage_member" on public.asset_comments for all using (
    exists (select 1 from public.assets a where a.id = asset_id and public.is_workspace_member(a.workspace_id))
  ) with check (
    exists (select 1 from public.assets a where a.id = asset_id and public.is_workspace_member(a.workspace_id))
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "storage_permissions_select_member" on public.storage_permissions for select using (public.is_workspace_member(workspace_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "storage_permissions_manage_member" on public.storage_permissions for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "workspace_storage_usage_select_member" on public.workspace_storage_usage for select using (public.is_workspace_member(workspace_id));
exception when duplicate_object then null; end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('workspace-storage', 'workspace-storage', false, 2147483648, null)
on conflict (id) do nothing;

create index if not exists idx_storage_libraries_workspace on public.storage_libraries(workspace_id, sort_order);
create index if not exists idx_assets_library on public.assets(library_id);
create index if not exists idx_assets_workspace_deleted on public.assets(workspace_id, deleted_at);
create index if not exists idx_asset_project_links_project on public.asset_project_links(project_id);
create index if not exists idx_asset_versions_asset on public.asset_versions(asset_id, version_number desc);
create index if not exists idx_asset_comments_asset on public.asset_comments(asset_id, created_at desc);
