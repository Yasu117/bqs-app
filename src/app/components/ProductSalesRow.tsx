interface ProductSalesRowProps {
  productName: string;
  quantity: number;
  revenue: number;
}

export function ProductSalesRow({ productName, quantity, revenue }: ProductSalesRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
      <div className="flex-1 text-base">{productName}</div>
      <div className="text-base text-gray-600 mr-6">{quantity}杯</div>
      <div className="text-base">¥{revenue.toLocaleString()}</div>
    </div>
  );
}
