"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Route } from "next";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

const createCompanyRequestSchema = z.object({
  company_id: z.coerce.number().int().positive("Select a company."),
  position_title: z.string().min(1, "Job title is required.").max(255),
  compensation: z.string().min(1, "Compensation is required.").max(255),
  store: z.string().min(1, "Store name is required.").max(128),
  brand: z.string().min(1, "Brand name is required.").max(128),
  vacancy_count: z.coerce.number().int().positive("Vacancy count must be at least 1.").max(9999),
  job_description: z.string().max(5000).optional(),
  location: z.string().max(255).optional(),
  skills: z.string().max(1000).optional(),
});

export type CreateCompanyRequestState = {
  error?: string;
  values?: Record<string, string>;
};

export async function createCompanyRequestAction(
  _prevState: CreateCompanyRequestState,
  formData: FormData,
): Promise<CreateCompanyRequestState> {
  const session = await requireRoleCapability("company", "request.create");

  const raw = {
    company_id: formData.get("company_id"),
    position_title: formData.get("position_title"),
    compensation: formData.get("compensation"),
    store: formData.get("store"),
    brand: formData.get("brand"),
    vacancy_count: formData.get("vacancy_count"),
    job_description: formData.get("job_description"),
    location: formData.get("location"),
    skills: formData.get("skills"),
  };

  const parsed = createCompanyRequestSchema.safeParse(raw);

  if (!parsed.success) {
    const kept: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (value !== null && value !== "" && key !== "company_id") {
        kept[key] = String(value);
      }
    }
    return {
      error: parsed.error.errors[0]?.message ?? "Validation failed.",
      values: kept,
    };
  }

  const { company_id, position_title, compensation, store, brand, vacancy_count, job_description, location, skills } =
    parsed.data;

  const link = await prisma.company_contact.findFirst({
    where: { contact_uuid: session.id, company_id, allow_access: true },
    select: { company_id: true },
  });

  if (!link) {
    return { error: "You do not have access to this company.", values: { position_title, compensation, store, brand } };
  }

  const requestUuid = `request_${crypto.randomUUID()}`;
  const now = new Date();

  const tagSkills = [store, brand];
  const extraSkills = skills
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
  const allSkills = [...tagSkills, ...(extraSkills ?? [])];

  await prisma.$transaction([
    prisma.request.create({
      data: {
        request_uuid: requestUuid,
        company_id,
        contact_uuid: session.id,
        request_position_title: position_title,
        request_compensation: compensation,
        request_number_of_employees: vacancy_count,
        request_job_description: job_description || "No description provided.",
        request_location: location ?? null,
        request_status: "pending",
        request_created_datetime: now,
        request_updated_datetime: now,
      },
    }),
    ...allSkills.map((skill) =>
      prisma.request_skill.create({
        data: { request_uuid: requestUuid, skill },
      }),
    ),
  ]);

  revalidatePath("/company/requests");
  redirect(`/company/requests/${requestUuid}?notice=request-created` as Route);
}
