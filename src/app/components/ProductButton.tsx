import { Product } from '../types';

interface ProductButtonProps {
  product: Product;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function ProductButton({
  product,
  quantity,
  onIncrement,
  onDecrement,
}: ProductButtonProps) {
  return (
    <div className="bg-white border border-gray-300 rounded p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="text-base mb-1">{product.name}</div>
          <div className="text-sm text-gray-600">¥{product.price.toLocaleString()}</div>
        </div>
        {quantity > 0 && (
          <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
            {quantity}
          </div>
        )}
      </div>
      
      {quantity === 0 ? (
        <button
          onClick={onIncrement}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 rounded text-base"
        >
          追加
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onDecrement}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded text-base"
          >
            −
          </button>
          <button
            onClick={onIncrement}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-base"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
