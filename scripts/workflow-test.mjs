import crypto from "node:crypto";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Config & environment
// ---------------------------------------------------------------------------

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

function loadEnv() {
  if (!fs.existsSync(".env")) return;
  const env = fs.readFileSync(".env", "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=["']?(.+?)["']?$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

loadEnv();
const prisma = new PrismaClient();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

// ---------------------------------------------------------------------------
// Session signing (same as smoke test)
// ---------------------------------------------------------------------------

function signSession(user) {
  const payload = Buffer.from(
    JSON.stringify({ ...user, issuedAt: Date.now() }),
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", requireEnv("AUTH_SECRET"))
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

/** Decode HTML entities that Next.js uses in attribute values */
function decodeHtml(str) {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;/g, "'");
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

async function getPage(path, cookie) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    redirect: "manual",
    headers: cookie
      ? { cookie: `studenthub_next_session=${cookie}` }
      : undefined,
  });
  const text = await response.text();
  return { status: response.status, text };
}

// ---------------------------------------------------------------------------
// Server action invocation
//
// Next.js 15 embeds server action references as hidden <input> fields inside
// forms that use useActionState / form action={...}. Each form contains:
//   $ACTION_REF_N     - action reference marker
//   $ACTION_N:0       - JSON with {"id":"<hash>","bound":"$@1"}
//   $ACTION_N:1       - JSON-encoded state value
//   $ACTION_KEY       - CSRF protection key
//
// To invoke a server action from an external script:
// 1. GET the page that hosts the form (with a valid session cookie)
// 2. Locate the correct <form> by its CSS class or field content
// 3. Extract all hidden <input> fields and their HTML-decoded values
// 4. POST to the same page path with those hidden fields + your form data
//    using multipart/form-data (matching the form's encType)
// ---------------------------------------------------------------------------

/**
 * Extract all hidden input fields from a form identified by className prefix.
 * Returns a Map of field name → decoded value.
 */
function extractActionRefs(html, className) {
  const formStart = html.indexOf(`class="${className}"`);
  if (formStart === -1) return null;
  const formEnd = html.indexOf("</form>", formStart);
  if (formEnd === -1) return null;
  const rawForm = html.substring(formStart, formEnd);

  const fields = new Map();

  // Match each self-closing <input ... /> tag, then extract name/value
  const inputRegex = /<input[^>]*\/>/g;
  let m;
  while ((m = inputRegex.exec(rawForm)) !== null) {
    const tag = m[0];
    if (!tag.includes('type="hidden"')) continue;
    const nameMatch = tag.match(/name="([^"]+)"/);
    const valueMatch = tag.match(/value="([^"]*)"/);
    if (nameMatch) {
      fields.set(nameMatch[1], valueMatch ? decodeHtml(valueMatch[1]) : "");
    }
  }

  // Must have at least the action reference marker
  for (const key of fields.keys()) {
    if (key.startsWith("$ACTION_REF_")) return fields;
  }

  return null;
}

/**
 * POST to a server action form, including all hidden action refs + extra fields.
 * The body is sent as multipart/form-data (browser-native FormData).
 */
async function postFormAction(path, fields, cookie) {
  const formData = new FormData();
  for (const [key, value] of fields) {
    formData.append(key, value);
  }
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    redirect: "manual",
    headers: { cookie: `studenthub_next_session=${cookie}` },
    body: formData,
  });
  const text = await response.text();
  return { status: response.status, text };
}

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function test(name, fn) {
  return fn()
    .then(() => {
      passed++;
      console.log(`PASS ${name}`);
    })
    .catch((err) => {
      failed++;
      console.error(`FAIL ${name}: ${err.message}`);
    });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function firstOrThrow(label, query) {
  const value = await query();
  if (!value) throw new Error(`Missing fixture data: ${label}`);
  return value;
}

// ---------------------------------------------------------------------------
// Test: Candidate profile update persistence
//
// 1. Find a candidate in the DB
// 2. Sign a candidate session cookie
// 3. GET /candidate/edit and extract the server action refs from the profile form
// 4. Record the current candidate_name
// 5. POST the update with a unique test name
// 6. Verify candidate_name changed in the DB
// 7. Restore the original name (cleanup)
// ---------------------------------------------------------------------------

async function candidateProfileUpdateTest() {
  const candidate = await firstOrThrow("candidate", () =>
    prisma.candidate.findFirst({
      where: { deleted: 0 },
      orderBy: { candidate_updated_at: "desc" },
      select: {
        candidate_id: true,
        candidate_name: true,
        candidate_email: true,
      },
    }),
  );

  const originalName = candidate.candidate_name;
  const testName = `WFTEST_${Date.now()}`;
  const candidateCookie = signSession({
    role: "candidate",
    id: String(candidate.candidate_id),
    name: candidate.candidate_name ?? "Candidate",
    email: candidate.candidate_email ?? "candidate@test.local",
  });

  // 1. Fetch the edit page
  const { status, text: pageHtml } = await getPage(
    "/candidate/edit",
    candidateCookie,
  );
  assert(status === 200, `Candidate edit page returned ${status}`);

  // 2. Extract server action refs from the profile update form
  //    (first form with class "candidateEditForm" is the profile form)
  const actionFields = extractActionRefs(pageHtml, "candidateEditForm");
  assert(actionFields, "Could not extract server action refs from candidate edit form");

  // 3. Add the profile fields to the action refs
  const formData = new Map(actionFields);
  formData.set("name", testName);
  formData.set("nameAr", "");
  formData.set("email", candidate.candidate_email ?? "");
  formData.set("phone", "");
  formData.set("objective", "");
  formData.set("intro", "");
  formData.set("civilId", "");
  formData.set("profileUrl", "");
  formData.set("countryId", "");
  formData.set("universityId", "");
  formData.set("bankId", "");
  formData.set("bankAccountName", "");
  formData.set("iban", "");
  formData.set("birthDate", "");
  formData.set("address", "");

  // 4. POST the update
  const { status: postStatus } = await postFormAction(
    "/candidate/edit",
    formData,
    candidateCookie,
  );
  // Server action redirects (303) on success; 200 means it rendered inline
  assert(
    postStatus === 303 || postStatus === 200,
    `Profile update POST returned ${postStatus} (expected 303 or 200)`,
  );

  // 5. Verify persistence in the database
  const updated = await prisma.candidate.findUniqueOrThrow({
    where: { candidate_id: candidate.candidate_id },
    select: { candidate_name: true },
  });
  assert(
    updated.candidate_name === testName,
    `Expected candidate_name "${testName}" but got "${updated.candidate_name}"`,
  );

  // 6. Restore original name (clean up test data)
  await prisma.candidate.update({
    where: { candidate_id: candidate.candidate_id },
    data: { candidate_name: originalName },
  });

  console.log(
    `  (name "${originalName}" → "${testName}" → "${originalName}" restored)`,
  );
}

// ---------------------------------------------------------------------------
// Regression: page load smoke tests
// ---------------------------------------------------------------------------

async function companyRequestsPageLoads() {
  const user = await firstOrThrow("company contact", () =>
    prisma.staff.findFirst({
      where: { deleted: 0, staff_roles: { some: { role: { role_key: "company" } } } },
      select: { staff_id: true, staff_name: true, staff_email: true },
    }),
  );

  const cookie = signSession({
    role: "company",
    id: String(user.staff_id),
    name: user.staff_name ?? "Company User",
    email: user.staff_email ?? "company@test.local",
  });

  const { status } = await getPage("/company/requests", cookie);
  assert(status === 200, `Company requests page returned ${status}`);
}

async function companyRequestCreatePageLoads() {
  const user = await firstOrThrow("company contact", () =>
    prisma.staff.findFirst({
      where: { deleted: 0, staff_roles: { some: { role: { role_key: "company" } } } },
      select: { staff_id: true, staff_name: true, staff_email: true },
    }),
  );

  const cookie = signSession({
    role: "company",
    id: String(user.staff_id),
    name: user.staff_name ?? "Company User",
    email: user.staff_email ?? "company@test.local",
  });

  const { status } = await getPage("/company/requests/create", cookie);
  assert(status === 200, `Company request create page returned ${status}`);
}

async function candidateEditPageLoads() {
  const candidate = await firstOrThrow("candidate", () =>
    prisma.candidate.findFirst({
      where: { deleted: 0 },
      select: { candidate_id: true, candidate_name: true, candidate_email: true },
    }),
  );

  const cookie = signSession({
    role: "candidate",
    id: String(candidate.candidate_id),
    name: candidate.candidate_name ?? "Candidate",
    email: candidate.candidate_email ?? "candidate@test.local",
  });

  const { status } = await getPage("/candidate/edit", cookie);
  assert(status === 200, `Candidate edit page returned ${status}`);
}

async function inspectorIdRequestsPageLoads() {
  const user = await firstOrThrow("inspector", () =>
    prisma.staff.findFirst({
      where: { deleted: 0, staff_roles: { some: { role: { role_key: "inspector" } } } },
      select: { staff_id: true, staff_name: true, staff_email: true },
    }),
  );

  const cookie = signSession({
    role: "inspector",
    id: String(user.staff_id),
    name: user.staff_name ?? "Inspector",
    email: user.staff_email ?? "inspector@test.local",
  });

  const { status } = await getPage("/inspector/id-requests", cookie);
  assert(status === 200, `Inspector ID requests page returned ${status}`);
}

async function publicGamesPageLoads() {
  const { status } = await getPage("/games", null);
  assert(status === 200, `Public games page returned ${status}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Workflow tests\n");

  await test(
    "Candidate profile update persists to database",
    candidateProfileUpdateTest,
  );

  console.log("\nRegression smoke tests\n");

  await test("Company requests list page loads", companyRequestsPageLoads);
  await test("Company request create page loads", companyRequestCreatePageLoads);
  await test("Candidate edit page loads", candidateEditPageLoads);
  await test("Inspector ID requests page loads", inspectorIdRequestsPageLoads);
  await test("Public games page loads", publicGamesPageLoads);

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
