-- FASE 1: usuarios, roles, estados. Pegar en SQL Editor y ejecutar (Run).

-- Perfiles (uno por usuario registrado)
create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text, email text, telefono text,
  rol text not null default 'cliente' check (rol in ('cliente','admin')),
  created_at timestamptz not null default now()
);
alter table public.perfiles enable row level security;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre, email)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
          new.email)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Funcion para saber si quien consulta es admin
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin');
$$;

drop policy if exists "perfil_propio_select" on public.perfiles;
create policy "perfil_propio_select" on public.perfiles for select
  to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "perfil_propio_update" on public.perfiles;
create policy "perfil_propio_update" on public.perfiles for update
  to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.perfiles from authenticated;
grant update (nombre, telefono) on public.perfiles to authenticated;

-- Mensajes de contacto: estado + texto del mensaje
alter table public.mensajes_contacto
  add column if not exists mensaje text,
  add column if not exists estado text not null default 'nuevo'
    check (estado in ('nuevo','en_curso','atendido'));
drop policy if exists "mensajes_admin_select" on public.mensajes_contacto;
create policy "mensajes_admin_select" on public.mensajes_contacto for select
  to authenticated using (public.is_admin());
drop policy if exists "mensajes_admin_update" on public.mensajes_contacto;
create policy "mensajes_admin_update" on public.mensajes_contacto for update
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- Pedidos: dueño + estado
alter table public.pedidos
  add column if not exists user_id uuid default auth.uid() references auth.users(id),
  add column if not exists estado text not null default 'pendiente'
    check (estado in ('pendiente','en_proceso','enviado','entregado','cancelado'));
drop policy if exists "pedidos_select_propio_o_admin" on public.pedidos;
create policy "pedidos_select_propio_o_admin" on public.pedidos for select
  to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "pedidos_admin_update" on public.pedidos;
create policy "pedidos_admin_update" on public.pedidos for update
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- Convertirte en admin (cambia el correo por el tuyo y ejecuta DESPUES de registrarte):
-- update public.perfiles set rol = 'admin' where email = 'tu-correo@ejemplo.com';
