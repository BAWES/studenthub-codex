"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

const companyRequestSchema = z.object({
  company_id: z.coerce.number().int().positive("Select a company"),
  position_title: z.string().trim().min(1, "Job title is required").max(255),
  compensation: z.string().trim().min(1, "Compensation type is required"),
  store: z.string().trim().min(1, "Store name is required"),
  brand: z.string().trim().min(1, "Brand name is required"),
  number_of_employees: z.coerce.number().int().min(1, "Must hire at least 1 employee"),
});

export type CompanyRequestFormState = {
  success: boolean;
  error?: string;
  errors?: Partial<Record<keyof z.infer<typeof companyRequestSchema>, string>>;
  requestUuid?: string;
};

export async function createCompanyRequest(
  _prev: CompanyRequestFormState,
  formData: FormData,
): Promise<CompanyRequestFormState> {
  const session = await requireRoleCapability("company", "request.create");

  const raw = Object.fromEntries(formData);
  const parsed = companyRequestSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: CompanyRequestFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof fieldErrors;
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { success: false, errors: fieldErrors };
  }

  const { company_id, position_title, compensation, store, brand, number_of_employees } = parsed.data;

  const company = await prisma.company.findUnique({
    where: { company_id, deleted: 0 },
    select: { company_id: true },
  });

  if (!company) {
    return { success: false, error: "Selected company not found." };
  }

  const contactUuid = session.id;
  const now = new Date();
  const requestUuid = `request_${crypto.randomUUID()}`;

  await prisma.request.create({
    data: {
      request_uuid: requestUuid,
      company_id,
      contact_uuid: contactUuid,
      request_position_title: position_title,
      request_compensation: compensation,
      request_number_of_employees: number_of_employees,
      request_location: store,
      request_job_description: `Brand: ${brand}`,
      request_status: "pending",
      request_created_by: 0,
      request_updated_by: 0,
      request_created_datetime: now,
      request_updated_datetime: now,
    },
  });

  revalidatePath("/company/requests");
  revalidatePath("/company/requests/create");

  return { success: true, requestUuid };
}
