import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ProductButton } from '../components/ProductButton';
import { SelectedOrderItem } from '../components/SelectedOrderItem';
import { SettingsPanel } from '../components/SettingsPanel';
import { OptionModal } from '../components/OptionModal';
import { fetchProducts, fetchProductOptions, createOrder } from '../../lib/api';
import { Product, ProductOption, DraftOrderItem } from '../types';
import { toast } from 'sonner';

export function OrderInput() {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<DraftOrderItem[]>([]);
  const [memo, setMemo] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // オプション選択用
  const [selectingProduct, setSelectingProduct] = useState<Product | null>(null);

  const loadData = useCallback(async () => {
    if (!venueId) return;
    try {
      const [prods, opts] = await Promise.all([
        fetchProducts(venueId),
        fetchProductOptions(venueId)
      ]);
      setProducts(prods);
      setOptions(opts);
    } catch (err) {
      console.error('データ取得エラー:', err);
      toast.error('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!venueId) {
    navigate('/venues');
    return null;
  }

  const visibleProducts = products
    .filter((p) => p.is_visible)
    .sort((a, b) => a.order_index - b.order_index);

  const grouped = visibleProducts.reduce((acc, product) => {
    const cat = product.category || 'その他';
    if (!acc.has(cat)) acc.set(cat, []);
    acc.get(cat)!.push(product);
    return acc;
  }, new Map<string, Product[]>());

  // 商品をクリックしたとき
  const handleProductClick = (product: Product) => {
    setSelectingProduct(product);
  };

  // オプション決定時
  const handleConfirmOptions = (selected: ProductOption[]) => {
    if (!selectingProduct) return;

    const newItem: DraftOrderItem = {
      product_id: selectingProduct.id,
      product_name: selectingProduct.name,
      product_category: selectingProduct.category,
      price: selectingProduct.price,
      quantity: 1,
      selected_options: selected.map(s => ({
        id: s.id,
        name: s.name,
        price: s.price
      }))
    };

    setCart(prev => [...prev, newItem]);
    setSelectingProduct(null);
  };

  const handleRemoveItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (cart.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      await createOrder(venueId, cart, memo);
      setCart([]);
      setMemo('');
      toast.success('注文を登録しました');
    } catch (err) {
      console.error('注文登録エラー:', err);
      toast.error('注文の登録に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const total = cart.reduce((sum, item) => {
    const optionsTotal = item.selected_options.reduce((s, o) => s + o.price, 0);
    return sum + (item.price + optionsTotal) * item.quantity;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 animate-pulse text-lg">情報を取得中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* 左側: 商品一覧 */}
          <div className="order-2 md:order-1">
            {Array.from(grouped.entries()).map(([category, prods]) => (
              <div key={category} className="mb-8">
                <h2 className="text-sm font-bold mb-4 text-gray-500 tracking-widest pl-1 uppercase">
                  {category}
                </h2>
                <div className="grid gap-4">
                  {prods.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left flex justify-between items-center group"
                    >
                      <div>
                        <div className="text-lg font-bold text-gray-800 group-hover:text-blue-600 border-b-2 border-transparent group-hover:border-blue-100 inline-block transition-colors">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">¥{product.price.toLocaleString()}</div>
                      </div>
                      <div className="bg-gray-50 text-gray-400 p-2 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        追加
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 右側: カート */}
          <div className="order-1 md:order-2 md:sticky md:top-4 md:h-fit">
            <h2 className="text-sm font-bold mb-4 text-gray-500 tracking-widest uppercase">
              注文内容 ({cart.length})
            </h2>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden flex flex-col">
              {cart.length > 0 ? (
                <>
                  <div className="p-4 max-h-[400px] overflow-y-auto">
                    {cart.map((item, idx) => (
                      <SelectedOrderItem
                        key={`${item.product_id}-${idx}`}
                        item={item}
                        onRemove={() => handleRemoveItem(idx)}
                      />
                    ))}
                  </div>

                  <div className="bg-gray-50 p-6 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-500 font-medium">合計金額</span>
                      <span className="text-3xl font-bold text-gray-900">¥{total.toLocaleString()}</span>
                    </div>

                    <div className="mb-6">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">
                        カスタムメモ
                      </label>
                      <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="例：キャラメルを多め、等"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                        rows={2}
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full py-4 bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white rounded-xl text-lg font-bold shadow-lg transition-all"
                    >
                      {submitting ? '注文登録中...' : '注文を送信する'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-gray-400">
                  <div className="text-4xl mb-4">☕️</div>
                  <p className="text-sm">商品を選択してください</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* オプション選択モーダル */}
      {selectingProduct && (
        <OptionModal
          product={selectingProduct}
          availableOptions={options}
          onConfirm={handleConfirmOptions}
          onClose={() => setSelectingProduct(null)}
        />
      )}

      {/* 設定パネル */}
      {showSettings && (
        <SettingsPanel
          venueId={venueId}
          onClose={() => {
            setShowSettings(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
