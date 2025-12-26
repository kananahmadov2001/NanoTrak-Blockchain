// Usage: node csv_to_json.js data.csv data.json

const fs = require("fs");
const { parse } = require("csv-parse/sync");

function toNumberOrKeep(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (s === "") return null;
  if (s === "<LOD") return "<LOD";
  const n = Number(s);
  return Number.isFinite(n) ? n : s;
}

function makeIsoTimestamp(dateStr, timeStr) {
  // Input: 8/26/2025 and 14:26:32
  // Output: 2025-08-26T14:26:32Z
  const [m, d, y] = dateStr.split("/").map((x) => x.trim());
  const mm = m.padStart(2, "0");
  const dd = d.padStart(2, "0");
  return `${y}-${mm}-${dd}T${timeStr}Z`;
}

function main() {
  const inputCsv = process.argv[2] || "data.csv";
  const outputJson = process.argv[3] || "data.json";

  const csvText = fs.readFileSync(inputCsv, "utf8");

  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  });

  const out = rows.map((r) => {
    const instrumentSerial = String(r["Instrument Serial Num"] || "").trim();
    const readingNum = toNumberOrKeep(r["Reading #"]);
    const timestamp = makeIsoTimestamp(r["Date"], r["Time"]);

    const scanId = `${instrumentSerial}-${readingNum}-${timestamp}`;

    const elementSymbols = [
      "Ti","V","Cr","Mn","Fe","Co","Ni","Cu","Zn","Sr","Zr","Nb","Mo","Pd","Ag","Cd","Sn","Sb","Hf","Ta","W","Re","Au","Pb","Bi","LE"
    ];

    const elements = {};
    for (const sym of elementSymbols) {
      const concKey = `${sym} Concentration`;
      const errKey = `${sym} Error1s`;
      if (concKey in r || errKey in r) {
        elements[sym] = {
          concentration: toNumberOrKeep(r[concKey]),
          error_1s: toNumberOrKeep(r[errKey]),
        };
      }
    }

    return {
      scan_id: scanId,
      instrument_serial: instrumentSerial,
      reading_number: readingNum,
      timestamp,
      method_name: (r["Method Name"] || "").trim() || null,
      test_label: toNumberOrKeep(r["Test Label"]),
      collimation_status: (r["Collimation Status"] || "").trim() || null,
      units: (r["Units"] || "").trim() || null,
      best_match: (r["Best Match"] || "").trim() || null,
      best_match_number: toNumberOrKeep(r["Best Match Number"]),
      second_match: (r["2nd Match"] || "").trim() || null,
      second_match_number: toNumberOrKeep(r["2nd Match Number"]),
      metadata: {
        customer: (r["Customer"] || "").trim() || null,
        project_no: (r["Project No."] || "").trim() || null,
        location: (r["Location"] || "").trim() || null,
        test_count: toNumberOrKeep(r["Test Count"]),
        operator: (r["Operator"] || "").trim() || null,
        component: (r["Component"] || "").trim() || null,
        quality: (r["Quality"] || "").trim() || null,
        retest_note: (r["Retest Note"] || "").trim() || null,
        real_time_1: toNumberOrKeep(r["Real Time 1"]),
      },
      elements,
    };
  });

  fs.writeFileSync(outputJson, JSON.stringify(out, null, 2));
  console.log(`Wrote ${out.length} records to ${outputJson}`);
}

main();
