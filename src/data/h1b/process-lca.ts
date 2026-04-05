/**
 * Process DOL OFLC LCA Disclosure XLSX files into filtered JSON.
 *
 * Usage: npx tsx src/data/h1b/process-lca.ts
 *
 * Prerequisites:
 * - Download LCA disclosure XLSX files from https://www.dol.gov/agencies/eta/foreign-labor/performance
 * - Place raw files in src/data/h1b/raw/ (e.g., LCA_Disclosure_Data_FY2024_Q4.xlsx)
 * - Python3 with openpyxl must be installed: pip3 install openpyxl
 *
 * Output: src/data/h1b/lca-processed.json
 */

import { execSync } from "child_process";
import { writeFileSync, readdirSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { tmpdir } from "os";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = join(__dirname, "raw");
const OUTPUT_PATH = join(__dirname, "lca-processed.json");

const PM_KEYWORDS = [
  "PRODUCT MANAGER",
  "PRODUCT ANALYST",
  "PROGRAM MANAGER",
  "TECHNICAL PROGRAM MANAGER",
  "PRODUCT OWNER",
  "PRODUCT DEVELOPMENT",
];

function normalizeEmployer(name: string): string {
  return name
    .toUpperCase()
    .replace(/\s+(LLC|INC|CORP|CO|LTD|LP|LLP|INCORPORATED|CORPORATION)\.?$/g, "")
    .replace(/[.,]/g, "")
    .trim();
}

function isPMRole(jobTitle: string): boolean {
  const upper = jobTitle.toUpperCase();
  return PM_KEYWORDS.some((kw) => upper.includes(kw));
}

interface RawRow {
  employer: string;
  jobTitle: string;
  wageFrom: number;
  wageTo: number;
  wageUnit: string;
  city: string;
  state: string;
  caseStatus: string;
  decisionDate: string;
}

/**
 * Use Python + openpyxl to stream-read an XLSX file and extract only
 * the columns we need, outputting as JSON lines to stdout.
 * This avoids loading 80MB+ files entirely into Node memory.
 */
function extractFromXLSX(filePath: string): RawRow[] {
  const pythonScript = `
import openpyxl, json, sys

wb = openpyxl.load_workbook(sys.argv[1], read_only=True, data_only=True)
ws = wb.active

# Read headers from row 1
headers = {}
for row in ws.iter_rows(min_row=1, max_row=1, values_only=False):
    for cell in row:
        if cell.value:
            headers[str(cell.value).strip().upper()] = cell.column - 1

needed = {
    'employer': headers.get('EMPLOYER_NAME'),
    'jobTitle': headers.get('JOB_TITLE'),
    'wageFrom': headers.get('WAGE_RATE_OF_PAY_FROM'),
    'wageTo': headers.get('WAGE_RATE_OF_PAY_TO'),
    'wageUnit': headers.get('WAGE_UNIT_OF_PAY'),
    'city': headers.get('WORKSITE_CITY'),
    'state': headers.get('WORKSITE_STATE'),
    'caseStatus': headers.get('CASE_STATUS'),
    'decisionDate': headers.get('DECISION_DATE'),
    'employerCity': headers.get('EMPLOYER_CITY'),
    'employerState': headers.get('EMPLOYER_STATE'),
    'socTitle': headers.get('SOC_TITLE'),
    'pwUnit': headers.get('PW_UNIT_OF_PAY'),
}

# Verify critical columns exist
for key in ['employer', 'caseStatus']:
    if needed[key] is None:
        print(json.dumps({'error': f'Missing column for {key}', 'available': list(headers.keys())[:20]}))
        sys.exit(1)

count = 0
for row in ws.iter_rows(min_row=2, values_only=True):
    status = str(row[needed['caseStatus']] or '').strip().upper()
    if status != 'CERTIFIED':
        continue

    def g(key, fallback=None):
        idx = needed.get(key)
        if idx is not None and idx < len(row):
            v = row[idx]
            if v is not None:
                return str(v).strip()
        if fallback:
            idx2 = needed.get(fallback)
            if idx2 is not None and idx2 < len(row):
                v = row[idx2]
                if v is not None:
                    return str(v).strip()
        return ''

    obj = {
        'employer': g('employer'),
        'jobTitle': g('jobTitle', 'socTitle'),
        'wageFrom': g('wageFrom'),
        'wageTo': g('wageTo'),
        'wageUnit': g('wageUnit', 'pwUnit'),
        'city': g('city', 'employerCity'),
        'state': g('state', 'employerState'),
        'caseStatus': 'Certified',
        'decisionDate': g('decisionDate'),
    }
    print(json.dumps(obj))
    count += 1

sys.stderr.write(f'{count} certified rows\\n')
wb.close()
`;

  console.log(`  Extracting with Python...`);
  const tmpPy = join(tmpdir(), `lca_extract_${Date.now()}.py`);
  writeFileSync(tmpPy, pythonScript);
  let result: string;
  try {
    result = execSync(
      `python3 ${JSON.stringify(tmpPy)} ${JSON.stringify(filePath)}`,
      { maxBuffer: 500 * 1024 * 1024, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    );
  } finally {
    try { unlinkSync(tmpPy); } catch {}
  }

  const rows: RawRow[] = [];
  for (const line of result.split("\n")) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.error) {
        console.error("  Error:", obj.error);
        continue;
      }

      const wageFromRaw = parseFloat(String(obj.wageFrom).replace(/[$,]/g, "")) || 0;
      const wageToRaw = parseFloat(String(obj.wageTo || obj.wageFrom).replace(/[$,]/g, "")) || wageFromRaw;
      const unit = (obj.wageUnit || "Year").toUpperCase();

      let wageFrom = wageFromRaw;
      let wageTo = wageToRaw;
      if (unit.includes("HOUR")) {
        // Sanity check: if "hourly" rate > $500, it's likely a data entry
        // error where an annual salary was filed with unit=Hour
        if (wageFromRaw > 500) {
          // Treat as already annual
        } else {
          wageFrom = wageFromRaw * 2080;
          wageTo = wageToRaw * 2080;
        }
      } else if (unit.includes("MONTH")) {
        if (wageFromRaw > 50000) {
          // Likely annual salary filed as monthly
        } else {
          wageFrom = wageFromRaw * 12;
          wageTo = wageToRaw * 12;
        }
      } else if (unit.includes("BI-WEEK") || unit.includes("BIWEEK")) {
        wageFrom = wageFromRaw * 26;
        wageTo = wageToRaw * 26;
      } else if (unit.includes("WEEK")) {
        wageFrom = wageFromRaw * 52;
        wageTo = wageToRaw * 52;
      }

      rows.push({
        employer: obj.employer || "",
        jobTitle: obj.jobTitle || "",
        wageFrom,
        wageTo,
        wageUnit: unit,
        city: obj.city || "",
        state: obj.state || "",
        caseStatus: obj.caseStatus,
        decisionDate: obj.decisionDate || "",
      });
    } catch {
      // skip malformed lines
    }
  }

  return rows;
}

function main() {
  const files = readdirSync(RAW_DIR);

  // Find unique LCA files (skip duplicates like LCA_FY2023.xlsx when LCA_Disclosure_Data_FY2023_Q4.xlsx exists)
  const xlsxFiles = files.filter(
    (f) =>
      f.toLowerCase().endsWith(".xlsx") &&
      f.toLowerCase().includes("lca") &&
      f.includes("Disclosure") // prefer the full-name versions
  );

  if (xlsxFiles.length === 0) {
    // Fallback: try any xlsx with lca in name
    const fallback = files.filter(
      (f) => f.toLowerCase().endsWith(".xlsx") && f.toLowerCase().includes("lca")
    );
    if (fallback.length === 0) {
      console.error("No LCA XLSX files found in", RAW_DIR);
      console.error("Download from: https://www.dol.gov/agencies/eta/foreign-labor/performance");
      process.exit(1);
    }
    xlsxFiles.push(...fallback);
  }

  // Deduplicate by FY (prefer Disclosure versions)
  const byFY = new Map<string, string>();
  for (const f of xlsxFiles) {
    const fyMatch = f.match(/FY(\d{4})/i);
    const fy = fyMatch ? fyMatch[1] : f;
    if (!byFY.has(fy) || f.includes("Disclosure")) {
      byFY.set(fy, f);
    }
  }
  const uniqueFiles = Array.from(byFY.values());

  console.log(`Processing ${uniqueFiles.length} LCA file(s)...`);

  const allRows: RawRow[] = [];
  for (const file of uniqueFiles) {
    console.log(`\n  Reading ${file}...`);
    const rows = extractFromXLSX(join(RAW_DIR, file));
    console.log(`  ${rows.length} certified rows extracted`);
    allRows.push(...rows);
  }

  console.log(`\nTotal certified rows: ${allRows.length}`);

  // Aggregate top sponsors
  const employerMap = new Map<
    string,
    { total: number; pm: number; wages: number[]; state: string; name: string }
  >();
  for (const row of allRows) {
    if (!row.employer) continue;
    const key = normalizeEmployer(row.employer);
    const existing = employerMap.get(key) ?? {
      total: 0,
      pm: 0,
      wages: [],
      state: row.state,
      name: row.employer,
    };
    existing.total++;
    if (isPMRole(row.jobTitle)) {
      existing.pm++;
      if (row.wageFrom > 30000 && row.wageFrom < 800000) {
        existing.wages.push(row.wageFrom);
      }
    }
    employerMap.set(key, existing);
  }

  const topSponsors = Array.from(employerMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 100)
    .map((e) => ({
      employer: e.name,
      totalFilings: e.total,
      pmFilings: e.pm,
      avgSalary:
        e.wages.length > 0
          ? Math.round(e.wages.reduce((a, b) => a + b, 0) / e.wages.length)
          : 0,
      state: e.state,
    }));

  // PM salary data -- filter out obviously bad wages (>$800K annual is likely a data error)
  const pmRows = allRows
    .filter((r) => isPMRole(r.jobTitle) && r.wageFrom > 30000 && r.wageFrom < 800000)
    .sort((a, b) => b.wageFrom - a.wageFrom)
    .slice(0, 200);

  const pmSalaries = pmRows.map((r) => {
    const decDate = r.decisionDate;
    let year = new Date().getFullYear();
    if (decDate) {
      const parsed = new Date(decDate);
      if (!isNaN(parsed.getTime())) year = parsed.getFullYear();
    }
    return {
      employer: r.employer,
      jobTitle: r.jobTitle,
      salaryFrom: Math.round(r.wageFrom),
      salaryTo: Math.round(r.wageTo),
      city: r.city,
      year,
    };
  });

  // Filings by year
  const yearMap = new Map<number, { total: number; certified: number; denied: number }>();
  for (const row of allRows) {
    let year = new Date().getFullYear();
    if (row.decisionDate) {
      const parsed = new Date(row.decisionDate);
      if (!isNaN(parsed.getTime())) year = parsed.getFullYear();
    }
    const existing = yearMap.get(year) ?? { total: 0, certified: 0, denied: 0 };
    existing.total++;
    existing.certified++;
    yearMap.set(year, existing);
  }
  const filingsByYear = Array.from(yearMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, data]) => ({ year, ...data }));

  const fiscalYears = filingsByYear.map((f) => `FY${f.year}`);

  const output = {
    topSponsors,
    pmSalaries,
    filingsByYear,
    metadata: {
      lastUpdated: new Date().toISOString().split("T")[0],
      source: "DOL OFLC LCA Disclosure",
      fiscalYears,
    },
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${OUTPUT_PATH}`);
  console.log(`  ${topSponsors.length} top sponsors`);
  console.log(`  ${pmSalaries.length} PM salary entries`);
  console.log(`  ${filingsByYear.length} fiscal years`);
}

main();
