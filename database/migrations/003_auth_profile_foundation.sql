-- Sorro Auth + Profile Foundation v1
-- Run after 001_core_platform_schema.sql and 002_workspace_engine_rpc.sql.
-- This improves account creation, profile loading and subscription visibility for real login/signup testing.

create unique index if not exists idx_subscriptions_unique_user_plan
on public.subscriptions(user_id, plan_id)
where user_id is not null and workspace_id is null;


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
  on conflict (id) do update set
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

  insert into public.subscriptions (user_id, plan_id, status)
  values (new.id, 'free', 'active')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.ensure_user_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  result public.profiles;
  auth_email text;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select email into auth_email from auth.users where id = uid;

  insert into public.profiles (id, display_name)
  values (uid, split_part(coalesce(auth_email, 'User'), '@', 1))
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan_id, status)
  values (uid, 'free', 'active')
  on conflict do nothing;

  select * into result from public.profiles where id = uid;
  return result;
end;
$$;

grant execute on function public.ensure_user_profile() to authenticated;

-- Subscriptions were created in 001 but need user-safe read access for account/profile screens.
do $$ begin
  create policy "subscriptions_select_own" on public.subscriptions
  for select using (user_id = auth.uid() or (workspace_id is not null and public.is_workspace_member(workspace_id)));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "subscriptions_insert_own_free" on public.subscriptions
  for insert with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- Allow authenticated users to call profile bootstrap safely.
