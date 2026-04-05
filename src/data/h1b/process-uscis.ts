/**
 * Process USCIS H-1B Employer Data Hub files into filtered JSON.
 *
 * Handles two file formats:
 * - FY2022-2023: Standard CSV (UTF-8, comma-delimited)
 *   Columns: Fiscal Year, Employer, Initial Approval, Initial Denial,
 *            Continuing Approval, Continuing Denial, NAICS, Tax ID, State, City, ZIP
 *
 * - FY2024-2026: Tableau crosstab exports (UTF-16LE, tab-delimited)
 *   Columns: Line by line, Fiscal Year, Employer (Petitioner) Name, Tax ID,
 *            Industry (NAICS) Code, Petitioner City, Petitioner State, Petitioner Zip Code,
 *            New Employment Approval, New Employment Denial,
 *            Continuation Approval, Continuation Denial,
 *            Change with Same Employer Approval, Change with Same Employer Denial,
 *            New Concurrent Approval, New Concurrent Denial,
 *            Change of Employer Approval, Change of Employer Denial,
 *            Amended Approval, Amended Denial
 *
 * Usage: npx tsx src/data/h1b/process-uscis.ts
 *
 * Output: src/data/h1b/uscis-processed.json
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = join(__dirname, "raw");
const OUTPUT_PATH = join(__dirname, "uscis-processed.json");

function normalizeEmployer(name: string): string {
  return name
    .toUpperCase()
    .replace(/\s+(LLC|INC|CORP|CO|LTD|LP|LLP|INCORPORATED|CORPORATION)\.?$/g, "")
    .replace(/[.,]/g, "")
    .trim();
}

interface USCISRow {
  fiscalYear: string;
  employer: string;
  initialApproved: number;
  initialDenied: number;
  continuingApproved: number;
  continuingDenied: number;
  naics: string;
  state: string;
  city: string;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

function detectFormat(filePath: string): "standard" | "tableau" {
  // Read first few bytes to check for UTF-16LE BOM
  const buf = Buffer.alloc(4);
  const fd = require("fs").openSync(filePath, "r");
  require("fs").readSync(fd, buf, 0, 4, 0);
  require("fs").closeSync(fd);

  // UTF-16LE BOM: FF FE
  if (buf[0] === 0xff && buf[1] === 0xfe) return "tableau";
  return "standard";
}

function processStandardCSV(filePath: string): USCISRow[] {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const rows: USCISRow[] = [];

  if (lines.length < 2) return rows;

  const headers = parseCSVLine(lines[0]).map((h) => h.replace(/"/g, "").trim().toUpperCase());

  const findCol = (pattern: string) =>
    headers.findIndex((h) => h.includes(pattern));

  const fyIdx = findCol("FISCAL YEAR");
  const empIdx = findCol("EMPLOYER");
  const iaIdx = findCol("INITIAL APPROVAL");
  const idIdx = findCol("INITIAL DENIAL");
  const caIdx = findCol("CONTINUING APPROVAL");
  const cdIdx = findCol("CONTINUING DENIAL");
  const naicsIdx = findCol("NAICS");
  const stateIdx = findCol("STATE");
  const cityIdx = findCol("CITY");

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseCSVLine(line).map((f) => f.replace(/"/g, "").trim());

    const employer = empIdx >= 0 ? fields[empIdx] ?? "" : "";
    if (!employer) continue;

    rows.push({
      fiscalYear: `FY${fyIdx >= 0 ? fields[fyIdx] : ""}`,
      employer,
      initialApproved: parseInt(fields[iaIdx] ?? "0") || 0,
      initialDenied: parseInt(fields[idIdx] ?? "0") || 0,
      continuingApproved: parseInt(fields[caIdx] ?? "0") || 0,
      continuingDenied: parseInt(fields[cdIdx] ?? "0") || 0,
      naics: naicsIdx >= 0 ? fields[naicsIdx] ?? "" : "",
      state: stateIdx >= 0 ? fields[stateIdx] ?? "" : "",
      city: cityIdx >= 0 ? fields[cityIdx] ?? "" : "",
    });
  }

  return rows;
}

function processTableauCSV(filePath: string): USCISRow[] {
  // Read as UTF-16LE buffer, convert to UTF-8 string
  const buf = readFileSync(filePath);
  // Skip BOM (first 2 bytes)
  const content = buf.subarray(2).toString("utf16le");
  const lines = content.split("\n");
  const rows: USCISRow[] = [];

  if (lines.length < 2) return rows;

  // Tab-delimited headers
  const headers = lines[0].split("\t").map((h) => h.trim().toUpperCase());

  const findCol = (pattern: string) =>
    headers.findIndex((h) => h.includes(pattern));

  const fyIdx = findCol("FISCAL YEAR");
  const empIdx = findCol("EMPLOYER") !== -1 ? findCol("EMPLOYER") : findCol("PETITIONER");
  const naicsIdx = findCol("NAICS");
  const cityIdx = findCol("CITY");
  const stateIdx = findCol("STATE");

  // Tableau format has granular approval/denial categories
  const newApprIdx = findCol("NEW EMPLOYMENT APPROVAL");
  const newDenIdx = findCol("NEW EMPLOYMENT DENIAL");
  const contApprIdx = findCol("CONTINUATION APPROVAL");
  const contDenIdx = findCol("CONTINUATION DENIAL");
  const changeSameApprIdx = findCol("CHANGE WITH SAME EMPLOYER APPROVAL");
  const changeSameDenIdx = findCol("CHANGE WITH SAME EMPLOYER DENIAL");
  const newConcApprIdx = findCol("NEW CONCURRENT APPROVAL");
  const newConcDenIdx = findCol("NEW CONCURRENT DENIAL");
  const changeEmpApprIdx = findCol("CHANGE OF EMPLOYER APPROVAL");
  const changeEmpDenIdx = findCol("CHANGE OF EMPLOYER DENIAL");
  const amendApprIdx = findCol("AMENDED APPROVAL");
  const amendDenIdx = findCol("AMENDED DENIAL");

  const num = (fields: string[], idx: number) => {
    if (idx < 0 || idx >= fields.length) return 0;
    return Math.round(parseFloat(fields[idx]?.trim() || "0")) || 0;
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = line.split("\t");
    const employer = empIdx >= 0 ? fields[empIdx]?.trim() ?? "" : "";
    if (!employer) continue;

    // Aggregate: "Initial" = New Employment + Change of Employer + New Concurrent
    // "Continuing" = Continuation + Change with Same Employer + Amended
    const initialApproved =
      num(fields, newApprIdx) +
      num(fields, changeEmpApprIdx) +
      num(fields, newConcApprIdx);
    const initialDenied =
      num(fields, newDenIdx) +
      num(fields, changeEmpDenIdx) +
      num(fields, newConcDenIdx);
    const continuingApproved =
      num(fields, contApprIdx) +
      num(fields, changeSameApprIdx) +
      num(fields, amendApprIdx);
    const continuingDenied =
      num(fields, contDenIdx) +
      num(fields, changeSameDenIdx) +
      num(fields, amendDenIdx);

    const fyRaw = fyIdx >= 0 ? fields[fyIdx]?.trim() : "";
    const fy = fyRaw?.startsWith("FY") ? fyRaw : `FY${fyRaw}`;

    rows.push({
      fiscalYear: fy,
      employer,
      initialApproved,
      initialDenied,
      continuingApproved,
      continuingDenied,
      naics: naicsIdx >= 0 ? fields[naicsIdx]?.trim() ?? "" : "",
      state: stateIdx >= 0 ? fields[stateIdx]?.trim() ?? "" : "",
      city: cityIdx >= 0 ? fields[cityIdx]?.trim() ?? "" : "",
    });
  }

  return rows;
}

function main() {
  const files = readdirSync(RAW_DIR);
  const csvFiles = files.filter(
    (f) =>
      f.toLowerCase().endsWith(".csv") &&
      (f.toLowerCase().includes("uscis") ||
        f.toLowerCase().includes("h1b") ||
        f.toLowerCase().includes("h-1b") ||
        f.toLowerCase().includes("datahub"))
  );

  if (csvFiles.length === 0) {
    console.error("No USCIS CSV files found in", RAW_DIR);
    console.error(
      "Download from: https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub"
    );
    process.exit(1);
  }

  console.log(`Processing ${csvFiles.length} USCIS file(s)...`);

  const allRows: USCISRow[] = [];
  for (const file of csvFiles) {
    const filePath = join(RAW_DIR, file);
    const format = detectFormat(filePath);
    console.log(`\n  Reading ${file} (${format} format)...`);

    const rows =
      format === "tableau"
        ? processTableauCSV(filePath)
        : processStandardCSV(filePath);

    console.log(`  ${rows.length} employer rows`);
    allRows.push(...rows);
  }

  console.log(`\nTotal rows: ${allRows.length}`);

  // Aggregate approval trends by fiscal year
  const yearMap = new Map<
    string,
    {
      initialApproved: number;
      initialDenied: number;
      continuingApproved: number;
      continuingDenied: number;
    }
  >();
  for (const row of allRows) {
    const fy = row.fiscalYear;
    if (!fy) continue;
    const existing = yearMap.get(fy) ?? {
      initialApproved: 0,
      initialDenied: 0,
      continuingApproved: 0,
      continuingDenied: 0,
    };
    existing.initialApproved += row.initialApproved;
    existing.initialDenied += row.initialDenied;
    existing.continuingApproved += row.continuingApproved;
    existing.continuingDenied += row.continuingDenied;
    yearMap.set(fy, existing);
  }

  const approvalTrends = Array.from(yearMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, data]) => ({ year, ...data }));

  console.log("\nApproval trends by year:");
  for (const t of approvalTrends) {
    const total =
      t.initialApproved +
      t.initialDenied +
      t.continuingApproved +
      t.continuingDenied;
    const approved = t.initialApproved + t.continuingApproved;
    const rate = total > 0 ? ((approved / total) * 100).toFixed(1) : "N/A";
    console.log(
      `  ${t.year}: ${approved.toLocaleString()} approved / ${total.toLocaleString()} total (${rate}%)`
    );
  }

  // Top employers by total approvals
  const employerMap = new Map<
    string,
    {
      name: string;
      approved: number;
      denied: number;
      state: string;
      naics: string;
    }
  >();
  for (const row of allRows) {
    if (!row.employer) continue;
    const key = normalizeEmployer(row.employer);
    const existing = employerMap.get(key) ?? {
      name: row.employer,
      approved: 0,
      denied: 0,
      state: row.state,
      naics: row.naics,
    };
    existing.approved += row.initialApproved + row.continuingApproved;
    existing.denied += row.initialDenied + row.continuingDenied;
    employerMap.set(key, existing);
  }

  const topEmployers = Array.from(employerMap.values())
    .sort((a, b) => b.approved - a.approved)
    .slice(0, 100)
    .map((e) => ({
      employer: e.name,
      totalApproved: e.approved,
      totalDenied: e.denied,
      approvalRate:
        e.approved + e.denied > 0
          ? Math.round(((e.approved / (e.approved + e.denied)) * 100) * 10) / 10
          : 0,
      state: e.state,
      naics: e.naics,
    }));

  const output = {
    approvalTrends,
    topEmployers,
    metadata: {
      lastUpdated: new Date().toISOString().split("T")[0],
      source: "USCIS H-1B Employer Data Hub",
    },
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${OUTPUT_PATH}`);
  console.log(`  ${approvalTrends.length} fiscal years`);
  console.log(`  ${topEmployers.length} top employers`);
}

main();
