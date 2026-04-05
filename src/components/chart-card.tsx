interface ChartCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ children, className = "" }: ChartCardProps) {
  return (
    <div
      className={`glass-card rounded-xl border border-[#1e293b] bg-[#111827] p-6 ${className}`}
    >
      {children}
    </div>
  );
}
