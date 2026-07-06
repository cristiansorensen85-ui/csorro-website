-- Sorro Studio Review Foundation v1
-- Run after 001-004. Extends production reviews for the Studio module.

create extension if not exists "pgcrypto";

create table if not exists public.production_review_versions (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.production_reviews(id) on delete cascade,
  version_number int not null default 1,
  asset_id uuid references public.assets(id) on delete set null,
  file_path text,
  file_name text,
  file_size_mb numeric,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(review_id, version_number)
);

create table if not exists public.production_review_share_links (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.production_reviews(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(18), 'hex'),
  access_level text not null default 'comment',
  expires_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists public.production_review_comment_attachments (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.production_review_comments(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete set null,
  file_path text,
  file_name text,
  created_at timestamptz not null default now()
);

alter table public.production_review_versions enable row level security;
alter table public.production_review_share_links enable row level security;
alter table public.production_review_comment_attachments enable row level security;

do $$ begin
  create policy "review_versions_select_member" on public.production_review_versions for select using (
    exists (select 1 from public.production_reviews r where r.id = review_id and (public.is_workspace_member(r.workspace_id) or (r.project_id is not null and public.is_project_member(r.project_id))))
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "review_versions_manage_member" on public.production_review_versions for all using (
    exists (select 1 from public.production_reviews r where r.id = review_id and (public.is_workspace_member(r.workspace_id) or (r.project_id is not null and public.is_project_member(r.project_id))))
  ) with check (
    exists (select 1 from public.production_reviews r where r.id = review_id and (public.is_workspace_member(r.workspace_id) or (r.project_id is not null and public.is_project_member(r.project_id))))
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "review_share_links_manage_member" on public.production_review_share_links for all using (
    exists (select 1 from public.production_reviews r where r.id = review_id and public.is_workspace_member(r.workspace_id))
  ) with check (
    exists (select 1 from public.production_reviews r where r.id = review_id and public.is_workspace_member(r.workspace_id))
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "review_comment_attachments_select_member" on public.production_review_comment_attachments for select using (
    exists (select 1 from public.production_review_comments c join public.production_reviews r on r.id = c.review_id where c.id = comment_id and (public.is_workspace_member(r.workspace_id) or (r.project_id is not null and public.is_project_member(r.project_id))))
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "review_comment_attachments_manage_member" on public.production_review_comment_attachments for all using (
    exists (select 1 from public.production_review_comments c join public.production_reviews r on r.id = c.review_id where c.id = comment_id and (public.is_workspace_member(r.workspace_id) or (r.project_id is not null and public.is_project_member(r.project_id))))
  ) with check (
    exists (select 1 from public.production_review_comments c join public.production_reviews r on r.id = c.review_id where c.id = comment_id and (public.is_workspace_member(r.workspace_id) or (r.project_id is not null and public.is_project_member(r.project_id))))
  );
exception when duplicate_object then null; end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('studio-media', 'studio-media', false, 524288000, array['video/mp4','video/quicktime','video/webm','image/png','image/jpeg','image/webp','application/pdf'])
on conflict (id) do nothing;

create index if not exists idx_review_versions_review on public.production_review_versions(review_id, version_number desc);
create index if not exists idx_review_share_links_token on public.production_review_share_links(token);
