-- Adds the 4 new gallery photos pushed to the repo on 2026-08-31.
-- Run once in the Supabase SQL Editor (Project > SQL Editor > New query > Run).

insert into public.gallery (image_path, caption, category, span_two, sort_order) values
  ('assets/wedding-neon-sign.jpg', 'Custom neon ''Shadi Mubarak'' sign', 'Wedding', false, 6),
  ('assets/mehndi-floral-swing.jpg', 'Floral jhoola for the bride', 'Mehndi', false, 7),
  ('assets/venue-red-lighting.jpg', 'Full venue lit for the event', 'Venue Lighting', true, 8),
  ('assets/dholki-backdrop.jpg', 'Dholki lounge with photo props', 'Dholki', true, 9);
