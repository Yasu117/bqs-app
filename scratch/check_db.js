import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxzvnvwiyommbgajmldb.supabase.co';
const supabaseKey = 'sb_publishable_bK5kYMr8Z8MKq-XgpJYMIw_IbAnBklN';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: venues, error: vError } = await supabase.from('venues').select('*');
    if (vError) {
        console.error('Error fetching venues:', vError);
        return;
    }
    console.log('--- Venues ---');
    console.log(JSON.stringify(venues, null, 2));
    
    for (const venue of venues) {
        const { data: products, error: pError } = await supabase.from('products').select('*').eq('venue_id', venue.id);
        if (pError) {
            console.error(`Error fetching products for ${venue.name}:`, pError);
            continue;
        }
        console.log(`\n--- Products for ${venue.name} ---`);
        console.log(JSON.stringify(products, null, 2));
    }
}

checkData();
