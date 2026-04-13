import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: venues } = await supabase.from('venues').select('*').order('created_at', { ascending: false }).limit(2);
  console.log('Latest Venues:', venues);
  
  if (venues && venues.length > 0) {
    const { data: products } = await supabase.from('products').select('*').eq('venue_id', venues[0].id);
    console.log(`Products for newest venue (${venues[0].name}):`, products.length, 'items');
    console.log('Sample:', products.slice(0, 3).map(p => p.name));
  }
}
run();
