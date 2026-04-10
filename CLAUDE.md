# CLAUDE.md

## Vision and Mission
A data dashboard for job seekers combining US labor market trends with H-1B visa sponsorship data.

## Current Stack
- Framework: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- Deployment: Vercel (free tier) at pulse.harshit.ai

## Code Rules
- No em dashes anywhere in copy
- NEVER run git commit, git push, git reset, git checkout, or any git write commands
- NEVER delete files unless the task spec explicitly says to delete a specific named file

---

## ACTIVE TASK: Simplify Case Study Bubble — persistent, all pages

### What to Do

**1. Replace `src/components/case-study-bubble.tsx`** with this simplified version:

```tsx
"use client";

export default function CaseStudyBubble() {
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
    </a>
  );
}
```

**2. In `src/app/globals.css`**, REMOVE the mobile full-width override if present. Keep `bubbleIn` keyframe.

### Files to Touch (ONLY these)
- EDIT: `src/components/case-study-bubble.tsx`
- EDIT: `src/app/globals.css` (remove mobile override only)
