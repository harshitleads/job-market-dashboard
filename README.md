# Job Market Pulse

**The labor market, visualized.**

US labor market trends and H-1B visa sponsorship data in one clean dashboard. Four government data sources, refreshed daily, designed for job seekers, founders, and PMs who need answers without navigating government PDFs.

**Live:** [pulse.harshit.ai](https://pulse.harshit.ai) | **Case study:** [harshit.ai/work/job-market-pulse](https://harshit.ai/work/job-market-pulse)

---

## What it does

**Labor Market tab:** Job openings, unemployment rate, monthly hires, quits rate, and layoffs from 2021 to present. Dual-axis chart showing job openings vs unemployment with annotated key events (COVID recovery, Great Resignation, tech layoff wave). Geographic filters for US, California, and Bay Area.

**H-1B Tracker tab:** Company lookup with full filing history. Top 100 H-1B sponsors ranked by total LCA filings with PM-specific breakdowns. PM role salary ranges by company. H-1B approval trends by fiscal year (FY2020-FY2026 Q1).

## Data sources

- **FRED API** (Federal Reserve Economic Data): Job openings, unemployment, hires, quits, layoffs. Monthly, seasonally adjusted.
- **DOL OFLC** (Department of Labor): Labor Condition Application disclosure data. Every H-1B filing with job title, salary, employer. FY2022-FY2025.
- **USCIS** (H-1B Employer Data Hub): Approval and denial counts by employer. FY2020-FY2026 Q1.
- **BLS JOLTS** (Bureau of Labor Statistics): Source survey behind FRED labor data. 21,000 establishments monthly.

## Design decisions

**One chart, one story.** Every chart answers exactly one question. No multi-purpose charts requiring a legend to decode.

**Annotations over legends.** Key moments labeled directly on charts: peak job openings (~12M, Feb 2022), ChatGPT launch + tech layoff wave (Oct 2022), Meta/Google/Amazon mass layoffs (Dec 2022).

**H-1B as a first-class tab.** For international students and workers, sponsorship data is the most personally relevant labor market data. Not a footnote.

**Daily refresh.** FRED data fetched every 24 hours. Fetch Latest button for manual refresh with loading state.

## Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, Recharts
- Data: FRED API, DOL OFLC CSV, USCIS H-1B Employer Data Hub
- Deployment: Vercel

---

Built by [Harshit Sharma](https://harshit.ai).