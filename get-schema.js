import { createClient } from '@supabase/supabase-js';
let rawUrl = process.env.VITE_SUPABASE_URL;
if (rawUrl.endsWith('/rest/v1/')) {
    rawUrl = rawUrl.replace('/rest/v1/', '');
} else if (rawUrl.endsWith('/rest/v1')) {
    rawUrl = rawUrl.replace('/rest/v1', '');
}
const supabase = createClient(rawUrl, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('not_exist').select('*').limit(1);
  console.log(error);
}
test();
