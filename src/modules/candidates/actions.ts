"use server";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

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
    return Number.isFinite(n) ? n : undefined;
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
        typeof birthDate === "string" && birthDate ? new Date(birthDate) : undefined,
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

  const type = String(formData.get("type") ?? "");
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please select a file to upload." };
  }

  const allowed = ["photo", "cv", "video", "civilFront", "civilBack"];
  if (!allowed.includes(type)) {
    return { error: "Invalid document type." };
  }

  const typeConfig = ALLOWED_TYPES[type];
  if (type === "cv" && file.type && !typeConfig.mime.includes(file.type)) {
    return { error: `Invalid file type for CV. Accepted: PDF, DOC, DOCX.` };
  }
  if (type !== "cv" && type !== "video" && file.type && !typeConfig.mime.includes(file.type)) {
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
  const startYear = Number(formData.get("startYear"));
  const endYear = Number(formData.get("endYear"));

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
