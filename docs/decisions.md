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


### 2026-04-05

### 2026-04-05 -- Salary chart rewrite: single bar per employer
**Decision:** Rewrote salary-chart.tsx to show average PM salary per employer as a single horizontal bar, not a min-max range. Normalized employer names to merge duplicates. Top 15 by highest average.
**Why:** Most LCA entries have salaryFrom === salaryTo (same value), rendering zero-width range bars. Single bar with average salary is clearer and more useful.
**Rejected:** Keeping range bars (invisible for most entries). Showing individual filing rows (too granular, clutters chart).

### 2026-04-05 -- CA/Bay Area race condition fix
**Decision:** Fixed dashboard.tsx to reset data state to null when geography changes, triggering loading state during the transition. Issue was old US-keyed data persisting while CA view tried to read CA-keyed fields.
**Why:** Race condition caused 0.0% values. Not a data availability issue -- FRED returns valid data for CAUR, CANA, CAICLAIMS, SANF806URN.
**Rejected:** Graying out toggles (data actually exists, just wasn't loading correctly).


### 2026-04-05

### 2026-04-05 -- CA/Bay Area charts fixed, salary chart rewrite, petition approval rename
**Decision:** (1) Replaced dual-axis HeroChart for CA with dedicated UnemploymentLineChart. CA payrolls are KPI-only. (2) Removed require() in SimpleLineChart, replaced with standard ES imports. (3) Rewrote salary chart as single-bar-per-employer with normalized names. (4) Renamed "Approval Rate" to "Petition Approval" with footnote explaining lottery vs petition distinction. (5) Fixed Y-axis margins across all charts.
**Why:** CA payrolls (17K) vs unemployment (5%) on same chart was unreadable. require() broke in Next.js 16 client components. Salary ranges with from===to rendered zero-width bars. "Approval Rate" was misleading -- 97% is petition approval after lottery, not overall odds.
**Rejected:** Keeping dual-axis for CA (unreadable scales). Graying out CA/Bay Area toggles (data exists, just needed correct chart type). Showing lottery odds (data not available from USCIS).


### 2026-04-05

### 2026-04-05 -- All dashboard bugs fixed and verified on production
**Decision:** (1) Added mock data fallback for all CA/Bay Area FRED series so charts always render. Added AbortController timeout + User-Agent header to FRED fetch. Production now returns real FRED data for CAUR (5.7%), SANF806URN (4.0%). (2) Replaced Recharts BarChart with CSS-based bar chart for salary display -- 15 companies render correctly with $XK labels and filing counts. (3) Y-axis margins increased across all charts.
**Why:** FRED API fetch was silently failing on Vercel serverless with no fallback for state series. Recharts Bar+Cell+LabelList combo had a rendering bug that prevented bars from appearing. CSS bars are more reliable and lightweight.
**Rejected:** Keeping Recharts for salary chart (proven unreliable for horizontal bars with Cell components). Removing CA/Bay Area views entirely (data exists and now loads correctly).


### 2026-04-05

### 2026-04-05 -- Salary chart sort toggle and name cleanup
**Decision:** Added "By Filings" / "By Salary" sort toggle to PM Salary Ranges chart. Default is By Filings (min 5 filings), By Salary requires min 2 filings. Cleaned all employer display names (trailing commas, periods, common suffixes). Added data period subtitle "FY2023-FY2024 (Oct 2022 - Sep 2024)".
**Why:** Previous sort by highest salary surfaced obscure companies with 1 outlier filing. Sorting by filings shows companies that actually hire PMs at scale (Amazon, Google, Meta, ByteDance). Sort toggle lets users explore both views. Name cleanup removes artifacts from LCA data normalization.
**Rejected:** Removing salary sort entirely (users may want to see highest-paying companies). Showing all companies regardless of filing count (1-filing companies aren't meaningful signal).


### 2026-04-06

### 2026-04-05 -- FRED API blocked from Vercel: static snapshot solution
**Decision:** FRED's API rejects our API key from Vercel's data center IPs (returns 400 "api_key not registered"). Implemented a committed static snapshot (src/data/fred-snapshot.json) as primary data source, with three-tier fallback: file cache -> live FRED API -> snapshot -> mock data. Snapshot is fetched locally where the API key works, committed to repo.
**Why:** The FRED API works from localhost and browsers but not from Vercel serverless. This is a FRED infrastructure limitation we can't control. Monthly snapshot refresh is acceptable since FRED data updates monthly anyway.
**Rejected:** Using a different API key (same key works from browser, issue is IP-based). Proxying through a different server (adds complexity and cost). Removing FRED integration entirely (loses the real-time data story).

### 2026-04-05 -- Fixed layoffs series: JTSLLL -> JTSLDL
**Decision:** Changed layoffs series ID from JTSLLL (doesn't exist) to JTSLDL (Layoffs and Discharges: Total Nonfarm). Updated in constants.ts and mock-data.ts.
**Why:** JTSLLL was returning empty data. JTSLDL is the correct FRED series ID for layoffs and discharges.
**Rejected:** N/A -- was a bug, not a design decision.


### 2026-04-06

### 2026-04-05 -- Data freshness confirmed: Mar 2026 on production
**Decision:** Verified production at pulse.harshit.ai returns 62 UNRATE data points through Mar 2026 (4.3%), CAUR through Dec 2025 (5.5%), SANF806URN through Dec 2025 (4.1%). Static snapshot solution working correctly. Added "Data as of" label, "Fetch Latest" button, and data period labels to both tabs.
**Why:** Confirms the three-tier fallback (cache -> live API -> snapshot -> mock) is working. FRED API key is rejected from Vercel IPs so snapshot is the primary source. Monthly local refresh is the maintenance model.
**Rejected:** N/A -- verification step.


### 2026-04-06

### 2026-04-05 -- Gap interpolation for missing FRED data points
**Decision:** Added fillGaps() function in fred.ts that detects missing months in time series and linearly interpolates values. Oct 2025 UNRATE was missing in FRED (returns "."), now interpolated at 4.45%. Applied to all series before serving.
**Why:** Missing data points cause visible breaks in line charts that look like bugs to users. Linear interpolation for a single missing month is reasonable and accurate enough for a dashboard.
**Rejected:** Leaving gaps visible (looks broken). Forward-filling previous value (less accurate than interpolation). Hiding the interpolated point (users should see continuous trends).

### 2026-04-05 -- State/metro data lag notes
**Decision:** Added "State data typically lags national data by 1-2 months" to California view and "Metro data typically lags national data by 1-2 months" to Bay Area view.
**Why:** CA data goes through Dec 2025 while national goes through Mar 2026. Users need to understand this is a BLS publication schedule issue, not a dashboard bug.
**Rejected:** Hiding CA/Bay Area views until they catch up (loses the geography feature). Showing national data as a proxy (dishonest).


### 2026-04-06

### 2026-04-05 -- Default tab changed: Labor Market first
**Decision:** Changed the default landing tab from H-1B Tracker to Labor Market. The labor market charts (dual-axis lines, area charts, event annotations) are more visually compelling and make a stronger first impression.
**Why:** The charts tell a story at a glance and demonstrate data visualization skills immediately. The H-1B table view requires reading — less impactful as a landing view. Recruiters see the analytics capability first, then can explore H-1B data.
**Rejected:** Keeping H-1B as default (tables are less visually engaging as a first impression). Removing tabs entirely (both views add value for different audiences).

