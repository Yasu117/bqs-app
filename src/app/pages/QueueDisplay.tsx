import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { QueueSummary } from '../components/QueueSummary';
import { NextOrderCard } from '../components/NextOrderCard';
import { QueueItemCard } from '../components/QueueItemCard';
import { SettingsPanel } from '../components/SettingsPanel';
import { updateOrderStatus as apiUpdateOrderStatus } from '../../lib/api';
import { Order } from '../types';
import { supabase } from '../../lib/supabase';

export function QueueDisplay() {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    if (!venueId) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*, options:order_item_options(*))')
        .eq('venue_id', venueId)
        .order('ordered_at', { ascending: true });
      
      if (error) throw error;

      // 今日の注文のみ表示
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayOrders = (data as Order[]).filter(
        (o) => new Date(o.ordered_at) >= todayStart,
      );
      setOrders(todayOrders);
    } catch (err) {
      console.error('注文取得エラー:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  if (!venueId) {
    navigate('/');
    return null;
  }

  // ステータスごとに分類
  const pendingOrders = orders.filter((o) => o.status === '受付済');
  const inProgressOrders = orders.filter((o) => o.status === '作成中');
  const completedOrders = orders
    .filter((o) => o.status === '完了')
    .sort(
      (a, b) =>
        new Date(b.completed_at ?? b.ordered_at).getTime() -
        new Date(a.completed_at ?? a.ordered_at).getTime(),
    )
    .slice(0, 5); // 直近5件だけ表示

  // 次に作る注文（受付済の先頭 → なければ作成中の先頭）
  const nextOrder = pendingOrders[0] ?? inProgressOrders[0];

  // キュー一覧（次の注文以外の未完了）
  const queueOrders = [
    ...pendingOrders.slice(1),
    ...inProgressOrders.filter((o) => o.id !== nextOrder?.id),
  ];

  // 10分超待機判定
  const isOverdue = (order: Order) => {
    const elapsed = Date.now() - new Date(order.ordered_at).getTime();
    return elapsed > 10 * 60 * 1000;
  };

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    // 楽観的更新
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              completed_at: status === '完了' ? new Date().toISOString() : o.completed_at,
            }
          : o,
      ),
    );
    try {
      await apiUpdateOrderStatus(orderId, status);
    } catch (err) {
      console.error('ステータス更新エラー:', err);
      loadOrders(); // 失敗したら再取得
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* サマリー */}
      <QueueSummary
        venueName={''}
        pendingCount={pendingOrders.length}
        inProgressCount={inProgressOrders.length}
      />

      {/* コンテンツ */}
      <div className="max-w-4xl mx-auto p-4 pb-24">
        {nextOrder ? (
          <>
            {/* 次の注文 */}
            <NextOrderCard
              order={nextOrder}
              onStatusChange={(status) => handleStatusChange(nextOrder.id, status)}
              onCancelClick={() => setOrderToDelete(nextOrder)}
            />

            {/* 待ち注文 */}
            {queueOrders.length > 0 && (
              <div>
                <h2 className="text-lg mb-3">待ち注文</h2>
                <div className="grid gap-3">
                  {queueOrders.map((order) => (
                    <QueueItemCard
                      key={order.id}
                      order={order}
                      onStatusChange={(status) => handleStatusChange(order.id, status)}
                      onCancelClick={() => setOrderToDelete(order)}
                      isOverdue={isOverdue(order)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 完了済み */}
            {completedOrders.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg mb-3 text-gray-600">完了済み</h2>
                <div className="grid gap-3">
                  {completedOrders.map((order) => (
                    <QueueItemCard
                      key={order.id}
                      order={order}
                      onStatusChange={(status) => handleStatusChange(order.id, status)}
                      onCancelClick={() => setOrderToDelete(order)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">☕️</div>
            <div className="text-xl text-gray-600 mb-2">すべての注文が完了しました</div>
            <div className="text-sm text-gray-500">新しい注文をお待ちしています</div>
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
                  handleStatusChange(orderToDelete.id, 'キャンセル');
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
