import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. App will not function properly without valid credentials.');
}

export const supabase = createClient(
  supabaseUrl || 'http://127.0.0.1:54321',
  supabaseAnonKey || 'dummy_key'
);
