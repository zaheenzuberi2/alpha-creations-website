-- Adds the two new gallery videos pushed to the repo on 2026-09-04.
-- Run once in the Supabase SQL Editor (Project > SQL Editor > New query > Run).
-- Safe to run even if you already ran this — it only inserts rows that don't already exist.

insert into public.gallery (image_path, caption, category, span_two, sort_order)
select * from (values
  ('assets/event-highlights-video.mp4', 'Event highlights, in motion', 'Event Highlights', true, 12),
  ('assets/decor-setup-video.mp4', 'Decor setup, in motion', 'Decor Setup', true, 13)
) as new_rows(image_path, caption, category, span_two, sort_order)
where not exists (
  select 1 from public.gallery g where g.image_path = new_rows.image_path
);
