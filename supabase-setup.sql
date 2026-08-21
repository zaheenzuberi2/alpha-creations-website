-- Alpha Creations — Supabase schema setup
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query > Run)

-- =====================================================================
-- LEADS (contact form + chatbot submissions)
-- Public visitors can only INSERT. Only a logged-in admin can read/edit/delete.
-- =====================================================================
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  event_date text,
  message text,
  source text not null default 'form', -- 'form' | 'chatbot'
  contacted boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "public can insert leads" on public.leads
  for insert to anon
  with check (true);

create policy "authenticated can read leads" on public.leads
  for select to authenticated
  using (true);

create policy "authenticated can update leads" on public.leads
  for update to authenticated
  using (true) with check (true);

create policy "authenticated can delete leads" on public.leads
  for delete to authenticated
  using (true);

-- =====================================================================
-- GALLERY (photos shown on the public site, managed from the admin panel)
-- Everyone can read. Only a logged-in admin can add/edit/delete.
-- =====================================================================
create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,   -- either a relative site path (assets/...) or a Supabase Storage public URL
  caption text,
  category text,
  span_two boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.gallery enable row level security;

create policy "public can read gallery" on public.gallery
  for select to anon
  using (true);

create policy "authenticated can insert gallery" on public.gallery
  for insert to authenticated
  with check (true);

create policy "authenticated can update gallery" on public.gallery
  for update to authenticated
  using (true) with check (true);

create policy "authenticated can delete gallery" on public.gallery
  for delete to authenticated
  using (true);

-- Seed the 6 existing photos so the gallery isn't empty on first load
insert into public.gallery (image_path, caption, category, span_two, sort_order) values
  ('assets/mehndi-stage-yellow.jpg', 'Outdoor stage, marigold & fairy lights', 'Mehndi & Wedding', true, 0),
  ('assets/baby-shower-blue.jpg', 'Balloon & floral backdrop', 'Baby Shower', false, 1),
  ('assets/birthday-balloons.jpg', 'Balloon garland arch', 'Birthday', false, 2),
  ('assets/outdoor-lights.jpg', 'Fairy-light entrance design', 'Venue Lighting', true, 3),
  ('assets/mehndi-backdrop-curtains.jpg', 'Curtain backdrop & seating', 'Mehndi', true, 4),
  ('assets/mehndi-stage-colorful.jpg', 'Indoor stage design', 'Mehndi', false, 5);

-- =====================================================================
-- STORAGE bucket for newly uploaded gallery photos (public read, admin write)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "public can view gallery photos" on storage.objects
  for select to anon
  using (bucket_id = 'gallery');

create policy "authenticated can upload gallery photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gallery');

create policy "authenticated can delete gallery photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gallery');
