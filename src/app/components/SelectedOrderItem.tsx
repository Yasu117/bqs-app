import { DraftOrderItem } from '../types';
import { X } from 'lucide-react';

interface SelectedOrderItemProps {
  item: DraftOrderItem;
  onRemove: () => void;
}

export function SelectedOrderItem({ item, onRemove }: SelectedOrderItemProps) {
  const optionsTotal = item.selected_options.reduce((sum, o) => sum + o.price, 0);
  const unitPrice = item.price + optionsTotal;

  return (
    <div className="flex flex-col py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1">
          <div className="text-base font-bold text-gray-800">{item.product_name}</div>
          {item.selected_options.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.selected_options.map((opt, idx) => (
                <span key={idx} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                  {opt.name}
                  {opt.price > 0 && ` (+¥${opt.price})`}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right ml-4">
          <div className="text-sm font-bold text-gray-900">¥{(unitPrice * item.quantity).toLocaleString()}</div>
          <button
            onClick={onRemove}
            className="text-xs text-red-500 hover:text-red-700 mt-1"
          >
            削除
          </button>
        </div>
      </div>
      <div className="text-[11px] text-gray-400">
        単価: ¥{unitPrice.toLocaleString()} × {item.quantity}
      </div>
    </div>
  );
}
