import { useState } from 'react';
import { Product, ProductOption } from '../types';
import { X, Check } from 'lucide-react';

interface OptionModalProps {
  product: Product;
  availableOptions: ProductOption[];
  onConfirm: (selectedOptions: ProductOption[]) => void;
  onClose: () => void;
}

export function OptionModal({ product, availableOptions, onConfirm, onClose }: OptionModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleOption = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectedOptions = availableOptions.filter(o => selectedIds.has(o.id));
  const optionsTotal = selectedOptions.reduce((sum, o) => sum + o.price, 0);
  const total = product.price + optionsTotal;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* ヘッダー */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
          <div>
            <h2 className="text-xl font-bold">{product.name}</h2>
            <p className="text-sm opacity-90">{product.category}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* オプションリスト */}
        <div className="p-4">
          <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-wider uppercase">
            オプションを選択してください
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableOptions.map((option) => {
              const isSelected = selectedIds.has(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm font-medium truncate ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                      {option.name}
                    </span>
                  </div>
                  {option.price > 0 && (
                    <span className={`text-xs font-bold whitespace-nowrap ml-1 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                      +¥{option.price}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 合計 & 決定ボタン */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex justify-between items-baseline px-2">
            <span className="text-gray-500">合計</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-blue-600">¥</span>
              <span className="text-3xl font-bold text-gray-900">{total.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={() => onConfirm(selectedOptions)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-lg font-bold shadow-lg shadow-blue-200 transition-all"
          >
            カートに追加
          </button>
        </div>
      </div>
    </div>
  );
}
