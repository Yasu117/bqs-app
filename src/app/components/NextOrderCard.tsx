import { Order } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface NextOrderCardProps {
  order: Order;
  onStatusChange: (status: Order['status']) => void;
  onCancelClick: () => void;
}

export function NextOrderCard({ order, onStatusChange, onCancelClick }: NextOrderCardProps) {
  const elapsed = formatDistanceToNow(new Date(order.ordered_at), {
    locale: ja,
    addSuffix: false,
  });

  const nextStatus = '完了';
  const buttonText = '提供完了';

  return (
    <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-blue-700 mb-1">次の注文</div>
          <div className="text-3xl mb-1">No.{order.order_number}</div>
          <div className="text-sm text-gray-600">{elapsed}前</div>
        </div>
        <button
          onClick={onCancelClick}
          className="text-sm text-gray-400 hover:text-red-600 underline px-2 py-1"
        >
          削除
        </button>
      </div>

      <div className="mb-4 space-y-3">
        {(order.items ?? []).map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex justify-between text-base">
              <span className="flex-1 font-bold">{item.product_name}</span>
              <span className="ml-4 font-bold">×{item.quantity}</span>
            </div>
            {item.options && item.options.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.options.map((opt, oIdx) => (
                  <span key={oIdx} className="text-[11px] bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                    {opt.option_name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {order.memo && (
        <div className="mb-4 p-3 bg-white rounded border border-blue-200">
          <div className="text-sm text-gray-600 mb-1">メモ</div>
          <div className="text-base">{order.memo}</div>
        </div>
      )}

      <button
        onClick={() => onStatusChange(nextStatus)}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg"
      >
        {buttonText}
      </button>
    </div>
  );
}