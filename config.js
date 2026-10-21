/* Paste the two values from Supabase: Project Settings > API.
   The anon key is meant to be public. Security comes from the database rules in supabase-setup.sql. */
window.MOMO_CONFIG = {
  url: 'https://YOUR-PROJECT-ID.supabase.co',
  key: 'YOUR-ANON-PUBLIC-KEY',
  vapidPublic: 'BOvLZjflJOJlTKysDm6-AEaEtJ9frlkxvaIF0YGI2t9UzbELNq6i-FuQPFAtIaYDs4vj1CEikNzMUMZguhiulIA'   /* from make-keys.html */
};
