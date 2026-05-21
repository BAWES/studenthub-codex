"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRoleCapability } from "@/modules/auth/session";

function stringField(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}
function nullableStringField(value: unknown) {
  return typeof value === "string" ? (value.trim() || undefined) : undefined;
}
function booleanField(value: unknown) {
  if (typeof value === "string") return value === "1" || value === "true";
  return false;
}
async function verifyCompanyAccess(sessionId: string, companyId: number) {
  const link = await prisma.company_contact.findFirst({
    where: { contact_uuid: sessionId, company_id: companyId, allow_access: true },
    select: { company_contact_uuid: true }
  });
  if (!link) throw new Error("No access");
  return link;
}

export async function addCompanyContact(_prevState: { error: string }, formData: FormData) {
  const session = await requireRoleCapability("company", "company.read.linked");
  const companyId = Number(formData.get("companyId"));
  const name = formData.get("name");
  if (!Number.isInteger(companyId) || companyId < 1) return { error: "Company is required." };
  if (typeof name !== "string" || !name.trim()) return { error: "Contact name is required." };
  try { await verifyCompanyAccess(session.id, companyId); } catch { return { error: "You do not have access to this company." }; }

  const contactUuid = `contact_${crypto.randomUUID()}`;
  const ccUuid = `cc_${crypto.randomUUID()}`;

  await prisma.$transaction(async (tx) => {
    await tx.contact.create({
      data: {
        contact_uuid: contactUuid,
        contact_name: name.trim(),
        contact_email: stringField(formData.get("email")) ?? null,
        contact_created_at: new Date(),
        contact_updated_at: new Date()
      }
    });
    await tx.company_contact.create({
      data: {
        company_contact_uuid: ccUuid,
        contact_uuid: contactUuid,
        company_id: companyId,
        contact_position: nullableStringField(formData.get("position")),
        allow_access: booleanField(formData.get("allowAccess")),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: session.id
      }
    });
    const phone = formData.get("phone");
    if (typeof phone === "string" && phone.trim()) {
      await tx.contact_phone.create({
        data: {
          phone_uuid: `phone_${crypto.randomUUID()}`,
          contact_uuid: contactUuid,
          phone_number: phone.trim(),
          phone_created_datetime: new Date(),
          phone_updated_datetime: new Date()
        }
      });
    }
  });

  revalidatePath("/company/contacts");
  return { error: "" };
}

export async function removeCompanyContact(_prevState: { error: string }, formData: FormData) {
  const session = await requireRoleCapability("company", "company.read.linked");
  const ccUuid = formData.get("companyContactUuid");
  if (typeof ccUuid !== "string" || !ccUuid.trim()) return { error: "Contact link ID is required." };

  const link = await prisma.company_contact.findUnique({
    where: { company_contact_uuid: ccUuid },
    select: { company_id: true }
  });
  if (!link?.company_id) return { error: "Contact link not found." };
  try { await verifyCompanyAccess(session.id, link.company_id); } catch { return { error: "You do not have access to this company." }; }

  await prisma.company_contact.delete({ where: { company_contact_uuid: ccUuid } });
  revalidatePath("/company/contacts");
  return { error: "" };
}

export async function addCompanyStore(_prevState: { error: string }, formData: FormData) {
  const session = await requireRoleCapability("company", "company.read.linked");
  const companyId = Number(formData.get("companyId"));
  const storeName = formData.get("storeName");
  if (!Number.isInteger(companyId) || companyId < 1) return { error: "Company is required." };
  if (typeof storeName !== "string" || !storeName.trim()) return { error: "Store name is required." };
  try { await verifyCompanyAccess(session.id, companyId); } catch { return { error: "You do not have access to this company." }; }

  await prisma.store.create({
    data: {
      company_id: companyId,
      store_name: storeName.trim(),
      store_location: typeof formData.get("storeLocation") === "string" ? (formData.get("storeLocation") as string).trim() : "",
      mall_uuid: nullableStringField(formData.get("mallUuid")),
      brand_uuid: nullableStringField(formData.get("brandUuid")),
      store_status: 10,
      store_created_at: new Date(),
      store_updated_at: new Date()
    }
  });

  revalidatePath("/company/stores");
  return { error: "" };
}

export async function removeCompanyStore(_prevState: { error: string }, formData: FormData) {
  const session = await requireRoleCapability("company", "company.read.linked");
  const storeId = Number(formData.get("storeId"));
  if (!Number.isInteger(storeId) || storeId < 1) return { error: "Store ID is required." };

  const store = await prisma.store.findUnique({ where: { store_id: storeId }, select: { company_id: true } });
  if (!store?.company_id) return { error: "Store not found." };
  try { await verifyCompanyAccess(session.id, store.company_id); } catch { return { error: "You do not have access to this company." }; }

  await prisma.store.update({ where: { store_id: storeId }, data: { deleted: 1, store_updated_at: new Date() } });
  revalidatePath("/company/stores");
  return { error: "" };
}
