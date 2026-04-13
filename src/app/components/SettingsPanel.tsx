import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProductOptions,
  createProductOption,
  deleteProductOption,
} from '../../lib/api';
import { Product, ProductOption } from '../types';
import { toast } from 'sonner';

interface SettingsPanelProps {
  venueId: string;
  onClose: () => void;
}

export function SettingsPanel({ venueId, onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'options'>('products');

  // ─── 商品管理 ───
  const [products, setProducts] = useState<Product[]>([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  // ─── オプション管理 ───
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionPrice, setNewOptionPrice] = useState('');

  // ─── 読み込み ───
  const loadProducts = useCallback(async () => {
    try {
      setProducts(await fetchProducts(venueId));
    } catch {
      toast.error('商品の読み込みに失敗しました');
    }
  }, [venueId]);

  const loadOptions = useCallback(async () => {
    try {
      setOptions(await fetchProductOptions(venueId));
    } catch {
      toast.error('オプションの読み込みに失敗しました');
    }
  }, [venueId]);

  useEffect(() => {
    loadProducts();
    loadOptions();
  }, [loadProducts, loadOptions]);

  // ─── 商品操作 ───
  const handleAddProduct = async () => {
    if (!newProductName.trim() || !newProductCategory.trim() || !newProductPrice) return;
    try {
      const maxOrder = Math.max(0, ...products.map((p) => p.order_index));
      await createProduct(
        venueId,
        newProductName.trim(),
        newProductCategory.trim(),
        Number(newProductPrice),
        maxOrder + 10,
      );
      setNewProductName('');
      setNewProductCategory('');
      setNewProductPrice('');
      await loadProducts();
      toast.success('商品を追加しました');
    } catch {
      toast.error('商品の追加に失敗しました');
    }
  };

  const handleToggleVisible = async (product: Product) => {
    try {
      await updateProduct(product.id, { is_visible: !product.is_visible });
      await loadProducts();
    } catch {
      toast.error('更新に失敗しました');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    // We can also upgrade this to a custom modal later, but keeping window.confirm for now or we just use it for simplicity
    if (!window.confirm('この商品を削除しますか？')) return;
    try {
      await deleteProduct(productId);
      await loadProducts();
      toast.success('商品を削除しました');
    } catch {
      toast.error('削除に失敗しました');
    }
  };

  // ─── オプション操作 ───
  const handleAddOption = async () => {
    if (!newOptionName.trim()) return;
    try {
      await createProductOption(venueId, newOptionName.trim(), Number(newOptionPrice || 0));
      setNewOptionName('');
      setNewOptionPrice('');
      await loadOptions();
      toast.success('オプションを追加しました');
    } catch {
      toast.error('オプションの追加に失敗しました');
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!window.confirm('このオプションを削除しますか？')) return;
    try {
      await deleteProductOption(optionId);
      await loadOptions();
      toast.success('オプションを削除しました');
    } catch {
      toast.error('削除に失敗しました');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right-full duration-300">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">メニュー・オプション設定</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-200">
          {(['products', 'options'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'border-b-2 border-black text-black bg-gray-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab === 'products' ? '商品 (メニュー)' : 'オプション'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'products' ? (
            /* ── メニュー管理タブ ── */
            <div className="animate-in fade-in duration-200">
              {/* 商品追加 */}
              <div className="mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <label className="block text-sm font-bold mb-3 text-gray-900">新しい商品を追加</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="商品名 (例: カフェラテ)"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                  />
                  <input
                    type="text"
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    placeholder="カテゴリー (例: コーヒー)"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="価格 (円)"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                    />
                    <button
                      onClick={handleAddProduct}
                      className="px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center font-bold"
                      disabled={!newProductName.trim() || !newProductCategory.trim() || !newProductPrice}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 商品一覧 */}
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-900">商品一覧</label>
                <div className="space-y-3">
                  {products.length === 0 && (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                      商品が登録されていません
                    </div>
                  )}
                  {products
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((product) => (
                      <div
                        key={product.id}
                        className={`border rounded-2xl p-4 transition-colors ${
                          product.is_visible ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="text-base font-bold text-gray-900 mb-1">{product.name}</div>
                            <div className="text-xs text-blue-600 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded mb-2">{product.category}</div>
                            <div className="text-sm font-medium text-gray-900">
                              ¥{product.price.toLocaleString()}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <button
                              onClick={() => handleToggleVisible(product)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                product.is_visible
                                  ? 'bg-black text-white hover:bg-gray-800'
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                            >
                              {product.is_visible ? '表示中' : '非表示'}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              削除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'options' ? (
            /* ── オプション管理タブ ── */
            <div className="animate-in fade-in duration-200">
              {/* オプション追加 */}
              <div className="mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <label className="block text-sm font-bold mb-3 text-gray-900">新しいオプションを追加</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    placeholder="オプション名 (例: 豆乳に変更)"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newOptionPrice}
                      onChange={(e) => setNewOptionPrice(e.target.value)}
                      placeholder="追加価格 (無料なら0または空)"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                    />
                    <button
                      onClick={handleAddOption}
                      className="px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center font-bold"
                      disabled={!newOptionName.trim()}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* オプション一覧 */}
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-900">オプション一覧</label>
                <div className="space-y-3">
                  {options.length === 0 && (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                      オプションが登録されていません
                    </div>
                  )}
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm"
                    >
                      <div>
                        <div className="text-base font-bold text-gray-900">{option.name}</div>
                        <div className="text-sm font-medium text-gray-600 mt-0.5">
                          {option.price > 0 ? `+¥${option.price}` : '無料'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteOption(option.id)}
                        className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
