-- =====================================================
-- Electro Mundo - esquema para Supabase
-- Pega TODO este archivo en: Supabase > SQL Editor > New query > Run
-- =====================================================

-- 1) Tablas -------------------------------------------------
create table if not exists public.productos (
  id          text primary key,
  name        text not null,
  price       numeric(10,2) not null check (price >= 0),
  old_price   numeric(10,2),
  category    text not null check (category in ('laptops','desktops','monitores','accesorios')),
  image       text not null,
  featured    boolean not null default false,
  offer       boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.mensajes_contacto (
  id          bigint generated always as identity primary key,
  nombre      text not null check (char_length(nombre) between 1 and 120),
  email       text not null check (char_length(email) between 3 and 200),
  created_at  timestamptz not null default now()
);

create table if not exists public.pedidos (
  id          bigint generated always as identity primary key,
  items       jsonb not null,
  total       numeric(10,2) not null check (total >= 0),
  created_at  timestamptz not null default now()
);

-- 2) Seguridad (Row Level Security) ---------------------------
alter table public.productos         enable row level security;
alter table public.mensajes_contacto enable row level security;
alter table public.pedidos           enable row level security;

-- Cualquiera puede VER los productos
drop policy if exists "productos_lectura_publica" on public.productos;
create policy "productos_lectura_publica"
  on public.productos for select
  to anon, authenticated
  using (true);

-- Cualquiera puede ENVIAR un mensaje (pero no leerlos)
drop policy if exists "mensajes_insertar_publico" on public.mensajes_contacto;
create policy "mensajes_insertar_publico"
  on public.mensajes_contacto for insert
  to anon, authenticated
  with check (true);

-- Cualquiera puede REGISTRAR un pedido (pero no leerlos)
drop policy if exists "pedidos_insertar_publico" on public.pedidos;
create policy "pedidos_insertar_publico"
  on public.pedidos for insert
  to anon, authenticated
  with check (true);

-- 3) Datos iniciales (los 12 productos que tenias en app.js) ---
insert into public.productos (id, name, price, old_price, category, image, featured, offer) values
  ('hp-victus', 'HP - Victus 15.6" Gaming Laptop', 1800, null, 'laptops', 'img/laptop-hp.webp', true, false),
  ('dell-g15', 'Dell - G15 15.6" Gaming Laptop', 2000, null, 'laptops', 'img/laptop-dell.webp', true, false),
  ('asus-rog', 'ASUS - ROG Gaming Desktop', 2500, null, 'desktops', 'img/pc-asus.webp', true, false),
  ('acer-nitro-27', 'Acer - Nitro 27" Gaming Monitor', 1800, null, 'monitores', 'img/monitor-acer.webp', true, false),
  ('acer-nitro-27b', 'Acer - Nitro 27" Gaming Monitor', 1800, null, 'monitores', 'img/monitor-acer-2.webp', true, false),
  ('lenovo-loq', 'Lenovo - LOQ 15.6" Gaming Laptop', 2199, 2499, 'laptops', 'img/laptop-cat.webp', false, true),
  ('acer-nitro5', 'Acer - Nitro 5 15.6" Gaming Laptop', 1699, 1999, 'laptops', 'img/laptop-hp.webp', false, true),
  ('hp-omen', 'HP - OMEN Desktop Gaming', 2899, null, 'desktops', 'img/desktop-cat.webp', false, false),
  ('ryzen-pc', 'PC Gamer Ryzen 5 + RTX 4060', 2399, 2799, 'desktops', 'img/pc-asus.webp', false, true),
  ('headset-g', 'Audífonos Gamer RGB 7.1', 189, 249, 'accesorios', 'img/accesorios.webp', false, true),
  ('mouse-g', 'Mouse Gamer 16000 DPI', 99, null, 'accesorios', 'img/accesorios.webp', false, false),
  ('lg-ultragear', 'LG - UltraGear 27" 165Hz', 1299, 1599, 'monitores', 'img/monitor-acer.webp', false, true)
on conflict (id) do update set
  name = excluded.name, price = excluded.price, old_price = excluded.old_price,
  category = excluded.category, image = excluded.image,
  featured = excluded.featured, offer = excluded.offer;
