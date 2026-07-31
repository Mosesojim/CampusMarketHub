import { createClient } from '@supabase/supabase-js';

console.log("Supabase URL provided to build:", import.meta.env.VITE_SUPABASE_URL ? "Yes (length: " + import.meta.env.VITE_SUPABASE_URL.length + ")" : "No");
let rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
// Strip quotes if accidentally added in Vercel
rawUrl = rawUrl.replace(/^["']|["']$/g, '');

if (rawUrl.endsWith('/rest/v1/')) {
    rawUrl = rawUrl.replace('/rest/v1/', '');
} else if (rawUrl.endsWith('/rest/v1')) {
    rawUrl = rawUrl.replace('/rest/v1', '');
}
const supabaseUrl = rawUrl;
let supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
supabaseKey = supabaseKey.replace(/^["']|["']$/g, '');



const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  const urlString = url.toString();
  if (urlString.includes('placeholder-url')) {
    // Return a fake Response to avoid Uncaught Promise Rejections in Supabase internals
    return new Response(JSON.stringify({ error: "mock instance" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return fetch(url, options);
};

export const isMock = supabaseUrl.includes('placeholder-url');
export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: customFetch
  }
});
// Trigger rebuild for Vercel env vars
