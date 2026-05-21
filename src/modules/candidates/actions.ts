"use server";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCapability, requireRoleCapability } from "@/modules/auth/session";

// ---------------------------------------------------------------------------
// Profile edit
// ---------------------------------------------------------------------------

export async function updateCandidateProfile(_prevState: { error: string }, formData: FormData) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const name = formData.get("name");
  const nameAr = formData.get("nameAr");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const objective = formData.get("objective");
  const intro = formData.get("intro");
  const civilId = formData.get("civilId");
  const profileUrl = formData.get("profileUrl");
  const countryId = formData.get("countryId");
  const universityId = formData.get("universityId");
  const bankId = formData.get("bankId");
  const bankAccountName = formData.get("bankAccountName");
  const iban = formData.get("iban");
  const birthDate = formData.get("birthDate");
  const address = formData.get("address");

  if (typeof name !== "string" || !name.trim()) {
    return { error: "Name is required." };
  }

  const stringField = (value: unknown) =>
    typeof value === "string" ? value.trim() : undefined;

  const nullableStringField = (value: unknown) =>
    typeof value === "string" ? (value.trim() || undefined) : undefined;

  const nullableIntField = (value: unknown) => {
    if (typeof value !== "string" || !value) return undefined;
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : undefined;
  };

  await prisma.candidate.update({
    where: { candidate_id: candidateId },
    data: {
      candidate_name: name.trim(),
      candidate_name_ar: nullableStringField(nameAr),
      candidate_email: stringField(email),
      candidate_phone: nullableStringField(phone),
      candidate_objective: nullableStringField(objective),
      candidate_intro: nullableStringField(intro),
      candidate_civil_id: nullableStringField(civilId),
      profile_url: nullableStringField(profileUrl),
      candidate_address_line1: nullableStringField(address),
      country_id: nullableIntField(countryId),
      university_id: nullableIntField(universityId),
      bank_id: nullableIntField(bankId),
      bank_account_name: nullableStringField(bankAccountName),
      candidate_iban: nullableStringField(iban),
      candidate_birth_date:
        typeof birthDate === "string" && birthDate
          ? (() => { const d = new Date(birthDate); return isFinite(d.getTime()) ? d : undefined; })()
          : undefined,
    },
  });

  revalidatePath("/candidate");
  revalidatePath("/candidate/edit");
  redirect("/candidate");
}

// ---------------------------------------------------------------------------
// Document upload
// ---------------------------------------------------------------------------

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "candidates");

const ALLOWED_TYPES: Record<string, { mime: string[]; ext: string[]; maxSize: number }> = {
  photo: {
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSize: 5 * 1024 * 1024, // 5 MB
  },
  cv: {
    mime: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    ext: [".pdf", ".doc", ".docx"],
    maxSize: 10 * 1024 * 1024, // 10 MB
  },
  video: {
    mime: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
    ext: [".mp4", ".webm", ".ogv", ".mov"],
    maxSize: 50 * 1024 * 1024, // 50 MB
  },
  civilFront: {
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSize: 5 * 1024 * 1024,
  },
  civilBack: {
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSize: 5 * 1024 * 1024,
  },
};

async function saveUpload(candidateId: number, field: string, file: File, typeConfig: typeof ALLOWED_TYPES[string]): Promise<string> {
  const ext = path.extname(file.name).toLowerCase();
  if (!typeConfig.ext.includes(ext)) {
    throw new Error(`File type "${ext}" is not allowed for this document type.`);
  }

  if (file.size > typeConfig.maxSize) {
    throw new Error(`File is too large. Maximum size is ${typeConfig.maxSize / 1024 / 1024} MB.`);
  }

  const dir = path.join(UPLOAD_DIR, String(candidateId));
  await fs.mkdir(dir, { recursive: true });

  const filename = `${field}_${crypto.randomUUID()}${ext}`;
  const filepath = path.join(dir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);

  return `/uploads/candidates/${candidateId}/${filename}`;
}

export async function uploadDocument(_prevState: { error: string }, formData: FormData) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const allowed = ["photo", "cv", "video", "civilFront", "civilBack"];
  let type = "";
  let file: File | null = null;
  for (const t of allowed) {
    const f = formData.get(`file_${t}`);
    if (f instanceof File && f.size > 0) {
      type = t;
      file = f;
      break;
    }
  }

  if (!file || file.size === 0) {
    return { error: "Please select a file to upload." };
  }

  const typeConfig = ALLOWED_TYPES[type];
  if (file.type && !typeConfig.mime.includes(file.type)) {
    if (type === "cv") return { error: "Invalid file type for CV. Accepted: PDF, DOC, DOCX." };
    if (type === "video") return { error: "Invalid file type for video. Accepted: MP4, WebM, OGG, MOV." };
    return { error: `Invalid file type for ${type}. Accepted image formats.` };
  }

  if (file.size > typeConfig.maxSize) {
    return { error: `File is too large. Maximum size is ${typeConfig.maxSize / 1024 / 1024} MB.` };
  }

  try {
    const path_ = await saveUpload(candidateId, type, file, typeConfig);

    const fieldMap: Record<string, Record<string, unknown>> = {
      photo: { candidate_personal_photo: path_ },
      cv: { candidate_resume: path_ },
      video: { candidate_video: path_ },
      civilFront: { candidate_civil_photo_front: path_ },
      civilBack: { candidate_civil_photo_back: path_ },
    };

    await prisma.candidate.update({
      where: { candidate_id: candidateId },
      data: fieldMap[type],
    });

    revalidatePath("/candidate");
    revalidatePath("/candidate/edit");
    return { error: "" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed." };
  }
}

// ---------------------------------------------------------------------------
// Invitation accept / reject
// ---------------------------------------------------------------------------

const INVITATION_STATUS_ACCEPTED = 1;
const INVITATION_STATUS_REJECTED = 2;

export async function respondToInvitation(_prevState: { error: string }, formData: FormData) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const invitationUuid = String(formData.get("invitationUuid") ?? "");
  const action = String(formData.get("action") ?? ""); // "accept" | "reject"

  if (!invitationUuid) {
    return { error: "Missing invitation identifier." };
  }

  if (action !== "accept" && action !== "reject") {
    return { error: "Invalid action." };
  }

  const invitation = await prisma.invitation.findFirst({
    where: { invitation_uuid: invitationUuid, candidate_id: candidateId },
    select: { invitation_uuid: true },
  });

  if (!invitation) {
    return { error: "Invitation not found." };
  }

  const newStatus = action === "accept" ? INVITATION_STATUS_ACCEPTED : INVITATION_STATUS_REJECTED;

  await prisma.invitation.update({
    where: { invitation_uuid: invitationUuid },
    data: {
      invitation_status: newStatus,
      invitation_app_seen_at: new Date(),
      invitation_updated_at: new Date(),
    },
  });

  revalidatePath("/candidate/invitations");
  revalidatePath(`/candidate/invitations/${invitationUuid}`);
  redirect(`/candidate/invitations/${invitationUuid}`);
}

// ---------------------------------------------------------------------------
// Work-log appeal
// ---------------------------------------------------------------------------

export async function appealWorkLog(_prevState: { error: string }, formData: FormData) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const workLogUuid = String(formData.get("workLogUuid") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!workLogUuid) {
    return { error: "Missing work-log identifier." };
  }

  if (!reason) {
    return { error: "Please provide a reason for the appeal." };
  }

  const workLog = await prisma.candidate_working_hour.findFirst({
    where: { candidate_working_hour_uuid: workLogUuid, candidate_id: candidateId },
    select: { candidate_working_hour_uuid: true },
  });

  if (!workLog) {
    return { error: "Work log not found." };
  }

  const appealUuid = `appeal_${crypto.randomUUID()}`;
  const now = new Date();

  await prisma.$transaction([
    prisma.candidate_working_hour_appeal.create({
      data: {
        appeal_uuid: appealUuid,
        candidate_working_hour_uuid: workLogUuid,
        candidate_id: candidateId,
        reason,
        status: 0,
        created_at: now,
        updated_at: now,
      },
    }),
    prisma.candidate_working_hour.update({
      where: { candidate_working_hour_uuid: workLogUuid },
      data: { appeal_uuid: appealUuid },
    }),
  ]);

  revalidatePath("/candidate/work-logs");
  revalidatePath(`/candidate/work-logs/${workLogUuid}`);
  redirect(`/candidate/work-logs/${workLogUuid}`);
}

// ---------------------------------------------------------------------------
// Lookup helpers (not server actions — plain async functions for pages)
// ---------------------------------------------------------------------------

export async function getCountryOptions() {
  const rows = await prisma.country.findMany({
    orderBy: { country_name_en: "asc" },
    select: { country_id: true, country_name_en: true, country_nationality_name_en: true },
    take: 250,
  });
  return rows.map((r) => ({
    id: r.country_id,
    label: `${r.country_name_en}${r.country_nationality_name_en && r.country_nationality_name_en !== r.country_name_en ? ` (${r.country_nationality_name_en})` : ""}`,
  }));
}

export async function getUniversityOptions() {
  const rows = await prisma.university.findMany({
    where: { deleted: 0 },
    orderBy: { university_name_en: "asc" },
    select: { university_id: true, university_name_en: true },
    take: 250,
  });
  return rows.map((r) => ({
    id: r.university_id,
    label: r.university_name_en ?? `University #${r.university_id}`,
  }));
}

export async function getBankOptions() {
  const rows = await prisma.bank.findMany({
    where: { deleted: 0 },
    orderBy: { bank_name: "asc" },
    select: { bank_id: true, bank_name: true },
    take: 100,
  });
  return rows.map((r) => ({
    id: r.bank_id,
    label: r.bank_name ?? `Bank #${r.bank_id}`,
  }));
}

// ---------------------------------------------------------------------------
// Skills CRUD
// ---------------------------------------------------------------------------

export async function addCandidateSkill(_prevState: { error: string }, formData: FormData) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const skill = String(formData.get("skill") ?? "").trim();
  if (!skill) return { error: "Skill name is required." };

  await prisma.candidate_skill.create({
    data: {
      candidate_id: candidateId,
      skill,
      candidate_skill_created_at: new Date(),
      deleted: 0,
    },
  });

  revalidatePath("/candidate");
  revalidatePath("/candidate/edit");
  return { error: "" };
}

export async function removeCandidateSkill(_prevState: { error: string }, formData: FormData) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const skillId = Number(formData.get("skillId"));
  if (!Number.isInteger(skillId) || skillId <= 0) return { error: "Invalid skill identifier." };

  const row = await prisma.candidate_skill.findFirst({
    where: { candidate_skill_id: skillId, candidate_id: candidateId, deleted: 0 },
    select: { candidate_skill_id: true },
  });

  if (!row) return { error: "Skill not found." };

  await prisma.candidate_skill.update({
    where: { candidate_skill_id: skillId },
    data: { deleted: 1 },
  });

  revalidatePath("/candidate");
  revalidatePath("/candidate/edit");
  return { error: "" };
}

// ---------------------------------------------------------------------------
// Work experience CRUD
// ---------------------------------------------------------------------------

export async function addCandidateExperience(_prevState: { error: string }, formData: FormData) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const experience = String(formData.get("experience") ?? "").trim();
  const employer = String(formData.get("employer") ?? "").trim();
  const startYearStr = String(formData.get("startYear") ?? "").trim();
  const endYearStr = String(formData.get("endYear") ?? "").trim();
  const startYear = startYearStr ? parseInt(startYearStr, 10) : NaN;
  const endYear = endYearStr ? parseInt(endYearStr, 10) : NaN;

  if (!experience) return { error: "Job title / experience is required." };

  await prisma.candidate_experience.create({
    data: {
      candidate_id: candidateId,
      experience,
      employer: employer || undefined,
      start_year: Number.isFinite(startYear) ? startYear : undefined,
      end_year: Number.isFinite(endYear) ? endYear : undefined,
      candidate_experience_created_at: new Date(),
      deleted: 0,
    },
  });

  revalidatePath("/candidate");
  revalidatePath("/candidate/edit");
  return { error: "" };
}

export async function removeCandidateExperience(_prevState: { error: string }, formData: FormData) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const candidateId = Number(session.id);

  const experienceId = Number(formData.get("experienceId"));
  if (!Number.isInteger(experienceId) || experienceId <= 0) return { error: "Invalid experience identifier." };

  const row = await prisma.candidate_experience.findFirst({
    where: { candidate_experience_id: experienceId, candidate_id: candidateId, deleted: 0 },
    select: { candidate_experience_id: true },
  });

  if (!row) return { error: "Experience record not found." };

  await prisma.candidate_experience.update({
    where: { candidate_experience_id: experienceId },
    data: { deleted: 1 },
  });

  revalidatePath("/candidate");
  revalidatePath("/candidate/edit");
  return { error: "" };
}

// ---------------------------------------------------------------------------
// Staff-side candidate management
// ---------------------------------------------------------------------------

async function ensureStaffCandidateAccess(session: { role: string; id: string }, candidateId: number) {
  if (session.role === "admin") return;
  const staffId = Number(session.id);
  const row = await prisma.candidate_work_history.findFirst({
    where: { candidate_id: candidateId, staff_id: staffId, deleted: false },
    select: { id: true },
  });
  if (!row) throw new Error("Access denied.");
}

function staffBasePath(role: string) {
  return role === "admin" ? "/admin/candidates" : "/staff/candidates";
}

// -- Notes ---------------------------------------------------------------

export async function addStaffCandidateNote(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("candidate.search");
  const candidateId = Number(formData.get("candidateId"));
  const noteText = String(formData.get("noteText") ?? "").trim();
  const noteType = String(formData.get("noteType") ?? "Internal Note").trim();

  if (!Number.isInteger(candidateId) || candidateId <= 0) return { error: "Invalid candidate." };
  if (!noteText) return { error: "Note text is required." };

  try { await ensureStaffCandidateAccess(session, candidateId); } catch { return { error: "Access denied." }; }

  const staffId = Number(session.id);
  const now = new Date();
  await prisma.note.create({
    data: {
      note_uuid: `note_${crypto.randomUUID()}`,
      candidate_id: candidateId,
      note_type: noteType,
      note_text: noteText,
      created_by: staffId,
      updated_by: staffId,
      note_created_datetime: now,
      note_updated_datetime: now,
    },
  });

  const base = staffBasePath(session.role);
  revalidatePath(`${base}/${candidateId}`);
  revalidatePath(base);
  return { error: "" };
}

export async function editStaffCandidateNote(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("candidate.search");
  const noteUuid = String(formData.get("noteUuid") ?? "");
  const noteText = String(formData.get("noteText") ?? "").trim();

  if (!noteUuid) return { error: "Missing note identifier." };
  if (!noteText) return { error: "Note text is required." };

  const note = await prisma.note.findUnique({
    where: { note_uuid: noteUuid },
    select: { note_uuid: true, candidate_id: true },
  });
  if (!note || !note.candidate_id) return { error: "Note not found." };

  try { await ensureStaffCandidateAccess(session, note.candidate_id); } catch { return { error: "Access denied." }; }

  await prisma.note.update({
    where: { note_uuid: noteUuid },
    data: {
      note_text: noteText,
      updated_by: Number(session.id),
      note_updated_datetime: new Date(),
    },
  });

  const base = staffBasePath(session.role);
  revalidatePath(`${base}/${note.candidate_id}`);
  revalidatePath(base);
  return { error: "" };
}

// -- Tags ----------------------------------------------------------------

export async function addStaffCandidateTag(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("candidate.search");
  const candidateId = Number(formData.get("candidateId"));
  const tag = String(formData.get("tag") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!Number.isInteger(candidateId) || candidateId <= 0) return { error: "Invalid candidate." };
  if (!tag) return { error: "Tag is required." };

  try { await ensureStaffCandidateAccess(session, candidateId); } catch { return { error: "Access denied." }; }

  const now = new Date();
  const staffId = Number(session.id);
  await prisma.candidate_tag.create({
    data: {
      candidate_id: candidateId,
      tag,
      reason: reason || undefined,
      created_by: staffId,
      created_at: now,
      updated_at: now,
      deleted: 0,
    },
  });

  const base = staffBasePath(session.role);
  revalidatePath(`${base}/${candidateId}`);
  revalidatePath(base);
  return { error: "" };
}

export async function removeStaffCandidateTag(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("candidate.search");
  const tagId = Number(formData.get("tagId"));

  if (!Number.isInteger(tagId) || tagId <= 0) return { error: "Invalid tag identifier." };

  const tag = await prisma.candidate_tag.findFirst({
    where: { tag_id: tagId, deleted: 0 },
    select: { tag_id: true, candidate_id: true },
  });
  if (!tag || !tag.candidate_id) return { error: "Tag not found." };

  try { await ensureStaffCandidateAccess(session, tag.candidate_id); } catch { return { error: "Access denied." }; }

  await prisma.candidate_tag.update({
    where: { tag_id: tagId },
    data: { deleted: 1, updated_at: new Date() },
  });

  const base = staffBasePath(session.role);
  revalidatePath(`${base}/${tag.candidate_id}`);
  revalidatePath(base);
  return { error: "" };
}

// -- Warnings ------------------------------------------------------------

export async function addStaffCandidateWarning(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("candidate.search");
  const candidateId = Number(formData.get("candidateId"));
  const title = String(formData.get("title") ?? "Not appearing for interview").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!Number.isInteger(candidateId) || candidateId <= 0) return { error: "Invalid candidate." };
  if (!message) return { error: "Warning message is required." };

  try { await ensureStaffCandidateAccess(session, candidateId); } catch { return { error: "Access denied." }; }

  const staffId = Number(session.id);
  const now = new Date();
  await prisma.candidate_warning.create({
    data: {
      candidate_id: candidateId,
      title: title || "Not appearing for interview",
      message,
      created_by: staffId,
      updated_by: staffId,
      created_at: now,
      updated_at: now,
    },
  });

  const base = staffBasePath(session.role);
  revalidatePath(`${base}/${candidateId}`);
  revalidatePath(base);
  return { error: "" };
}

export async function removeStaffCandidateWarning(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("candidate.search");
  const warningId = Number(formData.get("warningId"));

  if (!Number.isInteger(warningId) || warningId <= 0) return { error: "Invalid warning identifier." };

  const warning = await prisma.candidate_warning.findUnique({
    where: { warning_id: warningId },
    select: { warning_id: true, candidate_id: true },
  });
  if (!warning || !warning.candidate_id) return { error: "Warning not found." };

  try { await ensureStaffCandidateAccess(session, warning.candidate_id); } catch { return { error: "Access denied." }; }

  await prisma.candidate_warning.delete({ where: { warning_id: warningId } });

  const base = staffBasePath(session.role);
  revalidatePath(`${base}/${warning.candidate_id}`);
  revalidatePath(base);
  return { error: "" };
}

// -- Skills (staff-side) ------------------------------------------------

export async function addStaffCandidateSkill(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("candidate.search");
  const candidateId = Number(formData.get("candidateId"));
  const skill = String(formData.get("skill") ?? "").trim();

  if (!Number.isInteger(candidateId) || candidateId <= 0) return { error: "Invalid candidate." };
  if (!skill) return { error: "Skill name is required." };

  try { await ensureStaffCandidateAccess(session, candidateId); } catch { return { error: "Access denied." }; }

  await prisma.candidate_skill.create({
    data: {
      candidate_id: candidateId,
      skill,
      candidate_skill_created_at: new Date(),
      deleted: 0,
    },
  });

  const base = staffBasePath(session.role);
  revalidatePath(`${base}/${candidateId}`);
  revalidatePath(base);
  return { error: "" };
}

export async function removeStaffCandidateSkill(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("candidate.search");
  const skillId = Number(formData.get("skillId"));

  if (!Number.isInteger(skillId) || skillId <= 0) return { error: "Invalid skill identifier." };

  const row = await prisma.candidate_skill.findFirst({
    where: { candidate_skill_id: skillId, deleted: 0 },
    select: { candidate_skill_id: true, candidate_id: true },
  });
  if (!row || !row.candidate_id) return { error: "Skill not found." };

  try { await ensureStaffCandidateAccess(session, row.candidate_id); } catch { return { error: "Access denied." }; }

  await prisma.candidate_skill.update({
    where: { candidate_skill_id: skillId },
    data: { deleted: 1 },
  });

  const base = staffBasePath(session.role);
  revalidatePath(`${base}/${row.candidate_id}`);
  revalidatePath(base);
  return { error: "" };
}

// -- Status mutations ---------------------------------------------------

export async function setCandidateApproval(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("candidate.search");
  const candidateId = Number(formData.get("candidateId"));
  const approved = Number(formData.get("approved"));

  if (!Number.isInteger(candidateId) || candidateId <= 0) return { error: "Invalid candidate." };
  if (approved !== 0 && approved !== 1) return { error: "Approval value must be 0 or 1." };

  try { await ensureStaffCandidateAccess(session, candidateId); } catch { return { error: "Access denied." }; }

  await prisma.candidate.update({
    where: { candidate_id: candidateId },
    data: { approved, candidate_updated_at: new Date() },
  });

  const base = staffBasePath(session.role);
  revalidatePath(`${base}/${candidateId}`);
  revalidatePath(base);
  return { error: "" };
}

export async function setCandidateProfileComplete(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("candidate.search");
  const candidateId = Number(formData.get("candidateId"));

  if (!Number.isInteger(candidateId) || candidateId <= 0) return { error: "Invalid candidate." };

  try { await ensureStaffCandidateAccess(session, candidateId); } catch { return { error: "Access denied." }; }

  const candidate = await prisma.candidate.findFirst({
    where: { candidate_id: candidateId, deleted: 0 },
    select: { is_incomplete_profile: true },
  });
  if (!candidate) return { error: "Candidate not found." };

  await prisma.candidate.update({
    where: { candidate_id: candidateId },
    data: { is_incomplete_profile: !candidate.is_incomplete_profile, candidate_updated_at: new Date() },
  });

  const base = staffBasePath(session.role);
  revalidatePath(`${base}/${candidateId}`);
  revalidatePath(base);
  return { error: "" };
}

export async function clearCandidateCivilVerification(_prevState: { error: string }, formData: FormData) {
  const session = await requireCapability("candidate.search");
  const candidateId = Number(formData.get("candidateId"));

  if (!Number.isInteger(candidateId) || candidateId <= 0) return { error: "Invalid candidate." };

  try { await ensureStaffCandidateAccess(session, candidateId); } catch { return { error: "Access denied." }; }

  await prisma.candidate.update({
    where: { candidate_id: candidateId },
    data: { candidate_civil_need_verification: false, candidate_updated_at: new Date() },
  });

  const base = staffBasePath(session.role);
  revalidatePath(`${base}/${candidateId}`);
  revalidatePath(base);
  return { error: "" };
}
