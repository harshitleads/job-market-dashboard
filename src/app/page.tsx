"use client";

import { useState } from "react";
import { TabNav } from "@/components/tab-nav";
import { Dashboard } from "@/components/dashboard";
import { H1bDashboard } from "@/components/h1b-dashboard";
import type { Geography } from "@/components/geography-toggle";

export default function Home() {
  const [activeTab, setActiveTab] = useState("h1b");

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#e2e8f0] sm:text-4xl">
          Job Market Pulse
        </h1>
        <p className="mt-2 text-[#94a3b8]">
          US labor market trends and H-1B visa sponsorship data for job seekers
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      {activeTab === "h1b" ? <H1bDashboard /> : <Dashboard />}
    </main>
  );
}
