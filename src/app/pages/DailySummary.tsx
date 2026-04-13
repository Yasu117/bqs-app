import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { DailySummaryCard } from '../components/DailySummaryCard';
import { ProductSalesRow } from '../components/ProductSalesRow';
import { SettingsPanel } from '../components/SettingsPanel';
import { fetchTodayOrders, updateOrderStatus } from '../../lib/api';
import { Order } from '../types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export function DailySummary() {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    if (!venueId) return;
    try {
      const data = await fetchTodayOrders(venueId);
      setOrders(data);
    } catch (err) {
      console.error('注文取得エラー:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'キャンセル');
      await loadOrders();
    } catch (err) {
      console.error('キャンセルエラー:', err);
      alert('キャンセルに失敗しました');
    }
  };

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (!venueId) {
    navigate('/venues');
    return null;
  }

  // キャンセル除外
  const validOrders = orders.filter((o) => o.status !== 'キャンセル');

  // 集計
  const summary = useMemo(() => {
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total_amount, 0);

    const totalCups = validOrders.reduce((sum, o) => {
      return sum + (o.items ?? []).reduce((s, i) => s + i.quantity, 0);
    }, 0);

    // 商品別 & オプション別集計
    const productStats = new Map<string, { quantity: number; revenue: number }>();
    const optionStats = new Map<string, { quantity: number; revenue: number }>();

    validOrders.forEach((order) => {
      (order.items ?? []).forEach((item) => {
        // 商品の基本売上 + オプション合計
        const optionsTotal = (item.options ?? []).reduce((sum, opt) => sum + opt.price, 0);
        const itemTotalRevenue = (item.price + optionsTotal) * item.quantity;

        const existingP = productStats.get(item.product_name) ?? { quantity: 0, revenue: 0 };
        productStats.set(item.product_name, {
          quantity: existingP.quantity + item.quantity,
          revenue: existingP.revenue + itemTotalRevenue,
        });

        // オプションごとの個数をカウント
        (item.options ?? []).forEach((opt) => {
          const existingO = optionStats.get(opt.option_name) ?? { quantity: 0, revenue: 0 };
          optionStats.set(opt.option_name, {
            quantity: existingO.quantity + item.quantity,
            revenue: existingO.revenue + opt.price * item.quantity,
          });
        });
      });
    });

    const productSales = Array.from(productStats.entries())
      .map(([name, data]) => ({ productName: name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    const optionSales = Array.from(optionStats.entries())
      .map(([name, data]) => ({ optionName: name, ...data }))
      .sort((a, b) => b.quantity - a.quantity);

    return {
      totalRevenue,
      totalOrders: validOrders.length,
      totalCups,
      productSales,
      optionSales,
      completedOrders: validOrders.filter((o) => o.status === '完了').length,
    };
  }, [validOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto p-4">
        {/* 日付 */}
        <div className="mb-6">
          <h1 className="text-2xl">{format(new Date(), 'M月d日(E)', { locale: ja })}の集計</h1>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <DailySummaryCard title="売上" value={`¥${summary.totalRevenue.toLocaleString()}`} />
          <DailySummaryCard
            title="注文数"
            value={`${summary.totalOrders}件`}
            subtitle={`完了 ${summary.completedOrders}件`}
          />
          <DailySummaryCard title="総杯数" value={`${summary.totalCups}杯`} />
          <DailySummaryCard
            title="客単価"
            value={
              summary.totalOrders > 0
                ? `¥${Math.round(summary.totalRevenue / summary.totalOrders).toLocaleString()}`
                : '¥0'
            }
          />
        </div>

        {/* 商品別売上 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {summary.productSales.length > 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold">商品別売上</h2>
              </div>
              <div className="p-4">
                {summary.productSales.map((product, index) => (
                  <ProductSalesRow
                    key={index}
                    productName={product.productName}
                    quantity={product.quantity}
                    revenue={product.revenue}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-300 rounded-lg p-8 text-center text-gray-500">
              商品の注文はまだありません
            </div>
          )}

          {/* オプション別集計 */}
          {summary.optionSales.length > 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold">オプション別集計</h2>
              </div>
              <div className="p-4">
                {summary.optionSales.map((opt, index) => (
                  <ProductSalesRow
                    key={index}
                    productName={opt.optionName}
                    quantity={opt.quantity}
                    revenue={opt.revenue}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-300 rounded-lg p-8 text-center text-gray-500">
              オプションの注文はありません
            </div>
          )}
        </div>

        {/* 注文履歴 */}
        {validOrders.length > 0 && (
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg">注文履歴</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm">No.</th>
                    <th className="px-4 py-3 text-left text-sm">商品</th>
                    <th className="px-4 py-3 text-left text-sm">注文日時</th>
                    <th className="px-4 py-3 text-left text-sm">完了日時</th>
                    <th className="px-4 py-3 text-right text-sm">金額</th>
                    <th className="px-4 py-3 text-center text-sm">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {[...validOrders]
                    .sort(
                      (a, b) =>
                        new Date(b.ordered_at).getTime() - new Date(a.ordered_at).getTime(),
                    )
                    .map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-red-50/10 transition-colors last:border-0 relative group">
                        <td className="px-4 py-3 text-sm">{order.order_number}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="space-y-2">
                            {(order.items ?? []).map((item, idx) => (
                              <div key={idx}>
                                <div>{item.product_name} ×{item.quantity}</div>
                                {item.options && item.options.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {item.options.map((opt, oIdx) => (
                                      <span key={oIdx} className="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                                        {opt.option_name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {format(new Date(order.ordered_at), 'HH:mm')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {order.completed_at
                            ? format(new Date(order.completed_at), 'HH:mm')
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          ¥{order.total_amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setOrderToDelete(order)}
                            className="text-gray-400 hover:text-red-500 text-sm px-2 py-1 rounded whitespace-nowrap"
                            title="この注文を削除"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 設定パネル */}
      {showSettings && (
        <SettingsPanel venueId={venueId} onClose={() => setShowSettings(false)} />
      )}

      {/* 削除確認モーダル */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-4">注文の削除</h3>
            <p className="text-gray-600 mb-6 font-medium">
              No.{orderToDelete.order_number} を削除しますか？<br/>
              この操作は元に戻せません。
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold"
              >
                キャンセル
              </button>
              <button 
                onClick={() => {
                  handleCancelOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}