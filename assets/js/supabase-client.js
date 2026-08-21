// Shared Supabase client — used by the public site (leads, gallery reads)
// and the admin panel (auth, gallery writes, lead management).
//
// The key below is the "publishable" (anon) key: it is meant to be public.
// It has no power beyond what the Row Level Security policies in
// supabase-setup.sql explicitly grant to the "anon" / "authenticated" roles.
// Never put the "secret" key anywhere in this site's code.
(function () {
  "use strict";
  var SUPABASE_URL = "https://bpcppbohpubspgskoogp.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_YQVrdoMffxfyxoQJz8IFVw_7RZ45-co";

  if (typeof window.supabase === "undefined") {
    console.error("Supabase client library failed to load.");
    return;
  }
  window.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
