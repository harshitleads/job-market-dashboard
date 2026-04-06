"use client";

interface TabNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "labor", label: "Labor Market" },
  { id: "h1b", label: "H-1B Tracker" },
];

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="flex gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "bg-[#00c896] text-[#0a0f1e]"
              : "border border-[#1e293b] bg-[#111827] text-[#94a3b8] hover:text-[#e2e8f0]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
