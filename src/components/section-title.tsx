interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-[#e2e8f0]">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-sm text-[#94a3b8]">{subtitle}</p>
      )}
    </div>
  );
}
