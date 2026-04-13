import { Order } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface QueueItemCardProps {
  order: Order;
  onStatusChange: (status: Order['status']) => void;
  onCancelClick: () => void;
  isOverdue?: boolean;
}

export function QueueItemCard({ order, onStatusChange, onCancelClick, isOverdue }: QueueItemCardProps) {
  const elapsed = formatDistanceToNow(new Date(order.ordered_at), {
    locale: ja,
    addSuffix: false,
  });

  const isCompleted = order.status === '完了';
  const nextStatus = '完了';
  const buttonText = '提供完了';

  return (
    <div 
      className={`bg-white border rounded-lg p-4 ${
        isCompleted ? 'opacity-50' : ''
      } ${isOverdue && !isCompleted ? 'border-orange-400' : 'border-gray-300'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xl mb-1">No.{order.order_number}</div>
          <div className="text-sm text-gray-600">{elapsed}前</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={order.status} />
          {!isCompleted && (
            <button
              onClick={onCancelClick}
              className="text-xs text-gray-400 hover:text-red-500 underline"
            >
              削除
            </button>
          )}
        </div>
      </div>

      <div className="mb-3 space-y-2">
        {(order.items ?? []).map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex justify-between text-base">
              <span className="flex-1 font-medium">{item.product_name}</span>
              <span className="ml-4 font-medium">×{item.quantity}</span>
            </div>
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

      {order.memo && (
        <div className="mb-3 p-2.5 bg-gray-50 rounded text-sm">
          <div className="text-gray-600 mb-0.5">メモ</div>
          <div>{order.memo}</div>
        </div>
      )}

      {!isCompleted && (
        <button
          onClick={() => onStatusChange(nextStatus)}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 rounded text-base"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}