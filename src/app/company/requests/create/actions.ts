"use server";

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { getCompanyCreateFormCompaniesSchema } from "../schemas";

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

/**
 * Get companies associated with a contact for the company request create form.
 * Mirrors the legacy getCompanyCreateFormCompanies() from @/modules/workspace/company-data.
 */
export async function getCompanyCreateFormCompanies(
  contactUuid: string,
): Promise<Array<{ id: number; name: string }>> {
  await requireCapability("request.create");

  const parsed = getCompanyCreateFormCompaniesSchema.safeParse({ contactUuid });
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid contact UUID",
    );
  }

  const links = await prisma.company_contact.findMany({
    where: {
      contact_uuid: parsed.data.contactUuid,
      allow_access: true,
    },
    select: {
      company: {
        select: { company_id: true, company_name: true },
      },
    },
    take: 50,
  });

  return links
    .filter((link) => link.company)
    .map((link) => ({
      id: link.company!.company_id,
      name: link.company!.company_name,
    }));
}
