-- CSorro OS Modules + Network Foundation v1
-- Run after 001, 002 and 003.
-- Adds the first backend tables for modular workspaces and LinkedIn-style professional network posts.

create extension if not exists "pgcrypto";

-- Workspace modules: lets each workspace enable optional modules without changing the core OS.
create table if not exists public.workspace_modules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  module_key text not null,
  module_name text not null,
  enabled boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  enabled_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, module_key)
);

drop trigger if exists trg_workspace_modules_updated_at on public.workspace_modules;
create trigger trg_workspace_modules_updated_at
before update on public.workspace_modules
for each row execute function public.set_updated_at();

-- Creator / professional profile extension.
create table if not exists public.creator_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  headline text,
  location text,
  website_url text,
  portfolio_url text,
  open_to_work boolean not null default false,
  public_visibility text not null default 'private',
  skills text[] not null default array[]::text[],
  tools text[] not null default array[]::text[],
  showcase_assets jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_creator_profiles_updated_at on public.creator_profiles;
create trigger trg_creator_profiles_updated_at
before update on public.creator_profiles
for each row execute function public.set_updated_at();

-- Network posts: professional feed, hiring, showcase, updates and open-for-work posts.
do $$ begin
  create type public.network_post_type as enum ('general', 'looking_for_work', 'hiring', 'showcase', 'product_update', 'tutorial', 'community_question');
exception when duplicate_object then null; end $$;

create table if not exists public.network_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  post_type public.network_post_type not null default 'general',
  title text,
  body text not null,
  image_url text,
  link_url text,
  visibility public.visibility_level not null default 'network',
  like_count int not null default 0,
  comment_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_network_posts_updated_at on public.network_posts;
create trigger trg_network_posts_updated_at
before update on public.network_posts
for each row execute function public.set_updated_at();

create table if not exists public.network_post_likes (
  post_id uuid not null references public.network_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(post_id, user_id)
);

create table if not exists public.network_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.network_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_network_post_comments_updated_at on public.network_post_comments;
create trigger trg_network_post_comments_updated_at
before update on public.network_post_comments
for each row execute function public.set_updated_at();

-- Lightweight Production Review foundation. Heavy files still live in Storage/assets.
create table if not exists public.production_reviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete set null,
  title text not null,
  status text not null default 'waiting_review',
  current_version int not null default 1,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_production_reviews_updated_at on public.production_reviews;
create trigger trg_production_reviews_updated_at
before update on public.production_reviews
for each row execute function public.set_updated_at();

create table if not exists public.production_review_comments (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.production_reviews(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  timestamp_seconds numeric,
  body text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_production_review_comments_updated_at on public.production_review_comments;
create trigger trg_production_review_comments_updated_at
before update on public.production_review_comments
for each row execute function public.set_updated_at();

alter table public.workspace_modules enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.network_posts enable row level security;
alter table public.network_post_likes enable row level security;
alter table public.network_post_comments enable row level security;
alter table public.production_reviews enable row level security;
alter table public.production_review_comments enable row level security;

do $$ begin
  create policy "workspace_modules_select_member" on public.workspace_modules for select using (public.is_workspace_member(workspace_id));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "workspace_modules_manage_member" on public.workspace_modules for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "creator_profiles_select_visible" on public.creator_profiles for select using (user_id = auth.uid() or public_visibility in ('network','public'));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "creator_profiles_manage_own" on public.creator_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "network_posts_select_visible" on public.network_posts for select using (
    visibility in ('network','public')
    or author_id = auth.uid()
    or (workspace_id is not null and public.is_workspace_member(workspace_id))
    or (project_id is not null and public.is_project_member(project_id))
  );
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "network_posts_insert_own" on public.network_posts for insert with check (author_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "network_posts_update_own" on public.network_posts for update using (author_id = auth.uid()) with check (author_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "network_posts_delete_own" on public.network_posts for delete using (author_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "network_likes_select_visible" on public.network_post_likes for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "network_likes_manage_own" on public.network_post_likes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "network_comments_select_visible" on public.network_post_comments for select using (exists (select 1 from public.network_posts p where p.id = post_id));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "network_comments_insert_own" on public.network_post_comments for insert with check (author_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "production_reviews_select_member" on public.production_reviews for select using (public.is_workspace_member(workspace_id) or (project_id is not null and public.is_project_member(project_id)));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "production_reviews_manage_member" on public.production_reviews for all using (public.is_workspace_member(workspace_id) or (project_id is not null and public.is_project_member(project_id))) with check (public.is_workspace_member(workspace_id) or (project_id is not null and public.is_project_member(project_id)));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "production_comments_select_member" on public.production_review_comments for select using (exists (select 1 from public.production_reviews r where r.id = review_id and (public.is_workspace_member(r.workspace_id) or (r.project_id is not null and public.is_project_member(r.project_id)))));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "production_comments_insert_member" on public.production_review_comments for insert with check (exists (select 1 from public.production_reviews r where r.id = review_id and (public.is_workspace_member(r.workspace_id) or (r.project_id is not null and public.is_project_member(r.project_id)))));
exception when duplicate_object then null; end $$;

create index if not exists idx_workspace_modules_workspace on public.workspace_modules(workspace_id);
create index if not exists idx_network_posts_created on public.network_posts(created_at desc);
create index if not exists idx_network_posts_type on public.network_posts(post_type, created_at desc);
create index if not exists idx_production_reviews_project on public.production_reviews(project_id, updated_at desc);

