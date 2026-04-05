# CLAUDE.md

## Vision and Mission
A data dashboard for job seekers -- especially international students -- that combines US labor market trends with H-1B visa sponsorship data. Two main views: an H-1B Tracker (top sponsors, PM-role salaries, approval trends, company lookup) and a Labor Market overview (US/California/Bay Area macro indicators). Built with FRED API + DOL/USCIS public disclosure data. Portfolio piece demonstrating data visualization, analytics thinking, and dashboard design.

## Current Stack
- Framework: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- Charts: Recharts
- Icons: Lucide React
- Data sources:
  - FRED API (live, cached 24h) -- labor market macro indicators
  - DOL OFLC LCA Disclosure Data (quarterly CSV, processed to JSON) -- H-1B filings, job titles, salaries, worksites
  - USCIS H-1B Employer Data Hub (quarterly CSV, processed to JSON) -- approval/denial counts by employer
- Deployment: Vercel (free tier)
- Repo: harshitleads/job-market-dashboard
- Domain: pulse.harshit.ai
- Production URL: https://job-market-dashboard-eight.vercel.app

## Architecture
```
src/
  app/
    page.tsx                    -- Client component with tab navigation (H-1B default)
    layout.tsx                  -- Root layout, dark theme, Inter + JetBrains Mono
    api/fred/route.ts           -- FRED API route with 24h file cache
    api/h1b/route.ts            -- Serves processed H-1B JSON (sponsors/salaries/approvals/employers/lookup)
  components/
    tab-nav.tsx                 -- Pill tabs: "H-1B Tracker" | "Labor Market"
    geography-toggle.tsx        -- US | California | Bay Area toggle
    -- H-1B Tracker --
    h1b-dashboard.tsx           -- H-1B tab orchestrator with geography toggle
    top-sponsors-table.tsx      -- Sortable ranked table (company, filings, PM filings, salary, approval rate)
    salary-chart.tsx            -- Horizontal bar chart: PM salary ranges by company
    approval-trend-chart.tsx    -- Stacked bars (approved/denied) + approval rate line
    company-lookup.tsx          -- Debounced search with detailed company results
    -- Labor Market --
    dashboard.tsx               -- Labor market tab with geography prop
    kpi-card.tsx                -- Stat card with Lucide icon + delta
    hero-chart.tsx              -- Job Openings vs Unemployment (dual y-axis)
    flow-chart.tsx              -- Hires/Quits/Layoffs area chart
    event-pill.tsx              -- Event annotation badge
    section-title.tsx           -- Section header with subtitle
    chart-card.tsx              -- Glass card wrapper
    sources-footer.tsx          -- Data sources (FRED + DOL + USCIS)
    custom-tooltip.tsx          -- Dark Recharts tooltip
    chart-skeleton.tsx          -- Loading skeleton
  lib/
    fred.ts                     -- FRED API client + types
    cache.ts                    -- File-based cache (24h TTL) in /tmp
    constants.ts                -- Series IDs, colors, events, GEOGRAPHY_SERIES, BAY_AREA_CITIES, PM_TITLE_KEYWORDS
    mock-data.ts                -- Fallback data when no FRED key
    h1b-data.ts                 -- Typed loader for processed H-1B JSON with geography filtering + company lookup
  data/
    h1b/
      lca-processed.json        -- Processed DOL LCA data (real data, 54KB)
      uscis-processed.json      -- Processed USCIS data (real data, 18KB)
      process-lca.ts            -- Script to convert raw LCA XLSX -> filtered JSON
      process-uscis.ts          -- Script to convert raw USCIS CSV -> filtered JSON
      raw/                      -- Raw data files (gitignored)
```

## Design System
- Background: #0a0f1e (dark navy)
- Surface: #111827 (card bg)
- Border: #1e293b
- Text: #e2e8f0
- Muted: #94a3b8
- Accent: #00c896 (emerald green)
- Secondary: #3b82f6 (blue), #f97316 (orange), #ef4444 (red), #a855f7 (purple)
- Font: Inter (body), JetBrains Mono (numbers)
- Icons: Lucide React
- Cards: 12px border-radius, 1px border
- Charts: Recharts with custom dark tooltip

## FRED API Integration
- Base URL: https://api.stlouisfed.org/fred/series/observations
- Auth: FRED_API_KEY in .env.local (set in Vercel env vars for production)
- Cache: file-based in /tmp, 24h TTL
- Geography series mapping in constants.ts:
  - US: JTSJOL, UNRATE, JTSHIL, JTSQUL, JTSLLL, JTSTSL (full JOLTS + unemployment)
  - California: CAUR, CANA, CAICLAIMS (unemployment, payrolls, claims only)
  - Bay Area: SANF806URN (SF metro unemployment only)
- JOLTS is national only -- CA and Bay Area show fewer indicators with explanatory note

## H-1B Data Pipeline
- Raw data in src/data/h1b/raw/ (gitignored, ~100MB+ xlsx files)
- Processing scripts: process-lca.ts and process-uscis.ts (run with npx tsx)
- Output: lca-processed.json and uscis-processed.json (committed, small)
- Processed 324K certified LCA rows and 275K USCIS rows
- DOL LCA fields used: EMPLOYER_NAME, JOB_TITLE, SOC_CODE, WAGE_RATE_OF_PAY_FROM/TO, WORKSITE_CITY/STATE, CASE_STATUS
- PM roles filtered by: "Product Manager", "Product Analyst", "Program Manager", "Technical Program Manager", "Product Owner"
- Bay Area cities: San Francisco, San Jose, Mountain View, Palo Alto, Sunnyvale, Menlo Park, Cupertino, Redwood City, Santa Clara, Oakland, Berkeley, Fremont
- Employer name normalization: uppercase, strip LLC/INC/CORP/CO
- Wage sanity checks: $500/hr cap before hourly-to-annual, $800K annual cap for PM data

## Key Event Annotations
- Mar 2022: Peak job openings (~12M)
- Nov 2022: ChatGPT launch + tech layoff wave begins
- Jan 2023: Meta/Google/Amazon mass layoffs

## Code Rules
- No em dashes anywhere in copy
- No placeholder content in production
- Test mobile viewport before shipping
- Handle errors gracefully, never show raw errors to users
- Keep components small and focused on one job
- Delete unused code, no commented-out blocks
- Meaningful commit messages
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
- Configure pulse.harshit.ai subdomain (CNAME + Vercel domain)
- Add case study page on harshit.ai
- Post-MVP: date range picker, export chart as PNG, weekly jobless claims chart, Layoffs.fyi overlay

## Completed Work
- 2026-04-05: Phase 1 -- Next.js scaffold, FRED API integration, 5 KPI cards, 2 charts, dark theme, mock data fallback
- 2026-04-05: Phase 2 -- Tab navigation (H-1B Tracker default | Labor Market), geography toggle (US/CA/Bay Area), H-1B data pipeline (processing scripts + sample JSON), H-1B dashboard UI (sponsors table, salary chart, approval trends, company lookup), updated sources footer, mobile responsive
- 2026-04-05: H-1B data processing -- 324K LCA rows + 275K USCIS rows processed to JSON with wage sanity checks
- 2026-04-05: Deployed to Vercel (https://job-market-dashboard-eight.vercel.app), FRED_API_KEY set in env vars
