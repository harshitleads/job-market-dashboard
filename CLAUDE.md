# CLAUDE.md

## Vision and Mission
A data dashboard for job seekers -- especially international students -- that combines US labor market trends with H-1B visa sponsorship data. Two tabs: Labor Market (default, US/California/Bay Area macro indicators) and H-1B Tracker (top sponsors, PM-role salaries, approval trends, company lookup). Built with FRED API + DOL/USCIS public disclosure data. The dashboard itself serves as the case study -- no separate page on harshit.ai.

## Current Stack
- Framework: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- Charts: Recharts (line/area/stacked bar) + CSS bars (salary chart)
- Icons: Lucide React
- Data sources:
  - FRED API -- labor market macro indicators. Three-tier fallback: file cache -> live API -> committed snapshot -> mock data. FRED API key rejected from Vercel IPs, so snapshot (src/data/fred-snapshot.json) is primary source on production.
  - DOL OFLC LCA Disclosure Data (FY2023-FY2024, quarterly CSV processed to JSON) -- H-1B filings, job titles, salaries, worksites
  - USCIS H-1B Employer Data Hub (FY2022-FY2026 Q1, quarterly CSV processed to JSON) -- approval/denial counts by employer
- Deployment: Vercel (free tier)
- Repo: harshitleads/job-market-dashboard
- Domain: pulse.harshit.ai

## Architecture
```
src/
  app/
    page.tsx                    -- Client component with tab navigation (Labor Market default)
    layout.tsx                  -- Root layout, dark theme, Inter + JetBrains Mono, OG metadata
    api/fred/route.ts           -- FRED API route: cache -> live API -> snapshot -> mock
    api/h1b/route.ts            -- Serves processed H-1B JSON
  components/                   -- See full component list in project docs
  lib/                          -- FRED client, cache, constants, mock data, h1b data
  data/                         -- fred-snapshot.json + h1b/ processed JSONs
```

## Design System
- Background: #0a0f1e, Surface: #111827, Border: #1e293b
- Text: #e2e8f0, Muted: #94a3b8
- Accent: #00c896 (emerald green)
- Font: Inter (body), JetBrains Mono (numbers)

## Code Rules
- No em dashes anywhere in copy
- NEVER run git commit, git push, git reset, git checkout, or any git write commands
- NEVER delete files unless the task spec explicitly says to delete a specific named file

## Decision Logging
When you make or execute a product or technical decision, append it to `docs/decisions.md` in this format:
```
### YYYY-MM-DD -- Short title
**Decision:** What was decided.
**Why:** The reasoning.
**Rejected:** What alternatives were considered and why they lost.
```

## Pending Work
- Monthly: refresh FRED snapshot locally, commit and push
- Quarterly: download new DOL/USCIS CSVs, re-run processing scripts, commit

## Completed Work
- 2026-04-05: Full build and deploy (FRED + H-1B + two tabs + geography filters + company lookup)
- 2026-04-05: Salary chart CSS rewrite, FRED snapshot fallback, favicon + OG, data freshness labels

---

## ACTIVE TASK: Add Floating Case Study Bubble

### Context
Every sub-site needs a floating popup linking back to its case study on harshit.ai. Job Market Pulse is a dashboard that users browse passively, so the reappear delay is 15 seconds (longer than dev tools at 7s, shorter than consumer apps at 30s).

### What to Build
Create `src/components/case-study-bubble.tsx` and render it in `src/app/page.tsx`.

### Component Spec: case-study-bubble.tsx

```tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function CaseStudyBubble() {
  const [visible, setVisible] = useState(false);
  const reappearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleShow = useCallback((delay: number) => {
    if (reappearTimer.current) clearTimeout(reappearTimer.current);
    reappearTimer.current = setTimeout(() => setVisible(true), delay);
  }, []);

  useEffect(() => {
    scheduleShow(3000);
    return () => {
      if (reappearTimer.current) clearTimeout(reappearTimer.current);
    };
  }, [scheduleShow]);

  function hide() {
    setVisible(false);
    scheduleShow(15000);
  }

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    hide();
  }

  if (!visible) return null;

  return (
    <a
      href="https://harshit.ai/work/job-market-pulse"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-[10px] rounded-2xl border px-4 py-3 no-underline transition-all hover:brightness-110"
      style={{
        background: "rgba(10,15,30,0.95)",
        borderColor: "rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        animation: "bubbleIn 0.4s ease-out",
      }}
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ background: "rgba(0,200,150,0.1)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>
      <div>
        <p className="text-[13px] font-medium" style={{ color: "#e2e8f0", margin: 0 }}>
          See the product thinking behind this
        </p>
        <p className="text-[11px]" style={{ color: "#94a3b8", margin: 0 }}>
          How I built Job Market Pulse
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="ml-1 bg-transparent border-none cursor-pointer text-[16px] leading-none p-0"
        style={{ color: "#64748b" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#e2e8f0")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
        aria-label="Dismiss"
      >
        &#215;
      </button>
    </a>
  );
}
```

### Add to globals.css (only if not already present)
```css
@keyframes bubbleIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 639px) {
  .fixed.bottom-6.right-6 {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
}
```

### Wire into page
In `src/app/page.tsx`:
1. Add import: `import CaseStudyBubble from "@/components/case-study-bubble";`
2. Add `<CaseStudyBubble />` as the last child inside `<main>`.

### Acceptance Criteria
- [ ] Bubble appears after 3 seconds
- [ ] Links to https://harshit.ai/work/job-market-pulse in new tab
- [ ] Dismiss reappears after 15 seconds (dashboard browsing pace)
- [ ] Matches dark theme (#0a0f1e background, #00c896 accent)
- [ ] Works on mobile
- [ ] No em dashes

### Files to Touch
- CREATE: `src/components/case-study-bubble.tsx`
- EDIT: `src/app/page.tsx` (import + render)
- EDIT: `src/app/globals.css` (keyframe + mobile, only if not present)
