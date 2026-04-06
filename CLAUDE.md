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
    api/fred/route.ts           -- FRED API route: cache -> live API -> snapshot -> mock. Supports ?bust=true to skip cache.
    api/h1b/route.ts            -- Serves processed H-1B JSON (sponsors/salaries/approvals/employers/lookup)
  components/
    tab-nav.tsx                 -- Pill tabs: "Labor Market" (first) | "H-1B Tracker"
    geography-toggle.tsx        -- US | California | Bay Area toggle
    -- Labor Market --
    dashboard.tsx               -- Labor market tab with geography prop, "Fetch Latest" button, "Data as of" label
    kpi-card.tsx                -- Stat card with Lucide icon + delta
    hero-chart.tsx              -- Job Openings vs Unemployment (dual y-axis)
    flow-chart.tsx              -- Hires/Quits/Layoffs area chart
    event-pill.tsx              -- Event annotation badge
    -- H-1B Tracker --
    h1b-dashboard.tsx           -- H-1B tab orchestrator with geography toggle, data freshness label
    top-sponsors-table.tsx      -- Sortable ranked table (company, filings, PM filings, salary, petition approval)
    salary-chart.tsx            -- CSS bar chart: PM salaries by company, sort toggle (By Filings / By Salary)
    approval-trend-chart.tsx    -- Stacked bars (approved/denied) + approval rate line
    company-lookup.tsx          -- Debounced search with detailed company results
    -- Shared --
    section-title.tsx           -- Section header with subtitle
    chart-card.tsx              -- Glass card wrapper
    sources-footer.tsx          -- Data sources (FRED + DOL + USCIS)
    custom-tooltip.tsx          -- Dark Recharts tooltip
    chart-skeleton.tsx          -- Loading skeleton
  lib/
    fred.ts                     -- FRED API client with AbortController timeout, User-Agent header, fillGaps() interpolation, limit=100000
    cache.ts                    -- File-based cache (24h TTL) in /tmp
    constants.ts                -- Series IDs (JTSLDL for layoffs, not JTSLLL), colors, events, GEOGRAPHY_SERIES, BAY_AREA_CITIES, PM_TITLE_KEYWORDS
    mock-data.ts                -- Fallback data for all series including CA/Bay Area
    h1b-data.ts                 -- Typed loader with geography filtering + company lookup
  data/
    fred-snapshot.json          -- Committed snapshot of all FRED series (primary source on Vercel)
    h1b/
      lca-processed.json        -- Processed DOL LCA data (real data, 54KB)
      uscis-processed.json      -- Processed USCIS data (real data, 18KB)
      process-lca.ts            -- Script: raw LCA XLSX -> filtered JSON (Python openpyxl subprocess)
      process-uscis.ts          -- Script: raw USCIS CSV -> filtered JSON (auto-detects UTF-8 vs UTF-16LE Tableau)
      raw/                      -- Raw data files (gitignored)
  public/
    favicon.ico                 -- Green P pulse logo (square cropped)
    og-image.png                -- 1200x630 social preview image
```

## Design System
- Background: #0a0f1e, Surface: #111827, Border: #1e293b
- Text: #e2e8f0, Muted: #94a3b8
- Accent: #00c896 (emerald green)
- Secondary: #3b82f6 (blue), #f97316 (orange), #ef4444 (red), #a855f7 (purple)
- Font: Inter (body), JetBrains Mono (numbers)
- Icons: Lucide React
- Cards: 12px border-radius, 1px border
- Charts: Recharts with custom dark tooltip. Y-axis width: 50-60px, margins left: 10-20, right: 20-30.

## FRED Data Architecture
- FRED API key works from localhost but is rejected from Vercel IPs (returns 400 "api_key not registered")
- Primary data source on production: src/data/fred-snapshot.json (committed, ~50KB, fetched locally)
- Fallback chain in route.ts: file cache -> live FRED API -> snapshot -> mock data
- "Fetch Latest" button in Labor Market tab calls API with ?bust=true to skip cache
- fillGaps() in fred.ts interpolates missing months (e.g., Oct 2025 UNRATE was "." in FRED)
- "Data as of [month year]" label shows data freshness
- To refresh: run FRED fetch locally, update snapshot, commit and push
- Geography series:
  - US: JTSJOL (openings), UNRATE (unemployment), JTSHIL (hires), JTSQUL (quits), JTSLDL (layoffs)
  - California: CAUR (unemployment), CANA (payrolls), CAICLAIMS (claims)
  - Bay Area: SANF806URN (SF metro unemployment)
- JOLTS is national only. CA/Bay Area show unemployment charts only with data lag note.
- Correct layoffs series: JTSLDL (not JTSLLL)

## H-1B Data Pipeline
- Raw data in src/data/h1b/raw/ (gitignored, ~100MB+ xlsx files)
- Processing scripts: process-lca.ts (Python openpyxl subprocess) and process-uscis.ts (auto-detects CSV format)
- Output: lca-processed.json (54KB) and uscis-processed.json (18KB), committed
- Data coverage: DOL LCA FY2023-FY2024 (Oct 2022 - Sep 2024), USCIS FY2022-FY2026 Q1
- 324K certified LCA rows, 275K USCIS rows processed
- PM roles filtered by job title: Product Manager, Product Analyst, Program Manager, Technical Program Manager, Product Owner
- Employer name normalization: strip trailing commas/periods, strip LLC/INC/CORP/Corporation/Ltd/LLP/LP, uppercase key for dedup
- Wage sanity checks: $500/hr cap, $800K annual cap
- Salary chart: CSS bars (replaced Recharts BarChart due to rendering bugs), sort toggle (By Filings default, By Salary), min 5/2 filings respectively
- "Petition Approval" column (renamed from "Approval Rate") with footnote about lottery vs petition distinction

## Code Rules
- No em dashes anywhere in copy
- No placeholder content in production
- Test mobile viewport before shipping
- Handle errors gracefully, never show raw errors to users
- Keep components small and focused on one job
- Delete unused code, no commented-out blocks
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
- Add homepage project card on harshit.ai linking to pulse.harshit.ai (task spec already in harshit.ai CLAUDE.md)
- Monthly: refresh FRED snapshot locally, commit and push
- Quarterly: download new DOL/USCIS CSVs, re-run processing scripts, commit
- Post-MVP: date range picker, export chart as PNG, weekly jobless claims chart, Layoffs.fyi overlay, narrative editorial blocks

## Completed Work
- 2026-04-05: Phase 1 -- Next.js scaffold, FRED API integration, 5 KPI cards, 2 charts, dark theme, mock data fallback
- 2026-04-05: Phase 2 -- Tab navigation, geography toggle (US/CA/Bay Area), H-1B data pipeline, H-1B dashboard UI (sponsors table, salary chart, approval trends, company lookup), mobile responsive
- 2026-04-05: H-1B data processing -- 324K LCA + 275K USCIS rows, wage sanity checks, dual-format USCIS handler
- 2026-04-05: Deployed to Vercel, pulse.harshit.ai live, FRED_API_KEY in env vars
- 2026-04-05: Bug fixes -- PM salary geography filter, filings denied counts, Bay Area sponsor fallback, CA/Bay Area race condition, require() fix for SimpleLineChart, CA dual-axis chart replaced with UnemploymentLineChart
- 2026-04-05: Favicon + OG image + full Open Graph / Twitter metadata
- 2026-04-05: Salary chart rewrite -- CSS bars replacing Recharts BarChart, sort toggle (By Filings / By Salary), employer name cleanup, data period label
- 2026-04-05: "Petition Approval" rename with lottery footnote
- 2026-04-05: FRED snapshot solution -- three-tier fallback for Vercel IP rejection, JTSLDL series fix
- 2026-04-05: Data freshness -- "Fetch Latest" button, "Data as of" label, data lag notes for CA/Bay Area
- 2026-04-05: Gap interpolation -- fillGaps() for missing FRED data points (Oct 2025 UNRATE)
- 2026-04-05: Default tab changed to Labor Market (first), H-1B Tracker second
