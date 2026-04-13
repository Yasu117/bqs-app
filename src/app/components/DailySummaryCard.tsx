interface DailySummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export function DailySummaryCard({ title, value, subtitle }: DailySummaryCardProps) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-5">
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      <div className="text-3xl mb-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
    </div>
  );
}
