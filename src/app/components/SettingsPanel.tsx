import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import {
  fetchVenues,
  createVenue,
  updateVenueName,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProductOptions,
  createProductOption,
  deleteProductOption,
} from '../../lib/api';
import { Venue, Product, ProductOption } from '../types';
import { toast } from 'sonner';

interface SettingsPanelProps {
  venueId: string;
  onClose: () => void;
}

export function SettingsPanel({ venueId, onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'venues' | 'products' | 'options'>('venues');

  // ─── 会場管理 ───
  const [venues, setVenues] = useState<Venue[]>([]);
  const [newVenueName, setNewVenueName] = useState('');
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [editingVenueName, setEditingVenueName] = useState('');

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
  const loadVenues = useCallback(async () => {
    try {
      setVenues(await fetchVenues());
    } catch {
      toast.error('会場の読み込みに失敗しました');
    }
  }, []);

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
    loadVenues();
    loadProducts();
    loadOptions();
  }, [loadVenues, loadProducts, loadOptions]);

  // ─── 会場操作 ───
  const handleAddVenue = async () => {
    if (!newVenueName.trim()) return;
    try {
      await createVenue(newVenueName.trim());
      setNewVenueName('');
      await loadVenues();
      toast.success('会場を追加しました');
    } catch {
      toast.error('会場の追加に失敗しました');
    }
  };

  const handleUpdateVenue = async () => {
    if (!editingVenueId || !editingVenueName.trim()) return;
    try {
      await updateVenueName(editingVenueId, editingVenueName.trim());
      setEditingVenueId(null);
      setEditingVenueName('');
      await loadVenues();
      toast.success('会場名を更新しました');
    } catch {
      toast.error('会場名の更新に失敗しました');
    }
  };

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
    if (!confirm('この商品を削除しますか？')) return;
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
    if (!confirm('このオプションを削除しますか？')) return;
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
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-300 p-4 flex items-center justify-between">
          <h2 className="text-xl">設定</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-300">
          {(['venues', 'products', 'options'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600 font-bold'
                  : 'text-gray-600'
              }`}
            >
              {tab === 'venues' ? '会場' : tab === 'products' ? '商品' : 'オプション'}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* ── 会場管理タブ ── */}
          {activeTab === 'venues' ? (
            <div>
              {/* 会場追加 */}
              <div className="mb-6">
                <label className="block text-sm mb-2">新しい会場を追加</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newVenueName}
                    onChange={(e) => setNewVenueName(e.target.value)}
                    placeholder="会場名"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddVenue()}
                  />
                  <button
                    onClick={handleAddVenue}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 会場一覧 */}
              <div>
                <label className="block text-sm mb-2">会場一覧</label>
                <div className="space-y-2">
                  {venues.map((venue) => (
                    <div
                      key={venue.id}
                      className="bg-gray-50 border border-gray-300 rounded p-3"
                    >
                      {editingVenueId === venue.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingVenueName}
                            onChange={(e) => setEditingVenueName(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateVenue()}
                          />
                          <button
                            onClick={handleUpdateVenue}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => {
                              setEditingVenueId(null);
                              setEditingVenueName('');
                            }}
                            className="px-3 py-1 bg-gray-200 rounded text-sm"
                          >
                            キャンセル
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-base">{venue.name}</span>
                          <button
                            onClick={() => {
                              setEditingVenueId(venue.id);
                              setEditingVenueName(venue.name);
                            }}
                            className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
                          >
                            編集
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'products' ? (
            /* ── メニュー管理タブ ── */
            <div>
              {/* 商品追加 */}
              <div className="mb-6">
                <label className="block text-sm mb-2">新しい商品を追加</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="商品名"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    placeholder="カテゴリー（例：コーヒー）"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="価格"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                    />
                    <button
                      onClick={handleAddProduct}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 商品一覧 */}
              <div>
                <label className="block text-sm mb-2">商品一覧</label>
                <div className="space-y-2">
                  {products
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="bg-gray-50 border border-gray-300 rounded p-3"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <div className="text-base mb-1">{product.name}</div>
                            <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                            <div className="text-sm text-gray-600">
                              ¥{product.price.toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleVisible(product)}
                              className={`px-3 py-1 rounded text-sm ${
                                product.is_visible
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {product.is_visible ? '表示中' : '非表示'}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-1 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
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
            <div>
              {/* オプション追加 */}
              <div className="mb-6">
                <label className="block text-sm mb-2">新しいオプションを追加</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    placeholder="オプション名（例：豆乳に変更）"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newOptionPrice}
                      onChange={(e) => setNewOptionPrice(e.target.value)}
                      placeholder="追加価格（¥0の場合は空でOK）"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                    />
                    <button
                      onClick={handleAddOption}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* オプション一覧 */}
              <div>
                <label className="block text-sm mb-2">オプション一覧</label>
                <div className="space-y-2">
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className="bg-gray-50 border border-gray-300 rounded p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-base">{option.name}</div>
                        <div className="text-sm text-gray-600">
                          {option.price > 0 ? `+¥${option.price}` : '無料'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteOption(option.id)}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
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
