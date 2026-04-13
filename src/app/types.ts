// 型定義（Supabase DBスキーマと1対1対応）

export type OrderStatus = '受付済' | '作成中' | '完了' | 'キャンセル';

export interface Venue {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  venue_id: string;
  name: string;
  category: string;
  price: number;
  order_index: number;
  is_visible: boolean;
  created_at: string;
}

export interface ProductOption {
  id: string;
  venue_id: string;
  name: string;
  price: number;
  created_at: string;
}

export interface OrderItemOption {
  id: string;
  order_item_id: string;
  option_id: string | null;
  option_name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_category: string;
  price: number;
  quantity: number;
  created_at: string;
  options?: OrderItemOption[];
}

export interface Order {
  id: string;
  venue_id: string;
  order_number: number;
  total_amount: number;
  status: OrderStatus;
  memo: string | null;
  ordered_at: string;
  completed_at: string | null;
  items?: OrderItem[];
}

/** 注文入力時の一時アイテム（DBにはまだ存在しない）*/
export interface DraftOrderItem {
  product_id: string;
  product_name: string;
  product_category: string;
  price: number;
  quantity: number;
  selected_options: {
    id: string;
    name: string;
    price: number;
  }[];
}

/** URLパラメータ */
export interface VenueParams {
  venueId: string;
}