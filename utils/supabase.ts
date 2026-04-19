import { createClient } from '@supabase/supabase-js';

/**
 * Astro only exposes `PUBLIC_*` env vars to client-side bundled code (e.g. `<script>` in .astro).
 * `VITE_*` still works in server/frontmatter, so we fall back for SSR/build-time usage.
 */
const supabaseUrl =
  import.meta.env.PUBLIC_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);