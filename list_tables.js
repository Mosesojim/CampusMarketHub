import { createClient } from '@supabase/supabase-js';
const rawUrl = 'https://gnnyderdrpzkjjbjsaib.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdubnlkZXJkcnB6a2pqYmpzYWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDY4OTksImV4cCI6MjEwMDEyMjg5OX0.U2E4a0Rn3Riqsm1rCT3-9LqmE2o0f7jocbd870gqBGY';
const supabase = createClient(rawUrl, supabaseKey);

async function test() {
  const tables = ['users', 'user_profiles', 'vendor_profiles', 'vendors', 'sellers', 'profiles'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    console.log(t, error ? error.message : "EXISTS!");
  }
}
test();
