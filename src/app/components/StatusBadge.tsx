import { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case '受付済':
        return 'bg-blue-100 text-blue-800';
      case '作成中':
        return 'bg-orange-100 text-orange-800';
      case '完了':
        return 'bg-gray-100 text-gray-600';
      case 'キャンセル':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <span className={`inline-block px-2.5 py-1 text-sm rounded ${getStatusColor()}`}>
      {status}
    </span>
  );
}
