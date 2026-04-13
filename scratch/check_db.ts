import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxzvnvwiyommbgajmldb.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''; // I might not have this env here

async function checkData() {
    const supabase = createClient(supabaseUrl, 'REPLACE_WITH_ACTUAL_KEY_IF_NEEDED');
    const { data: venues } = await supabase.from('venues').select('*');
    console.log('Venues:', venues);
    
    if (venues && venues.length > 0) {
        const { data: products } = await supabase.from('products').select('*').eq('venue_id', venues[0].id);
        console.log('Products for', venues[0].name, ':', products);
    }
}

// checkData();
