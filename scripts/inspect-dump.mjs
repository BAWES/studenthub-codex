import fs from "node:fs";
import {
  classifyTable,
  createLineReader,
  defaultDumpPath,
  defaultManifestPath,
  getArg,
  readSchema,
  splitTuples,
  tableFromInsert
} from "./sql-utils.mjs";

const dumpPath = getArg("dump", defaultDumpPath);
const outputPath = getArg("output", defaultManifestPath);

if (!fs.existsSync(dumpPath)) {
  throw new Error(`Dump not found: ${dumpPath}`);
}

const tables = await readSchema(dumpPath);

for await (const line of createLineReader(dumpPath)) {
  const table = tableFromInsert(line);
  if (!table || !tables.has(table)) continue;

  const entry = tables.get(table);
  entry.insertStatements += 1;
  entry.bytes += Buffer.byteLength(line, "utf8");
  entry.approxRows += splitTuples(line.slice(line.indexOf(" VALUES ") + 8).replace(/;$/, "")).length;
}

const manifest = [...tables.values()].map((table, index) => ({
  order: index + 1,
  name: table.name,
  category: classifyTable(table.name),
  columns: table.columns,
  insertStatements: table.insertStatements,
  approxRows: table.approxRows,
  dataBytes: table.bytes
}));

fs.mkdirSync(new URL("../data/", import.meta.url), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);

const byCategory = manifest.reduce((acc, table) => {
  acc[table.category] = (acc[table.category] ?? 0) + table.approxRows;
  return acc;
}, {});

console.log(`Wrote ${outputPath}`);
console.log(`Tables: ${manifest.length}`);
console.log("Approx rows by category:");
for (const [category, rows] of Object.entries(byCategory).sort()) {
  console.log(`- ${category}: ${rows}`);
}
console.log("Largest tables:");
for (const table of manifest.toSorted((a, b) => b.approxRows - a.approxRows).slice(0, 15)) {
  console.log(`- ${table.name}: ${table.approxRows}`);
}
