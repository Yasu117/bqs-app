interface QueueSummaryProps {
  venueName: string;
  pendingCount: number;
  inProgressCount: number;
}

export function QueueSummary({ venueName, pendingCount, inProgressCount }: QueueSummaryProps) {
  const totalCount = pendingCount + inProgressCount;
  
  return (
    <div className="bg-white border-b border-gray-300 p-4">
      <div className="text-lg mb-2">{venueName}</div>
      <div className="flex gap-4">
        <div>
          <span className="text-2xl">{totalCount}</span>
          <span className="text-gray-600 ml-1.5">件待ち</span>
        </div>
        <div className="text-sm text-gray-600 flex items-center">
          受付 {pendingCount}件 / 作成中 {inProgressCount}件
        </div>
      </div>
    </div>
  );
}
