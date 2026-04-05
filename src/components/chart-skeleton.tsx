export function ChartSkeleton() {
  return (
    <div className="flex h-[400px] items-center justify-center rounded-xl border border-[#1e293b] bg-[#111827]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1e293b] border-t-[#00c896]" />
        <p className="text-sm text-[#94a3b8]">Loading chart data...</p>
      </div>
    </div>
  );
}
