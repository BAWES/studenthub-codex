import fs from "node:fs";
import {
  createLineReader,
  defaultDumpPath,
  defaultSamplePath,
  getArg,
  isNullishSql,
  readSchema,
  splitFields,
  splitTuples,
  sqlString,
  tableFromInsert,
  tableLimit
} from "./sql-utils.mjs";

const dumpPath = getArg("dump", defaultDumpPath);
const outputPath = getArg("output", defaultSamplePath);

if (!fs.existsSync(dumpPath)) {
  throw new Error(`Dump not found: ${dumpPath}`);
}

const tables = await readSchema(dumpPath);
const output = fs.createWriteStream(outputPath, { encoding: "utf8" });
const inserted = new Map();

function anonymizeField(table, column, value, rowNumber) {
  if (isNullishSql(value)) return value;

  const col = column.toLowerCase();
  const parts = col.split("_").filter(Boolean);
  const tablePrefix = table.replaceAll("_", "-");
  const unquoted = value.startsWith("'") && value.endsWith("'") ? value.slice(1, -1) : value;
  const hasPart = (part) => parts.includes(part);

  if (col.includes("password_hash")) return sqlString("disabled-password-hash");
  if (col.includes("password_reset_token")) return "NULL";
  if (col.includes("auth_key")) return sqlString(`sample-auth-key-${rowNumber}`);
  if (col === "otp") return "NULL";
  if (col.includes("token")) return sqlString(`${tablePrefix}-token-${rowNumber}`);
  if (
    (col === "email" || col.endsWith("_email")) &&
    !hasPart("limit") &&
    !hasPart("receive") &&
    !hasPart("verification") &&
    !hasPart("verified")
  ) {
    return sqlString(`${tablePrefix}-${rowNumber}@example.test`);
  }
  if (unquoted.includes("@")) return sqlString(`${tablePrefix}-${rowNumber}@example.test`);
  if (
    (hasPart("phone") || hasPart("mobile") || col.endsWith("_phone") || col.endsWith("_mobile")) &&
    !hasPart("date") &&
    !hasPart("datetime") &&
    !hasPart("created") &&
    !hasPart("updated")
  ) {
    return sqlString(`+100000${String(rowNumber).padStart(5, "0")}`);
  }
  if (col.includes("name_en") || col.endsWith("_name") || col === "name") return sqlString(`${titleize(table)} ${rowNumber}`);
  if (col.includes("name_ar")) return sqlString(`${titleize(table)} AR ${rowNumber}`);
  if (col.includes("address")) return sqlString(`${rowNumber} Sample Street`);
  if (col.includes("photo") || col.includes("image") || col.includes("avatar")) return "NULL";
  if (
    ((hasPart("civil") || hasPart("passport")) && (hasPart("id") || hasPart("number") || hasPart("no"))) &&
    !hasPart("date") &&
    !hasPart("created") &&
    !hasPart("updated")
  ) {
    return sqlString(`sample-${rowNumber}`);
  }
  if (col.includes("iban") || col.includes("account_number")) {
    return sqlString(`sample-${rowNumber}`);
  }
  if (col.includes("ip_address")) return sqlString("127.0.0.1");
  if (col.includes("device_id") || col.includes("device")) return sqlString("Sample Device");
  if (hasPart("url") || hasPart("link")) return sqlString("https://example.test/sample");

  return value;
}

function titleize(value) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function anonymizeTuple(table, tuple, rowNumber) {
  const columns = tables.get(table)?.columns ?? [];
  const fields = splitFields(tuple);
  if (columns.length !== fields.length) return tuple;

  const nextFields = fields.map((field, index) => anonymizeField(table, columns[index], field.trim(), rowNumber));
  return `(${nextFields.join(",")})`;
}

output.write("-- Generated from StudentHub Backup.sql by scripts/create-sample-sql.mjs\n");
output.write("-- This file is anonymized and intentionally small. Regenerate it instead of editing by hand.\n\n");
output.write("SET FOREIGN_KEY_CHECKS=0;\n");
output.write("SET UNIQUE_CHECKS=0;\n\n");

let currentTable = null;
let createBuffer = [];
let wroteSchema = false;

for await (const line of createLineReader(dumpPath)) {
  const createMatch = line.match(/^CREATE TABLE `([^`]+)`/);
  if (createMatch) {
    currentTable = createMatch[1];
    createBuffer = [line];
    continue;
  }

  if (currentTable) {
    createBuffer.push(line);
    if (line.startsWith(") ENGINE=")) {
      output.write(`DROP TABLE IF EXISTS \`${currentTable}\`;\n`);
      output.write(`${createBuffer.join("\n")}\n\n`);
      currentTable = null;
      createBuffer = [];
      wroteSchema = true;
    }
    continue;
  }

  const table = tableFromInsert(line);
  if (!table) continue;
  if (!wroteSchema) continue;

  const limit = tableLimit(table);
  if (limit === 0) continue;

  const alreadyInserted = inserted.get(table) ?? 0;
  if (alreadyInserted >= limit) continue;

  const valuesSql = line.slice(line.indexOf(" VALUES ") + 8).replace(/;$/, "");
  const tuples = splitTuples(valuesSql);
  const remaining = limit === Infinity ? tuples.length : Math.max(0, limit - alreadyInserted);
  const selected = tuples.slice(0, remaining);
  if (selected.length === 0) continue;

  const anonymized = selected.map((tuple, index) => anonymizeTuple(table, tuple, alreadyInserted + index + 1));
  output.write(`INSERT INTO \`${table}\` VALUES ${anonymized.join(",")};\n`);
  inserted.set(table, alreadyInserted + selected.length);
}

output.write("\nSET UNIQUE_CHECKS=1;\n");
output.write("SET FOREIGN_KEY_CHECKS=1;\n");
output.end();

await new Promise((resolve) => output.on("finish", resolve));

console.log(`Wrote ${outputPath}`);
console.log("Sample rows:");
for (const [table, count] of [...inserted.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`- ${table}: ${count}`);
}
