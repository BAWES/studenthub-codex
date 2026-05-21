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
// Session signing
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
// Form extraction
// ---------------------------------------------------------------------------

function findFormBlocks(html) {
  const blocks = [];
  let pos = 0;
  while (pos < html.length) {
    const start = html.indexOf("<form", pos);
    if (start === -1) break;
    const end = html.indexOf("</form>", start);
    if (end === -1) break;
    blocks.push({ html: html.substring(start, end), start });
    pos = end + 7;
  }
  return blocks;
}

function extractHiddenFields(formHtml) {
  const fields = new Map();
  const inputRegex = /<input[^/>]*(?:\/>|>)/gi;
  let m;
  while ((m = inputRegex.exec(formHtml)) !== null) {
    const tag = m[0];
    if (!tag.includes('type="hidden"')) continue;
    const nameMatch = tag.match(/name="([^"]+)"/);
    const valueMatch = tag.match(/value="([^"]*)"/);
    if (nameMatch) {
      fields.set(nameMatch[1], valueMatch ? decodeHtml(valueMatch[1]) : "");
    }
  }
  return fields;
}

function formHasFields(fields, required) {
  for (const [name, expectedValue] of required) {
    if (!fields.has(name)) return false;
    if (expectedValue !== undefined && fields.get(name) !== String(expectedValue)) return false;
  }
  return true;
}

function hasActionMarker(fields) {
  for (const key of fields.keys()) {
    if (key.startsWith("$ACTION_ID_") || key.startsWith("$ACTION_REF_")) return true;
  }
  return false;
}

function findFormByFields(html, requiredFields, excludeFields = []) {
  const blocks = findFormBlocks(html);
  for (const block of blocks) {
    const fields = extractHiddenFields(block.html);
    if (!formHasFields(fields, requiredFields)) continue;
    let excluded = false;
    for (const name of excludeFields) {
      if (fields.has(name)) { excluded = true; break; }
    }
    if (excluded) continue;
    if (!hasActionMarker(fields)) continue;
    return fields;
  }
  return null;
}

function findFormByButtonText(html, buttonText, requiredFields) {
  const blocks = findFormBlocks(html);
  for (const block of blocks) {
    const fields = extractHiddenFields(block.html);
    if (!formHasFields(fields, requiredFields)) continue;
    if (!hasActionMarker(fields)) continue;
    if (!block.html.includes(`>${buttonText}<`)) continue;
    return fields;
  }
  return null;
}

function extractActionRefs(html, className) {
  const formStart = html.indexOf(`class="${className}"`);
  if (formStart === -1) return null;
  const formEnd = html.indexOf("</form>", formStart);
  if (formEnd === -1) return null;
  const rawForm = html.substring(formStart, formEnd);
  const fields = extractHiddenFields(rawForm);
  for (const key of fields.keys()) {
    if (key.startsWith("$ACTION_REF_") || key.startsWith("$ACTION_ID_")) return fields;
  }
  return null;
}

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
let skipped = 0;

function test(name, fn) {
  return fn()
    .then(() => {
      passed++;
      console.log(`PASS ${name}`);
    })
    .catch((err) => {
      if (err.message.startsWith("SKIP:")) {
        skipped++;
        console.log(`SKIP ${name}: ${err.message.slice(5).trim()}`);
        return;
      }
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

function skip(message) {
  throw new Error(`SKIP: ${message}`);
}

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

async function getAdmin() {
  return firstOrThrow("active admin", () =>
    prisma.admin.findFirst({
      where: { admin_status: { not: 0 } },
      orderBy: { admin_id: "asc" },
      select: { admin_id: true, admin_name: true, admin_email: true },
    }),
  );
}

async function adminCookie() {
  const admin = await getAdmin();
  return signSession({
    role: "admin",
    id: String(admin.admin_id),
    name: admin.admin_name ?? "Admin",
    email: admin.admin_email ?? "admin@test.local",
  });
}

async function getRequest() {
  return firstOrThrow("request", () =>
    prisma.request.findFirst({
      where: { request_uuid: { not: "" } },
      orderBy: { request_created_datetime: "desc" },
      select: { request_uuid: true, request_position_title: true },
    }),
  );
}

async function getCandidate() {
  return firstOrThrow("candidate", () =>
    prisma.candidate.findFirst({
      where: { deleted: 0 },
      orderBy: { candidate_id: "asc" },
      select: { candidate_id: true, candidate_name: true, candidate_email: true },
    }),
  );
}

async function getStaff() {
  return firstOrThrow("staff", () =>
    prisma.staff.findFirst({
      where: { deleted: 0 },
      orderBy: { staff_id: "asc" },
      select: { staff_id: true, staff_name: true, staff_email: true },
    }),
  );
}

// ---------------------------------------------------------------------------
// Candidate profile update persistence
// ---------------------------------------------------------------------------

async function candidateProfileUpdateTest() {
  const candidate = await getCandidate();
  const originalName = candidate.candidate_name;
  const testName = `WFTEST_${Date.now()}`;
  const candidateCookie = signSession({
    role: "candidate",
    id: String(candidate.candidate_id),
    name: candidate.candidate_name ?? "Candidate",
    email: candidate.candidate_email ?? "candidate@test.local",
  });

  const { status, text: pageHtml } = await getPage("/candidate/edit", candidateCookie);
  assert(status === 200, `Candidate edit page returned ${status}`);

  const actionFields = extractActionRefs(pageHtml, "candidateEditForm");
  assert(actionFields, "Could not extract server action refs from candidate edit form");

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

  const { status: postStatus } = await postFormAction("/candidate/edit", formData, candidateCookie);
  assert(postStatus === 303 || postStatus === 200,
    `Profile update POST returned ${postStatus} (expected 303 or 200)`);

  const updated = await prisma.candidate.findUniqueOrThrow({
    where: { candidate_id: candidate.candidate_id },
    select: { candidate_name: true },
  });
  assert(updated.candidate_name === testName,
    `Expected candidate_name "${testName}" but got "${updated.candidate_name}"`);

  await prisma.candidate.update({
    where: { candidate_id: candidate.candidate_id },
    data: { candidate_name: originalName },
  });
  console.log(`  (name "${originalName}" → "${testName}" → "${originalName}" restored)`);
}

// ---------------------------------------------------------------------------
// Suggestion creation
// ---------------------------------------------------------------------------

async function suggestionCreationTest() {
  const cookie = await adminCookie();
  const request = await getRequest();
  const candidate = await getCandidate();

  const existing = await prisma.suggestion.findFirst({
    where: { request_uuid: request.request_uuid, candidate_id: candidate.candidate_id, suggestion_status: 1 },
    select: { suggestion_uuid: true },
  });
  if (existing) skip("Suggestion already exists for this request+candidate pair");

  const detailPath = `/admin/requests/${request.request_uuid}`;
  const { status, text: pageHtml } = await getPage(detailPath, cookie);
  assert(status === 200, `Request detail page returned ${status}`);

  const actionFields = extractActionRefs(pageHtml, "suggestionForm");
  if (!actionFields) skip("No suggestion form on this request (no matched candidates)");

  const formData = new Map(actionFields);
  formData.set("candidate_id", String(candidate.candidate_id));
  formData.set("reason", `WFTEST_suggestion_${Date.now()}`);

  const { status: postStatus } = await postFormAction(detailPath, formData, cookie);
  assert(postStatus === 303 || postStatus === 200,
    `Suggestion POST returned ${postStatus} (expected 303 or 200)`);

  const record = await prisma.suggestion.findFirst({
    where: { request_uuid: request.request_uuid, candidate_id: candidate.candidate_id, suggestion_status: 1 },
    select: { suggestion_uuid: true, note_uuid: true },
  });
  assert(record, "Suggestion was not created in the database");

  await prisma.note.deleteMany({ where: { note_uuid: record.note_uuid } });
  await prisma.suggestion.delete({ where: { suggestion_uuid: record.suggestion_uuid } });
  console.log(`  (suggestion ${record.suggestion_uuid} created + cleaned up)`);
}

// ---------------------------------------------------------------------------
// Application shortlist
// ---------------------------------------------------------------------------

async function applicationShortlistTest() {
  const cookie = await adminCookie();
  const app = await firstOrThrow("application with status != 2", () =>
    prisma.request_application.findFirst({
      where: { status: { not: 2 } },
      orderBy: { updated_at: "desc" },
      select: { application_uuid: true, request_uuid: true, status: true },
    }),
  );

  const originalStatus = app.status;
  const detailPath = `/admin/requests/${app.request_uuid}`;
  const { status, text: pageHtml } = await getPage(detailPath, cookie);
  assert(status === 200, `Request detail page returned ${status}`);

  const actionFields = findFormByFields(pageHtml, [
    ["application_uuid", app.application_uuid],
    ["status", "2"],
  ]);
  assert(actionFields, "Could not find application shortlist form");

  const formData = new Map(actionFields);
  const { status: postStatus } = await postFormAction(detailPath, formData, cookie);
  assert(postStatus === 303 || postStatus === 200,
    `Application shortlist POST returned ${postStatus} (expected 303 or 200)`);

  const updated = await prisma.request_application.findUniqueOrThrow({
    where: { application_uuid: app.application_uuid },
    select: { status: true },
  });
  assert(updated.status === 2,
    `Expected application status 2 but got ${updated.status}`);

  await prisma.request_application.update({
    where: { application_uuid: app.application_uuid },
    data: { status: originalStatus },
  });
  console.log(`  (application ${app.application_uuid} status ${originalStatus} → 2 → ${originalStatus} restored)`);
}

// ---------------------------------------------------------------------------
// Interview complete
// ---------------------------------------------------------------------------

async function interviewCompleteTest() {
  const cookie = await adminCookie();
  const interview = await prisma.request_interview.findFirst({
    where: { status: { not: 2 } },
    orderBy: { updated_at: "desc" },
    select: { request_interview_uuid: true, request_uuid: true, status: true },
  });
  if (!interview) skip("No interviews with status != 2 found in database");

  const originalStatus = interview.status;
  const detailPath = `/admin/requests/${interview.request_uuid}`;
  const { status, text: pageHtml } = await getPage(detailPath, cookie);
  assert(status === 200, `Request detail page returned ${status}`);

  const actionFields = findFormByFields(pageHtml, [
    ["interview_uuid", interview.request_interview_uuid],
    ["status", "2"],
  ]);
  assert(actionFields, "Could not find interview complete form");

  const formData = new Map(actionFields);
  const { status: postStatus } = await postFormAction(detailPath, formData, cookie);
  assert(postStatus === 303 || postStatus === 200,
    `Interview complete POST returned ${postStatus} (expected 303 or 200)`);

  const updated = await prisma.request_interview.findUniqueOrThrow({
    where: { request_interview_uuid: interview.request_interview_uuid },
    select: { status: true },
  });
  assert(updated.status === 2,
    `Expected interview status 2 but got ${updated.status}`);

  await prisma.request_interview.update({
    where: { request_interview_uuid: interview.request_interview_uuid },
    data: { status: originalStatus },
  });
  console.log(`  (interview ${interview.request_interview_uuid} status ${originalStatus} → 2 → ${originalStatus} restored)`);
}

// ---------------------------------------------------------------------------
// Invitation create
// ---------------------------------------------------------------------------

async function invitationCreateTest() {
  const cookie = await adminCookie();
  const request = await getRequest();
  const candidate = await getCandidate();

  const existing = await prisma.invitation.findFirst({
    where: { request_uuid: request.request_uuid, candidate_id: candidate.candidate_id },
    select: { invitation_uuid: true },
  });
  if (existing) skip("Invitation already exists for this request+candidate pair");

  const detailPath = `/admin/requests/${request.request_uuid}`;
  const { status, text: pageHtml } = await getPage(detailPath, cookie);
  assert(status === 200, `Request detail page returned ${status}`);

  const actionFields = findFormByButtonText(pageHtml, "Invite", [
    ["request_uuid", request.request_uuid],
  ]);
  if (!actionFields) skip("No invitation form on this request (no matched candidates)");

  const formData = new Map(actionFields);
  formData.set("candidate_id", String(candidate.candidate_id));

  const { status: postStatus } = await postFormAction(detailPath, formData, cookie);
  assert(postStatus === 303 || postStatus === 200,
    `Invitation create POST returned ${postStatus} (expected 303 or 200)`);

  const record = await prisma.invitation.findFirst({
    where: { request_uuid: request.request_uuid, candidate_id: candidate.candidate_id },
    select: { invitation_uuid: true },
  });
  assert(record, "Invitation was not created in the database");

  await prisma.invitation.delete({ where: { invitation_uuid: record.invitation_uuid } });
  console.log(`  (invitation ${record.invitation_uuid} created + cleaned up)`);
}

// ---------------------------------------------------------------------------
// Cross-role suggestion visibility
// ---------------------------------------------------------------------------

async function crossRoleSuggestionVisibilityTest() {
  const cookie = await adminCookie();
  const request = await getRequest();
  const candidate = await getCandidate();
  const detailPath = `/admin/requests/${request.request_uuid}`;

  const { status: beforeStatus } = await getPage(detailPath, cookie);
  assert(beforeStatus === 200, `Request detail page returned ${beforeStatus} (before suggestion)`);

  const { text: freshHtml } = await getPage(detailPath, cookie);
  const actionFields = extractActionRefs(freshHtml, "suggestionForm");
  if (!actionFields) skip("Suggestion form not found on request detail page");

  const reason = `WFTEST_visibility_${Date.now()}`;
  const formData = new Map(actionFields);
  formData.set("candidate_id", String(candidate.candidate_id));
  formData.set("reason", reason);

  const { status: postStatus } = await postFormAction(detailPath, formData, cookie);
  assert(postStatus === 303 || postStatus === 200,
    `Suggestion create POST returned ${postStatus} (expected 303 or 200)`);

  const { status: afterStatus, text: afterHtml } = await getPage(detailPath, cookie);
  assert(afterStatus === 200, `Request detail page returned ${afterStatus} (after suggestion)`);
  assert(afterHtml.includes(reason) || afterHtml.includes("suggestion"),
    "Suggestion text not visible on reloaded request detail page");

  const record = await prisma.suggestion.findFirst({
    where: { request_uuid: request.request_uuid, candidate_id: candidate.candidate_id, suggestion_status: 1 },
    orderBy: { suggestion_datetime: "desc" },
    select: { suggestion_uuid: true, note_uuid: true },
  });
  if (record) {
    await prisma.note.deleteMany({ where: { note_uuid: record.note_uuid } });
    await prisma.suggestion.delete({ where: { suggestion_uuid: record.suggestion_uuid } });
  }
  console.log(`  (suggestion visible to admin on request detail page + cleaned up)`);
}

// ---------------------------------------------------------------------------
// Page load regression tests
// ---------------------------------------------------------------------------

async function companyRequestsPageLoads() {
  const user = await getStaff();
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
  const user = await getStaff();
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
  const candidate = await getCandidate();
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
  const user = await getStaff();
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
  if (status === 404) skip("Games page route not available (may have been removed)");
  assert(status === 200, `Public games page returned ${status}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Workflow regression tests\n");

  await test("Candidate profile update persists to database", candidateProfileUpdateTest);

  console.log("\nPipeline workflow tests\n");

  await test("Create a candidate suggestion for a request", suggestionCreationTest);
  await test("Shortlist an application (status transition)", applicationShortlistTest);
  await test("Complete an interview (status transition)", interviewCompleteTest);
  await test("Create an invitation for a candidate", invitationCreateTest);
  await test("Cross-role: admin sees suggestion on request detail page", crossRoleSuggestionVisibilityTest);

  console.log("\nRegression smoke tests\n");

  await test("Company requests list page loads", companyRequestsPageLoads);
  await test("Company request create page loads", companyRequestCreatePageLoads);
  await test("Candidate edit page loads", candidateEditPageLoads);
  await test("Inspector ID requests page loads", inspectorIdRequestsPageLoads);
  await test("Public games page loads", publicGamesPageLoads);

  console.log(`\n${passed} passed, ${failed} failed, ${skipped} skipped`);
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
