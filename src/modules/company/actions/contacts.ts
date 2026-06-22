"use server";

import { z } from "zod";
import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";
import { companyActionResultSchema } from "../schemas";

const addContactSchema = z.object({
  companyId: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive("Company is required")),
  name: z.string().min(1, "Contact name is required").max(255),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  position: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  allowAccess: z.string().optional(),
});

export async function addCompanyContact(_prevState: { error: string }, formData: FormData) {
  await requireRoleCapability("company", "company.write.linked");

  const parsed = addContactSchema.safeParse({
    companyId: formData.get("companyId"),
    name: formData.get("name"),
    email: formData.get("email"),
    position: formData.get("position"),
    phone: formData.get("phone"),
    allowAccess: formData.get("allowAccess"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let contactUuid: string;
  if (parsed.data.email) {
    const existing = await prisma.contact.findUnique({
      where: { contact_email: parsed.data.email },
      select: { contact_uuid: true },
    });
    if (existing) {
      contactUuid = existing.contact_uuid;
    } else {
      contactUuid = crypto.randomUUID();
      await prisma.contact.create({
        data: {
          contact_uuid: contactUuid,
          contact_name: parsed.data.name,
          contact_email: parsed.data.email,
          contact_created_at: new Date(),
          contact_updated_at: new Date(),
        },
      });
    }
  } else {
    contactUuid = crypto.randomUUID();
    await prisma.contact.create({
      data: {
        contact_uuid: contactUuid,
        contact_name: parsed.data.name,
        contact_created_at: new Date(),
        contact_updated_at: new Date(),
      },
    });
  }

  await prisma.company_contact.create({
    data: {
      company_contact_uuid: crypto.randomUUID(),
      contact_uuid: contactUuid,
      company_id: parsed.data.companyId,
      contact_position: parsed.data.position || null,
      allow_access: parsed.data.allowAccess === "1",
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  revalidatePath("/company/contacts");
  const result = { error: "" };
  const outputParsed = companyActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("addCompanyContact output validation failed:", outputParsed.error);
  }
  return result;
}

export async function removeCompanyContact(_prevState: { error: string }, formData: FormData) {
  await requireRoleCapability("company", "company.write.linked");
  const companyContactUuid = formData.get("companyContactUuid");

  if (typeof companyContactUuid !== "string" || !companyContactUuid.trim()) {
    return { error: "Invalid contact." };
  }

  await prisma.company_contact.delete({
    where: { company_contact_uuid: companyContactUuid },
  });

  revalidatePath("/company/contacts");
  const result = { error: "" };
  const outputParsed = companyActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error("removeCompanyContact output validation failed:", outputParsed.error);
  }
  return result;
}