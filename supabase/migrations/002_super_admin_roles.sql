create type public.app_role as enum ('usuario', 'administrador', 'super_administrador');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.app_role not null default 'usuario',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, role, active) on table public.profiles to authenticated;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.is_super_admin(check_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = check_user_id and role = 'super_administrador' and active);
$$;
revoke all on function private.is_super_admin(uuid) from public, anon;
grant execute on function private.is_super_admin(uuid) to authenticated;

create policy "Users can read their own profile" on public.profiles
for select to authenticated using (id = auth.uid());
create policy "Super admins can read every profile" on public.profiles
for select to authenticated using ((select private.is_super_admin()));
create policy "Super admins can update every profile" on public.profiles
for update to authenticated using ((select private.is_super_admin())) with check ((select private.is_super_admin()));

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
for each row execute function private.handle_new_user();

insert into public.profiles (id, email, full_name)
select id, coalesce(email, ''), coalesce(raw_user_meta_data ->> 'full_name', '') from auth.users
on conflict (id) do nothing;

create or replace function private.protect_last_super_admin()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  new.updated_at := now();
  if old.role = 'super_administrador'
     and (new.role <> 'super_administrador' or not new.active)
     and not exists (select 1 from public.profiles where id <> old.id and role = 'super_administrador' and active) then
    raise exception 'No se puede desactivar o degradar al ultimo super administrador';
  end if;
  return new;
end;
$$;
revoke all on function private.protect_last_super_admin() from public, anon, authenticated;

create trigger protect_last_super_admin before update on public.profiles
for each row execute function private.protect_last_super_admin();

-- Si hay exactamente una cuenta, será el primer superadministrador.
do $$
begin
  if (select count(*) from auth.users) = 1 then
    update public.profiles set role = 'super_administrador'
    where id = (select id from auth.users limit 1);
  end if;
end;
$$;
