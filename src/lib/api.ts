/**
 * Supabase APIコール集約レイヤー
 * 各画面はこのファイルの関数を通じてDBを操作する
 */

import { supabase } from './supabase';
import { Venue, Product, ProductOption, Order, OrderItem } from '../app/types';

// ─────────────────────────────────────────────
// Venues
// ─────────────────────────────────────────────

export async function fetchVenues(): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createVenue(name: string): Promise<Venue> {
  const { data: venue, error } = await supabase
    .from('venues')
    .insert({ name })
    .select()
    .single();
  if (error) throw error;

  // デフォルトの初期メニューを登録
  const defaultProducts = [
    { venue_id: venue.id, name: 'アメリカーノ', category: 'コーヒー', price: 450, order_index: 1 },
    { venue_id: venue.id, name: 'カフェラテ', category: 'コーヒー', price: 500, order_index: 2 },
    { venue_id: venue.id, name: 'エスプレッソ', category: 'コーヒー', price: 400, order_index: 3 },
    { venue_id: venue.id, name: 'ドリップコーヒー', category: 'コーヒー', price: 450, order_index: 4 },
    { venue_id: venue.id, name: 'ティー', category: 'その他', price: 400, order_index: 5 },
  ];
  await supabase.from('products').insert(defaultProducts);

  // デフォルトのオプションを登録
  const defaultOptions = [
    { venue_id: venue.id, name: 'ショット追加', price: 100 },
    { venue_id: venue.id, name: 'ミルク変更（豆乳）', price: 50 },
    { venue_id: venue.id, name: 'ミルク変更（オーツ）', price: 100 },
    { venue_id: venue.id, name: 'シロップ追加（バニラ）', price: 50 },
  ];
  await supabase.from('product_options').insert(defaultOptions);

  return venue;
}

export async function updateVenueName(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('venues')
    .update({ name })
    .eq('id', id);
  if (error) throw error;
}

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────

export async function fetchProducts(venueId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('venue_id', venueId)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createProduct(
  venueId: string,
  name: string,
  category: string,
  price: number,
  orderIndex: number,
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({ venue_id: venueId, name, category, price, order_index: orderIndex })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(
  productId: string,
  updates: Partial<Pick<Product, 'name' | 'category' | 'price' | 'order_index' | 'is_visible'>>,
): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId);
  if (error) throw error;
}

export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);
  if (error) throw error;
}

// ─────────────────────────────────────────────
// ProductOptions
// ─────────────────────────────────────────────

export async function fetchProductOptions(venueId: string): Promise<ProductOption[]> {
  const { data, error } = await supabase
    .from('product_options')
    .select('*')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createProductOption(
  venueId: string,
  name: string,
  price: number
): Promise<ProductOption> {
  const { data, error } = await supabase
    .from('product_options')
    .insert({ venue_id: venueId, name, price })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProductOption(optionId: string): Promise<void> {
  const { error } = await supabase
    .from('product_options')
    .delete()
    .eq('id', optionId);
  if (error) throw error;
}

// ─────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────

/** 会場の注文を全取得（明細・オプション含む）*/
export async function fetchOrders(venueId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items: order_items (
        *,
        options: order_item_options (*)
      )
    `)
    .eq('venue_id', venueId)
    .order('order_number', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** 今日の注文を取得（集計・履歴用）*/
export async function fetchTodayOrders(venueId: string): Promise<Order[]> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items: order_items (
        *,
        options: order_item_options (*)
      )
    `)
    .eq('venue_id', venueId)
    .gte('ordered_at', todayStart.toISOString())
    .order('order_number', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** 次の注文番号を採番（当日の最大値 + 1）*/
export async function getNextOrderNumber(venueId: string): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('orders')
    .select('order_number')
    .eq('venue_id', venueId)
    .gte('ordered_at', todayStart.toISOString())
    .order('order_number', { ascending: false })
    .limit(1);
  if (error) throw error;
  if (data && data.length > 0) return data[0].order_number + 1;
  return 1;
}

/** 注文を登録（ヘッダー + 明細 + オプションを一括投入）*/
export async function createOrder(
  venueId: string,
  items: (Pick<OrderItem, 'product_id' | 'product_name' | 'product_category' | 'price' | 'quantity'> & {
    selected_options?: { id: string; name: string; price: number }[]
  })[],
  memo: string,
): Promise<Order> {
  // 合計金額の計算（オプション代を含む）
  const totalAmount = items.reduce((sum, i) => {
    const optionsTotal = (i.selected_options || []).reduce((acc, opt) => acc + opt.price, 0);
    return sum + (i.price + optionsTotal) * i.quantity;
  }, 0);

  const orderNumber = await getNextOrderNumber(venueId);

  // 1. 注文ヘッダーの登録
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      venue_id: venueId,
      order_number: orderNumber,
      total_amount: totalAmount,
      status: '受付済',
      memo: memo || null,
    })
    .select()
    .single();
  if (orderError) throw orderError;

  // 2. 各アイテムの登録
  for (const item of items) {
    const { data: insertedItem, error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_category: item.product_category,
        price: item.price,
        quantity: item.quantity,
      })
      .select()
      .single();
    if (itemError) throw itemError;

    // 3. アイテムに紐づくオプションの登録
    if (item.selected_options && item.selected_options.length > 0) {
      const optionRows = item.selected_options.map((opt) => ({
        order_item_id: insertedItem.id,
        option_id: opt.id,
        option_name: opt.name,
        price: opt.price,
      }));
      const { error: optionsError } = await supabase.from('order_item_options').insert(optionRows);
      if (optionsError) throw optionsError;
    }
  }

  return { ...order, items: [] };
}

/** 注文ステータスを更新 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
): Promise<void> {
  const updates: Record<string, unknown> = { status };
  if (status === '完了') {
    updates.completed_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId);
  if (error) throw error;
}
