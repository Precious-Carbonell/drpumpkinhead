import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('WARNING: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  console.error('SUPABASE_URL:', supabaseUrl || '(empty)');
  console.error('SUPABASE_SERVICE_KEY:', supabaseKey ? `${supabaseKey.slice(0, 20)}...` : '(empty)');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
