/* Paste the two values from Supabase: Project Settings > API.
   The anon key is meant to be public. Security comes from the database rules in supabase-setup.sql. */
window.MOMO_CONFIG = {
  url: 'https://YOUR-PROJECT-ID.supabase.co',
  key: 'YOUR-ANON-PUBLIC-KEY',
  vapidPublic: 'YOUR-NOTIFICATION-PUBLIC-KEY'   /* from make-keys.html */
};
