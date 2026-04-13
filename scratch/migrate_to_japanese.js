import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxzvnvwiyommbgajmldb.supabase.co';
const supabaseKey = 'sb_publishable_bK5kYMr8Z8MKq-XgpJYMIw_IbAnBklN';

const supabase = createClient(supabaseUrl, supabaseKey);

const MENU_DATA = {
    products: [
        { name: 'エスプレッソ', category: '【コーヒー（HOT/ICE）】', price: 350, order_index: 10 },
        { name: 'アメリカーノ', category: '【コーヒー（HOT/ICE）】', price: 400, order_index: 20 },
        { name: 'ドリップコーヒー', category: '【コーヒー（HOT/ICE）】', price: 400, order_index: 30 },
        { name: 'カフェラテ', category: '【ミルク系（HOT/ICE）】', price: 500, order_index: 40 },
        { name: 'カプチーノ', category: '【ミルク系（HOT/ICE）】', price: 500, order_index: 50 },
        { name: 'フラットホワイト', category: '【ミルク系（HOT/ICE）】', price: 550, order_index: 60 },
        { name: 'カフェモカ', category: '【ミルク系（HOT/ICE）】', price: 600, order_index: 70 },
        { name: 'キャラメルラテ', category: '【ミルク系（HOT/ICE）】', price: 600, order_index: 80 },
        { name: 'バニララテ', category: '【アレンジ系】', price: 600, order_index: 90 },
        { name: 'ヘーゼルナッツラテ', category: '【アレンジ系】', price: 600, order_index: 100 },
        { name: 'ハニーラテ', category: '【アレンジ系】', price: 600, order_index: 110 },
        { name: '紅茶（HOT/ICE）', category: '【その他ドリンク】', price: 400, order_index: 120 },
        { name: 'チャイラテ', category: '【その他ドリンク】', price: 550, order_index: 130 },
        { name: '抹茶ラテ', category: '【その他ドリンク】', price: 550, order_index: 140 },
        { name: 'ココア', category: '【その他ドリンク】', price: 500, order_index: 150 },
        { name: 'デカフェコーヒー', category: '【ノンカフェイン】', price: 450, order_index: 160 },
        { name: 'デカフェラテ', category: '【ノンカフェイン】', price: 550, order_index: 170 },
    ],
    options: [
        { name: 'ミルク変更（牛乳）', price: 0 },
        { name: 'ミルク変更（豆乳）', price: 0 },
        { name: 'ミルク変更（オーツミルク）', price: 0 },
        { name: 'ミルク多め', price: 0 },
        { name: 'ミルク少なめ', price: 0 },
        { name: 'ショット追加', price: 100 },
        { name: 'シロップ追加（バニラ）', price: 50 },
        { name: 'シロップ追加（キャラメル）', price: 50 },
        { name: 'シロップ追加（ヘーゼルナッツ）', price: 50 },
        { name: 'ホイップ追加', price: 50 },
    ]
};

async function updateDatabase() {
    // 1. 会場を取得
    const { data: venues } = await supabase.from('venues').select('*');
    if (!venues) return;

    for (const venue of venues) {
        console.log(`Updating ${venue.name}...`);
        
        // 既存商品を削除
        await supabase.from('products').delete().eq('venue_id', venue.id);
        // 既存オプションを削除
        await supabase.from('product_options').delete().eq('venue_id', venue.id);

        // 会場名を「青山オフィス」に変更（対象なら）
        if (venue.name === 'Aoyama Office' || venue.name === '青山オフィス') {
            await supabase.from('venues').update({ name: '青山オフィス' }).eq('id', venue.id);
        }

        // 商品を投入
        const productsToInsert = MENU_DATA.products.map(p => ({ ...p, venue_id: venue.id }));
        const { error: pError } = await supabase.from('products').insert(productsToInsert);
        if (pError) console.error('Product insert error:', pError);

        // オプションを投入
        const optionsToInsert = MENU_DATA.options.map(o => ({ ...o, venue_id: venue.id }));
        const { error: oError } = await supabase.from('product_options').insert(optionsToInsert);
        if (oError) console.error('Option insert error:', oError);

        console.log(`Updated ${venue.name} successfully.`);
    }
}

updateDatabase();
