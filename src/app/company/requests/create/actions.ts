"use server";

// ---------------------------------------------------------------------------
// Company Request Create — server actions for the create page
// ---------------------------------------------------------------------------
// Wraps the shared @/modules/workspace/company-data getCompanyCreateFormCompanies
// as a route-level server action with company-role auth.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { getCompanyListSchema } from "./schemas";
import type { CompanyListItem } from "./schemas";

// ---------------------------------------------------------------------------
// getCompanyList — companies for the create request form dropdown
// ---------------------------------------------------------------------------

/**
 * Get a list of companies accessible by the current contact for the
 * request creation form dropdown.
 *
 * Mirrors the legacy getCompanyCreateFormCompanies() from
 * @/modules/workspace/company-data.
 */
export async function getCompanyList(
  contactUuid: string,
): Promise<CompanyListItem[]> {
  await requireCapability("request.create");

  const parsed = getCompanyListSchema.safeParse({ contactUuid });
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
