"use server";

// ---------------------------------------------------------------------------
// Company Search — module-level server actions
// ---------------------------------------------------------------------------
// Queries Typesense for companies and stores, falls back to Prisma for
// contacts (no Typesense collection). Scoped to the contact's linked companies
// for the company.read.linked capability.
// ---------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { getTypesenseClient, COMPANIES_COLLECTION, STORES_COLLECTION, type CompanyDocument, type StoreDocument, isTypesenseAvailable } from "@/lib/typesense";
import { formatDate, formatMoney } from "@/modules/workspace/format";
import {
  searchCompanyEntitiesSchema,
  companySearchResultSchema,
  type CompanySearchResult,
  type CompanySearchRow,
} from "@/modules/company/search/schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function companyIdsForContact(contactUuid: string): Promise<number[]> {
  const links = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true },
  });
  return links
    .map((link) => link.company_id)
    .filter((id): id is number => Boolean(id));
}

// ---------------------------------------------------------------------------
// Typesense — search companies
// ---------------------------------------------------------------------------

async function searchCompaniesFromTypesense(
  query: string,
  companyIds: number[],
): Promise<CompanySearchRow[]> {
  if (companyIds.length === 0) return [];
  try {
    const client = getTypesenseClient();
    const searchParams = {
      q: query || "*",
      query_by: "company_name,company_common_name_en,company_email",
      filter_by: `company_id: [${companyIds.join(",")}] && deleted: 0`,
      sort_by: "company_updated_at:desc",
      per_page: 25,
    };

    const result = await client.collections<CompanyDocument>(COMPANIES_COLLECTION).documents().search(searchParams);

    return (result.hits ?? []).map((hit) => {
      const doc = hit.document;
      return {
        id: doc.company_id,
        name: doc.company_name,
        email: doc.company_email,
        status: doc.company_approved_to_hire ? "Approved" : "Not approved",
        type: "company" as const,
        subtitle: doc.country_name ?? "No country",
        meta: formatMoney(doc.company_hourly_rate, doc.currency_code ?? "KWD"),
        href: `/company/companies/${doc.company_id}`,
      };
    });
  } catch (err) {
    console.error("[company/search] Typesense companies search failed:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Typesense — search stores
// ---------------------------------------------------------------------------

async function searchStoresFromTypesense(
  query: string,
  companyIds: number[],
): Promise<CompanySearchRow[]> {
  if (companyIds.length === 0) return [];
  try {
    const client = getTypesenseClient();
    const searchParams = {
      q: query || "*",
      query_by: "store_name,company_name,brand_name,mall_name,manager_name",
      filter_by: `company_id: [${companyIds.join(",")}] && deleted: 0`,
      sort_by: "store_updated_at:desc",
      per_page: 25,
    };

    const result = await client.collections<StoreDocument>(STORES_COLLECTION).documents().search(searchParams);

    return (result.hits ?? []).map((hit) => {
      const doc = hit.document;
      return {
        id: doc.store_id,
        name: doc.store_name,
        email: "",
        status: doc.store_status === 1 ? "Active" : "Inactive",
        type: "store" as const,
        subtitle: `${doc.company_name} · ${doc.store_location ?? ""}`,
        meta: `${doc.manager_name ?? "No manager"}`,
        href: `/company/stores/${doc.store_id}`,
      };
    });
  } catch (err) {
    console.error("[company/search] Typesense stores search failed:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Prisma — search contacts
// ---------------------------------------------------------------------------

async function searchContactsFromPrisma(
  query: string,
  companyIds: number[],
): Promise<CompanySearchRow[]> {
  if (companyIds.length === 0) return [];
  try {
    const where: Record<string, unknown> = {
      company_id: { in: companyIds },
    };
    if (query) {
      where.OR = [
        { contact: { contact_name: { contains: query } } },
        { contact: { contact_email: { contains: query } } },
      ];
    }

    const contacts = await prisma.company_contact.findMany({
      where: where as any,
      take: 25,
      orderBy: { company_contact_uuid: "asc" },
      select: {
        company_contact_uuid: true,
        contact: {
          select: {
            contact_name: true,
            contact_email: true,
          },
        },
        company: {
          select: {
            company_name: true,
          },
        },
      },
    });

    return contacts.map((c) => ({
      id: 0,
      name: c.contact?.contact_name ?? "Unknown",
      email: c.contact?.contact_email ?? "",
      status: "",
      type: "contact" as const,
      subtitle: c.company?.company_name ?? "",
      meta: c.contact?.contact_email ?? "No email",
      href: `/company/contacts`,
    }));
  } catch (err) {
    console.error("[company/search] Contacts search failed:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Compute facets from results
// ---------------------------------------------------------------------------

function buildFacets(rows: CompanySearchRow[]): CompanySearchResult["facets"] {
  const typeCounts: Record<string, number> = {};
  for (const row of rows) {
    typeCounts[row.type] = (typeCounts[row.type] ?? 0) + 1;
  }

  return [
    {
      key: "type",
      label: "Type",
      options: [
        { label: "All", value: "all", count: rows.length, active: false },
        { label: "Companies", value: "companies", count: typeCounts["company"] ?? 0, active: false },
        { label: "Stores", value: "stores", count: typeCounts["store"] ?? 0, active: false },
        { label: "Contacts", value: "contacts", count: typeCounts["contact"] ?? 0, active: false },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Search across companies, stores, and contacts scoped to the user's linked
 * companies. Uses Typesense for companies and stores, Prisma for contacts.
 */
export async function searchCompanyEntities(
  contactUuid: string,
  params: Record<string, unknown>,
): Promise<CompanySearchResult> {
  const parsed = searchCompanyEntitiesSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid search parameters");
  }

  const { query = "", page = 1, type = "all" } = parsed.data;

  // Scope to contact's linked companies
  const companyIds = await companyIdsForContact(contactUuid);

  // Search each source in parallel
  const [companyRows, storeRows, contactRows] = await Promise.all([
    type === "all" || type === "companies"
      ? searchCompaniesFromTypesense(query, companyIds)
      : Promise.resolve([] as CompanySearchRow[]),
    type === "all" || type === "stores"
      ? searchStoresFromTypesense(query, companyIds)
      : Promise.resolve([] as CompanySearchRow[]),
    type === "all" || type === "contacts"
      ? searchContactsFromPrisma(query, companyIds)
      : Promise.resolve([] as CompanySearchRow[]),
  ]);

  // Combine and sort by name
  let allRows = [...companyRows, ...storeRows, ...contactRows];
  allRows.sort((a, b) => a.name.localeCompare(b.name));

  const matchingCount = allRows.length;

  // Paginate
  const itemsPerPage = 25;
  const start = (page - 1) * itemsPerPage;
  const rows = allRows.slice(start, start + itemsPerPage);

  const result: CompanySearchResult = {
    query,
    page,
    matchingCount,
    rows,
    facets: buildFacets(allRows),
  };

  // Output validation
  const outputParsed = companySearchResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[company/search] searchCompanyEntities output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
