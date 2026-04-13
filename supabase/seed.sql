DO $$
DECLARE
  v_venue_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO venues (id, name) VALUES (v_venue_id, '青山オフィス');

  -- 【コーヒー（HOT/ICE）】
  INSERT INTO products (venue_id, name, category, price, order_index) VALUES
  (v_venue_id, 'エスプレッソ', 'コーヒー（HOT/ICE）', 350, 10),
  (v_venue_id, 'アメリカーノ', 'コーヒー（HOT/ICE）', 400, 20),
  (v_venue_id, 'ドリップコーヒー', 'コーヒー（HOT/ICE）', 400, 30);

  -- 【ミルク系（HOT/ICE）】
  INSERT INTO products (venue_id, name, category, price, order_index) VALUES
  (v_venue_id, 'カフェラテ', 'ミルク系（HOT/ICE）', 500, 40),
  (v_venue_id, 'カプチーノ', 'ミルク系（HOT/ICE）', 500, 50),
  (v_venue_id, 'フラットホワイト', 'ミルク系（HOT/ICE）', 550, 60),
  (v_venue_id, 'カフェモカ', 'ミルク系（HOT/ICE）', 600, 70),
  (v_venue_id, 'キャラメルラテ', 'ミルク系（HOT/ICE）', 600, 80);

  -- 【アレンジ系】
  INSERT INTO products (venue_id, name, category, price, order_index) VALUES
  (v_venue_id, 'バニララテ', 'アレンジ系', 600, 90),
  (v_venue_id, 'ヘーゼルナッツラテ', 'アレンジ系', 600, 100),
  (v_venue_id, 'ハニーラテ', 'アレンジ系', 600, 110);

  -- 【その他ドリンク】
  INSERT INTO products (venue_id, name, category, price, order_index) VALUES
  (v_venue_id, '紅茶（HOT/ICE）', 'その他ドリンク', 400, 120),
  (v_venue_id, 'チャイラテ', 'その他ドリンク', 550, 130),
  (v_venue_id, '抹茶ラテ', 'その他ドリンク', 550, 140),
  (v_venue_id, 'ココア', 'その他ドリンク', 500, 150);

  -- 【ノンカフェイン】
  INSERT INTO products (venue_id, name, category, price, order_index) VALUES
  (v_venue_id, 'デカフェコーヒー', 'ノンカフェイン', 450, 160),
  (v_venue_id, 'デカフェラテ', 'ノンカフェイン', 550, 170);

  -- 【オプション】
  INSERT INTO product_options (venue_id, name, price) VALUES
  (v_venue_id, 'ミルク変更（牛乳）', 0),
  (v_venue_id, 'ミルク変更（豆乳）', 0),
  (v_venue_id, 'ミルク変更（オーツミルク）', 0),
  (v_venue_id, 'ミルク多め', 0),
  (v_venue_id, 'ミルク少なめ', 0),
  (v_venue_id, 'ショット追加', 100),
  (v_venue_id, 'シロップ追加（バニラ）', 50),
  (v_venue_id, 'シロップ追加（キャラメル）', 50),
  (v_venue_id, 'シロップ追加（ヘーゼルナッツ）', 50),
  (v_venue_id, 'ホイップ追加', 50);

END $$;

