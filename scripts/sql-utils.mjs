import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

export const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
export const defaultDumpPath = path.resolve(rootDir, "..", "StudentHub Backup.sql");
export const defaultSamplePath = path.resolve(rootDir, "data", "studenthub-sample.sql");
export const defaultManifestPath = path.resolve(rootDir, "data", "dump-manifest.json");

export function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : process.env[name.toUpperCase()] || fallback;
}

export function createLineReader(filePath) {
  return readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity
  });
}

export function tableFromCreate(line) {
  const match = line.match(/^CREATE TABLE `([^`]+)`/);
  return match?.[1] ?? null;
}

export function tableFromInsert(line) {
  const match = line.match(/^INSERT INTO `([^`]+)` VALUES /);
  return match?.[1] ?? null;
}

export function splitTuples(valuesSql) {
  const tuples = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < valuesSql.length; i += 1) {
    const ch = valuesSql[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === "'") {
        inString = false;
      }
      continue;
    }

    if (ch === "'") {
      inString = true;
      continue;
    }

    if (ch === "(") {
      if (depth === 0) {
        start = i;
      }
      depth += 1;
      continue;
    }

    if (ch === ")") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        tuples.push(valuesSql.slice(start, i + 1));
      }
    }
  }

  return tuples;
}

export function splitFields(tupleSql) {
  const body = tupleSql.startsWith("(") && tupleSql.endsWith(")") ? tupleSql.slice(1, -1) : tupleSql;
  const fields = [];
  let start = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === "'") {
        inString = false;
      }
      continue;
    }

    if (ch === "'") {
      inString = true;
      continue;
    }

    if (ch === ",") {
      fields.push(body.slice(start, i));
      start = i + 1;
    }
  }

  fields.push(body.slice(start));
  return fields;
}

export function sqlString(value) {
  return `'${String(value).replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
}

export function isNullishSql(value) {
  return value.trim().toUpperCase() === "NULL";
}

export function parseCreateColumns(createSql) {
  const columns = [];
  for (const line of createSql.split("\n")) {
    const match = line.match(/^\s+`([^`]+)`\s+/);
    if (match) {
      columns.push(match[1]);
    }
  }
  return columns;
}

export async function readSchema(dumpPath) {
  const tables = new Map();
  let currentTable = null;
  let createBuffer = [];

  for await (const line of createLineReader(dumpPath)) {
    const table = tableFromCreate(line);
    if (table) {
      currentTable = table;
      createBuffer = [line];
      continue;
    }

    if (currentTable) {
      createBuffer.push(line);
      if (line.startsWith(") ENGINE=")) {
        const createSql = createBuffer.join("\n");
        tables.set(currentTable, {
          name: currentTable,
          columns: parseCreateColumns(createSql),
          createSql,
          insertStatements: 0,
          approxRows: 0,
          bytes: 0
        });
        currentTable = null;
        createBuffer = [];
      }
    }
  }

  return tables;
}

export function classifyTable(name) {
  if (["country", "currency", "degree", "degree_group", "bank", "setting", "permission_section", "permission_sub_section"].includes(name)) {
    return "lookup";
  }
  if (name.includes("token") || name.includes("verify") || name === "blocked_ip") {
    return "security";
  }
  if (name.includes("log") || name === "webhook" || name === "mail_log") {
    return "logs";
  }
  if (["candidate", "company", "contact", "staff", "admin", "inspector", "fulltimer"].includes(name)) {
    return "identity";
  }
  if (name.includes("transfer") || name.includes("salary") || name.includes("invoice") || name.includes("bank_transaction")) {
    return "finance";
  }
  if (name.includes("request") || name.includes("job") || name.includes("contract") || name.includes("working")) {
    return "workflows";
  }
  return "domain";
}

export function tableLimit(name) {
  const fullTables = new Set([
    "bank",
    "country",
    "currency",
    "degree",
    "degree_group",
    "discount_category",
    "permission_section",
    "permission_sub_section",
    "setting"
  ]);

  if (fullTables.has(name)) return Infinity;
  if (name.includes("token") || name.includes("verify") || name === "blocked_ip") return 0;
  if (name.includes("log") || name === "webhook") return 20;

  const limits = {
    admin: 4,
    area: 250,
    brand: 80,
    candidate: 80,
    candidate_education: 120,
    candidate_experience: 120,
    candidate_skill: 180,
    candidate_work_history: 160,
    candidate_working_date: 220,
    candidate_working_hour: 320,
    chat: 40,
    chat_message: 120,
    company: 40,
    company_contact: 80,
    contact: 80,
    contact_email: 100,
    contact_phone: 100,
    contract: 60,
    fixed_price_contract: 40,
    hourly_contract: 40,
    monthly_salary_contract: 40,
    file: 120,
    fulltimer: 40,
    invitation: 160,
    invoice: 80,
    job: 80,
    job_interest: 160,
    job_skills: 160,
    major: 200,
    mall: 80,
    note: 200,
    request: 80,
    request_activity: 160,
    request_application: 160,
    request_checklist: 160,
    request_interview: 120,
    request_skill: 160,
    staff: 30,
    staff_salary: 80,
    staff_work_session: 80,
    store: 120,
    story: 80,
    story_activity: 160,
    tag: 120,
    ticket: 60,
    ticket_comment: 120,
    transfer: 80,
    transfer_bank_advice: 80,
    transfer_candidate: 240,
    transfer_file: 80,
    transfer_file_entry: 240,
    university: 200
  };

  return limits[name] ?? 50;
}
