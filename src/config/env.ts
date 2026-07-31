export const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.error("Missing Supabase environment variables. Please check your .env file.");
  // We don't throw an error to allow the app to boot in mock mode if preferred, 
  // but we warn aggressively for production readiness.
}
