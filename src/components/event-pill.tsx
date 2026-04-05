import type { EventAnnotation } from "@/lib/constants";

interface EventPillProps {
  event: EventAnnotation;
}

export function EventPill({ event }: EventPillProps) {
  const dateLabel = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#1e293b] bg-[#111827] px-3 py-1.5 text-xs text-[#e2e8f0]">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: event.color }}
      />
      <span className="font-mono text-[#94a3b8]">{dateLabel}</span>
      {event.label}
    </span>
  );
}
