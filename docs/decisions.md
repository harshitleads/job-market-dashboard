# Product Decisions

A running log of significant product and technical decisions made during development. Each entry records what was decided, why, and what alternatives were rejected.

Entries are append-only. Never edit old entries.

---

### 2026-04-05

### 2026-04-05 -- Project kickoff: Next.js + FRED API
**Decision:** Build Job Market Pulse as a standalone Next.js app with FRED API integration, file-based caching, and Recharts for visualization.
**Why:** Next.js matches the portfolio stack (harshit.ai), Vercel free tier keeps costs at $0, FRED API is free and authoritative government data. Recharts is already in the React ecosystem.
**Rejected:** Lovable (faster scaffolding but less control for polished case study). Client-side FRED calls (exposes API key). D3.js (overkill for this use case, Recharts is simpler).

### 2026-04-05 -- Lucide icons over emojis for KPI cards
**Decision:** Use Lucide React icons (Briefcase, TrendingDown, AlertTriangle, DoorOpen, TrendingUp) in accent-tinted icon boxes instead of emojis.
**Why:** Professional PM portfolio aesthetic. Emojis render inconsistently across OS and look casual.
**Rejected:** Emojis (casual), custom SVGs (unnecessary effort), no icons (loses visual hierarchy).

### 2026-04-05 -- Mock data fallback pattern
**Decision:** Dashboard renders with realistic mock data when FRED_API_KEY is missing or set to placeholder. Swaps to live data when valid key is present.
**Why:** Enables development and demo without API key. Ensures the dashboard always looks good even if FRED is down.
**Rejected:** Hard requirement on API key (breaks local dev), static JSON fixtures (less realistic curves).


### 2026-04-05

### 2026-04-05 -- H-1B Tracker as primary product angle
**Decision:** Add H-1B visa sponsorship data as a first-class tab alongside labor market data. H-1B Tracker is the default landing tab.
**Why:** Primary audience is international students looking for H-1B-friendly employers. This differentiates from generic job market dashboards. Existing sites (h1bdata.info, h1bgrader.com) are ugly and ad-heavy -- ours combines H-1B data with macro labor market context.
**Rejected:** H-1B as a secondary section within the labor market view (buries the value prop). H-1B only without labor market context (loses the analytics depth that impresses hiring managers).

### 2026-04-05 -- DOL LCA + USCIS Hub as H-1B data sources
**Decision:** Use two free government data sources: DOL OFLC LCA Disclosure Data (job titles, salaries, worksites) and USCIS H-1B Employer Data Hub (approval/denial rates by employer). Download as CSVs, process into JSON, serve statically.
**Why:** Both are free, authoritative, and updated quarterly. LCA data has role-level granularity (can filter for PM titles). USCIS data has outcome data (approval rates). Combined they tell the full story.
**Rejected:** Live API approach (these aren't APIs, just CSV downloads). Third-party aggregators like h1bdata.info (can't build on someone else's scraping). LinkedIn/Indeed data (not free, no API).

### 2026-04-05 -- Geography toggle: US / California / Bay Area
**Decision:** Add geography toggle to both tabs. For Labor Market, CA and Bay Area show fewer indicators with explanatory note. For H-1B, filter by worksite location.
**Why:** California focus differentiates from national dashboards. Bay Area is where most PM jobs are. JOLTS data is national-only so CA/Bay Area views legitimately have less data -- we show what's available and explain the gap.
**Rejected:** California-only without national (loses context). Pretending all data exists at all levels (dishonest). Hiding the toggle on Labor Market tab (users should understand data availability).

### 2026-04-05 -- Static processed JSON over database for H-1B data
**Decision:** Process raw CSVs into JSON files committed to the repo, served from Next.js API route. No database.
**Why:** Data updates quarterly (4x/year manual refresh is fine). Processed JSON files are small (<2MB). Avoids Supabase dependency and keeps infra cost at $0. Simpler architecture for a portfolio piece.
**Rejected:** Supabase Postgres (overkill for quarterly-updated static data). Client-side CSV parsing (too slow, files are 100MB+). Serverless function that processes on every request (wasteful).


### 2026-04-05

### 2026-04-05 -- Phase 2 shipped: H-1B Tracker + Geography Toggle
**Decision:** Shipped tab navigation, geography toggle, full H-1B dashboard with 4 sections, and data processing pipeline. H-1B Tracker is default tab.
**Why:** Phase 2 as specced in CLAUDE.md. All acceptance criteria met per status report.
**Rejected:** N/A -- execution phase.

### 2026-04-05 -- LCA processing: XLSX via Python + wage sanity checks
**Decision:** Process LCA XLSX files using Python (openpyxl) subprocess from the TypeScript script, because the files are 80MB+ and Node XLSX libraries choke on them. Added wage sanity checks: hourly rates >$500 treated as already annual (data entry errors), PM salaries capped at $800K.
**Why:** DOL distributes LCA data as XLSX not CSV. exceljs and SheetJS both failed on 80MB+ files. openpyxl streams efficiently in read-only mode. Wage errors are common in LCA filings (e.g., $105K annual filed as $105K/hour).
**Rejected:** Converting XLSX to CSV first (extra manual step). Loading entire file in Node (OOM). Trusting wage_unit blindly (produces $218M salary entries).

### 2026-04-05 -- USCIS processing: dual-format handler
**Decision:** USCIS script auto-detects file format via BOM: FY2022-2023 are standard UTF-8 CSV, FY2024-2026 are UTF-16LE tab-delimited Tableau crosstab exports with different column names. Tableau format has granular approval categories (New Employment, Continuation, Change of Employer, etc.) which we aggregate into Initial/Continuing.
**Why:** USCIS changed their data distribution method. Older files came from direct download, newer from Tableau Data Hub export. The column schemas differ significantly.
**Rejected:** Requiring manual conversion to a single format (error-prone). Supporting only one format (loses historical data).


### 2026-04-05

### 2026-04-05 -- H-1B data processing complete with real data
**Decision:** Processed 324K DOL LCA rows and 275K USCIS rows into compact JSON (54KB + 18KB). Added wage sanity checks: $500/hr cap before hourly-to-annual conversion, $800K annual cap for PM data.
**Why:** Raw LCA data contains employer data entry errors (annual salaries filed as hourly). Caps prevent outliers from distorting salary charts.
**Rejected:** Removing all high-salary entries (would lose legitimate high-comp data from FAANG). Manual review of each entry (not scalable with 324K rows).


### 2026-04-05

### 2026-04-05 -- Subdomain: pulse.harshit.ai
**Decision:** Use pulse.harshit.ai as the subdomain for the job market dashboard.
**Why:** "jobs.harshit.ai" sounds like a hiring page. "pulse" matches the product name (Job Market Pulse) and sounds like a data/analytics tool.
**Rejected:** jobs.harshit.ai (implies Harshit is hiring), market.harshit.ai (too generic).


### 2026-04-05

### 2026-04-05 -- Dashboard as case study (no separate case study page)
**Decision:** The dashboard itself will serve as the case study. Narrative editorial blocks woven between chart sections replace a separate /work/job-market-pulse page on harshit.ai. Homepage will have a project card linking directly to pulse.harshit.ai.
**Why:** The dashboard IS the artifact -- chart design, data choices, geography toggle, and annotations demonstrate PM skills directly. A separate case study page would just describe what the user can already see. Saves 2-3 hours of build time.
**Rejected:** Separate case study page on harshit.ai (redundant, the dashboard speaks for itself). No narrative at all (misses the chance to show PM thinking to recruiters who land on the page).


### 2026-04-05

### 2026-04-05 -- Favicon and OG metadata shipped
**Decision:** Added cropped P pulse favicon (square, at src/app/favicon.ico) and OG image (1200x630 at public/og-image.png). Layout.tsx updated with full Open Graph, Twitter summary_large_image, and themeColor.
**Why:** Social sharing previews on LinkedIn/Twitter need proper OG tags. Favicon gives brand identity in browser tabs.
**Rejected:** Using a generic Next.js favicon (no brand identity). Skipping twitter card (misses Twitter/X share previews).

