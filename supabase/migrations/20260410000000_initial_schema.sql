BEGIN;

-- 会場
CREATE TABLE IF NOT EXISTS venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 商品マスタ
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- オプションマスタ
CREATE TABLE IF NOT EXISTS product_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 注文履歴
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  order_number INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT '受付済',
  memo TEXT,
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 注文明細
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID, 
  product_name TEXT NOT NULL,
  product_category TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 注文明細の選択オプション
CREATE TABLE IF NOT EXISTS order_item_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE NOT NULL,
  option_id UUID,
  option_name TEXT NOT NULL,
  price INTEGER NOT NULL
);

COMMIT;
