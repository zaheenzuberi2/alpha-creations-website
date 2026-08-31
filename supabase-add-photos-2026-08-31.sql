-- Adds the new gallery photos/video pushed to the repo on 2026-08-31.
-- Run once in the Supabase SQL Editor (Project > SQL Editor > New query > Run).
-- Safe to run even if you already ran an earlier version of this file —
-- it only inserts rows that don't already exist (matched by image_path).

insert into public.gallery (image_path, caption, category, span_two, sort_order)
select * from (values
  ('assets/wedding-neon-sign.jpg', 'Custom neon ''Shadi Mubarak'' sign', 'Wedding', false, 6),
  ('assets/mehndi-floral-swing.jpg', 'Floral jhoola for the bride', 'Mehndi', false, 7),
  ('assets/venue-red-lighting.jpg', 'Full venue lit for the event', 'Venue Lighting', true, 8),
  ('assets/dholki-backdrop.jpg', 'Dholki lounge with photo props', 'Dholki', true, 9),
  ('assets/mall-facade-lighting.jpg', 'Storefront lit up for the occasion', 'Venue Lighting', true, 10),
  ('assets/venue-lighting-video.mp4', 'Venue lighting, in motion', 'Venue Lighting', true, 11)
) as new_rows(image_path, caption, category, span_two, sort_order)
where not exists (
  select 1 from public.gallery g where g.image_path = new_rows.image_path
);
