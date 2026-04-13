// データストア管理（localStorage使用）
import { AppState, Venue, Order, Product, OrderItem } from './types';

const STORAGE_KEY = 'barista-queue-app';

// 初期データ
const initialState: AppState = {
  venues: [
    {
      id: '1',
      name: '青山オフィス',
      products: [
        // コーヒー（HOT/ICE）
        { id: 'c1', name: 'エスプレッソ', category: 'コーヒー（HOT/ICE）', price: 350, order: 10, visible: true },
        { id: 'c2', name: 'アメリカーノ', category: 'コーヒー（HOT/ICE）', price: 400, order: 20, visible: true },
        { id: 'c3', name: 'ドリップコーヒー', category: 'コーヒー（HOT/ICE）', price: 400, order: 30, visible: true },
        
        // ミルク系（HOT/ICE）
        { id: 'm1', name: 'カフェラテ', category: 'ミルク系（HOT/ICE）', price: 500, order: 40, visible: true },
        { id: 'm2', name: 'カプチーノ', category: 'ミルク系（HOT/ICE）', price: 500, order: 50, visible: true },
        { id: 'm3', name: 'フラットホワイト', category: 'ミルク系（HOT/ICE）', price: 550, order: 60, visible: true },
        { id: 'm4', name: 'カフェモカ', category: 'ミルク系（HOT/ICE）', price: 600, order: 70, visible: true },
        { id: 'm5', name: 'キャラメルラテ', category: 'ミルク系（HOT/ICE）', price: 600, order: 80, visible: true },
        
        // アレンジ系
        { id: 'a1', name: 'バニララテ', category: 'アレンジ系', price: 600, order: 90, visible: true },
        { id: 'a2', name: 'ヘーゼルナッツラテ', category: 'アレンジ系', price: 600, order: 100, visible: true },
        { id: 'a3', name: 'ハニーラテ', category: 'アレンジ系', price: 600, order: 110, visible: true },
        
        // その他ドリンク
        { id: 'o1', name: '紅茶（HOT/ICE）', category: 'その他ドリンク', price: 400, order: 120, visible: true },
        { id: 'o2', name: 'チャイラテ', category: 'その他ドリンク', price: 550, order: 130, visible: true },
        { id: 'o3', name: '抹茶ラテ', category: 'その他ドリンク', price: 550, order: 140, visible: true },
        { id: 'o4', name: 'ココア', category: 'その他ドリンク', price: 500, order: 150, visible: true },
        
        // ノンカフェイン
        { id: 'd1', name: 'デカフェコーヒー', category: 'ノンカフェイン', price: 450, order: 160, visible: true },
        { id: 'd2', name: 'デカフェラテ', category: 'ノンカフェイン', price: 550, order: 170, visible: true },
        
        // オプション
        { id: 'opt1', name: 'ミルク変更（牛乳 / 豆乳 / オーツミルク）', category: 'オプション', price: 0, order: 1000, visible: true },
        { id: 'opt2', name: 'ミルク多め少なめ', category: 'オプション', price: 0, order: 1010, visible: true },
        { id: 'opt3', name: 'ショット追加', category: 'オプション', price: 100, order: 1020, visible: true },
        { id: 'opt4', name: 'シロップ追加（バニラ / キャラメル / ヘーゼルナッツ）', category: 'オプション', price: 50, order: 1030, visible: true },
        { id: 'opt5', name: 'ホイップ追加', category: 'オプション', price: 50, order: 1040, visible: true },
      ],
      createdAt: new Date().toISOString(),
    },
  ],
  orders: [],
  currentVenueId: '1',
};

// ストアの読み込み
export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return initialState;
}

// ストアの保存
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

// 現在の会場を取得
export function getCurrentVenue(state: AppState): Venue | null {
  return state.venues.find(v => v.id === state.currentVenueId) || null;
}

// 会場の注文を取得
export function getVenueOrders(state: AppState, venueId: string): Order[] {
  return state.orders.filter(o => o.venueId === venueId);
}

// 次の注文番号を取得
export function getNextOrderNumber(state: AppState, venueId: string): number {
  const venueOrders = getVenueOrders(state, venueId);
  if (venueOrders.length === 0) return 1;
  return Math.max(...venueOrders.map(o => o.orderNumber)) + 1;
}

// 注文を追加
export function addOrder(state: AppState, venueId: string, items: OrderItem[], memo: string): AppState {
  const order: Order = {
    id: `order-${Date.now()}-${Math.random()}`,
    orderNumber: getNextOrderNumber(state, venueId),
    venueId,
    items,
    memo,
    status: '受付済',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const newState = {
    ...state,
    orders: [...state.orders, order],
  };
  saveState(newState);
  return newState;
}

// 注文ステータスを更新
export function updateOrderStatus(state: AppState, orderId: string, status: Order['status']): AppState {
  const now = new Date().toISOString();
  const newState = {
    ...state,
    orders: state.orders.map(o =>
      o.id === orderId
        ? { 
            ...o, 
            status, 
            updatedAt: now,
            ...(status === '完了' && !o.completedAt ? { completedAt: now } : {})
          }
        : o
    ),
  };
  saveState(newState);
  return newState;
}

// 会場を切り替え
export function switchVenue(state: AppState, venueId: string): AppState {
  const newState = {
    ...state,
    currentVenueId: venueId,
  };
  saveState(newState);
  return newState;
}

// 会場を追加
export function addVenue(state: AppState, name: string): AppState {
  const venue: Venue = {
    id: `venue-${Date.now()}`,
    name,
    products: [],
    createdAt: new Date().toISOString(),
  };
  
  const newState = {
    ...state,
    venues: [...state.venues, venue],
  };
  saveState(newState);
  return newState;
}

// 会場を更新
export function updateVenue(state: AppState, venueId: string, name: string): AppState {
  const newState = {
    ...state,
    venues: state.venues.map(v =>
      v.id === venueId ? { ...v, name } : v
    ),
  };
  saveState(newState);
  return newState;
}

// 商品を追加
export function addProduct(state: AppState, venueId: string, name: string, category: string, price: number): AppState {
  const newState = {
    ...state,
    venues: state.venues.map(v => {
      if (v.id === venueId) {
        const maxOrder = Math.max(0, ...v.products.map(p => p.order));
        const product: Product = {
          id: `product-${Date.now()}`,
          name,
          category,
          price,
          order: maxOrder + 1,
          visible: true,
        };
        return { ...v, products: [...v.products, product] };
      }
      return v;
    }),
  };
  saveState(newState);
  return newState;
}

// 商品を更新
export function updateProduct(
  state: AppState,
  venueId: string,
  productId: string,
  updates: Partial<Product>
): AppState {
  const newState = {
    ...state,
    venues: state.venues.map(v => {
      if (v.id === venueId) {
        return {
          ...v,
          products: v.products.map(p =>
            p.id === productId ? { ...p, ...updates } : p
          ),
        };
      }
      return v;
    }),
  };
  saveState(newState);
  return newState;
}

// 商品を削除
export function deleteProduct(state: AppState, venueId: string, productId: string): AppState {
  const newState = {
    ...state,
    venues: state.venues.map(v => {
      if (v.id === venueId) {
        return {
          ...v,
          products: v.products.filter(p => p.id !== productId),
        };
      }
      return v;
    }),
  };
  saveState(newState);
  return newState;
}