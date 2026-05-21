import { prisma } from "@/lib/prisma";
import { formatDate } from "@/modules/workspace/format";

async function companyIdsForContact(contactUuid: string) {
  const links = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true }
  });
  return links.map((link) => link.company_id).filter((id): id is number => Boolean(id));
}

export async function getCompanyContactsRows(contactUuid: string) {
  const companyIds = await companyIdsForContact(contactUuid);
  if (!companyIds.length) return [];

  const links = await prisma.company_contact.findMany({
    where: { company_id: { in: companyIds } },
    orderBy: { updated_at: "desc" },
    take: 80,
    select: {
      company_contact_uuid: true,
      contact_position: true,
      allow_access: true,
      created_at: true,
      updated_at: true,
      contact: {
        select: {
          contact_uuid: true,
          contact_name: true,
          contact_email: true,
          contact_status: true,
          contact_phone: { select: { phone_uuid: true, phone_number: true } }
        }
      },
      company: { select: { company_id: true, company_name: true } }
    }
  });

  return links.map((link) => ({
    id: link.company_contact_uuid,
    contactUuid: link.contact?.contact_uuid ?? "",
    name: link.contact?.contact_name ?? "Unknown contact",
    email: link.contact?.contact_email ?? "No email",
    position: link.contact_position ?? "No position",
    allowAccess: link.allow_access ?? false,
    status: (link.contact?.contact_status ?? 10) === 10 ? "Active" : `Status ${link.contact?.contact_status}`,
    phones: link.contact?.contact_phone.map((p) => ({ uuid: p.phone_uuid, number: p.phone_number })) ?? [],
    companyName: link.company?.company_name ?? "Unknown company",
    companyId: link.company?.company_id ?? 0,
    created: formatDate(link.created_at),
    updated: formatDate(link.updated_at)
  }));
}

export async function getCompanyStoresRows(contactUuid: string) {
  const companyIds = await companyIdsForContact(contactUuid);
  if (!companyIds.length) return [];

  const rows = await prisma.store.findMany({
    where: { company_id: { in: companyIds }, deleted: 0 },
    orderBy: { store_updated_at: "desc" },
    take: 80,
    select: {
      store_id: true,
      store_name: true,
      store_location: true,
      store_status: true,
      store_total_candidates: true,
      store_created_at: true,
      store_updated_at: true,
      company: { select: { company_id: true, company_name: true } },
      mall: { select: { mall_uuid: true, mall_name_en: true } },
      brand: { select: { brand_uuid: true, brand_name_en: true } },
      contact: { select: { contact_uuid: true, contact_name: true } }
    }
  });

  return rows.map((row) => ({
    id: row.store_id,
    name: row.store_name,
    location: row.store_location,
    status: row.store_status === 10 ? "Active" : `Status ${row.store_status}`,
    candidates: row.store_total_candidates ?? 0,
    companyName: row.company?.company_name ?? "Unknown company",
    companyId: row.company?.company_id ?? 0,
    mallName: row.mall?.mall_name_en ?? "",
    mallUuid: row.mall?.mall_uuid ?? "",
    brandName: row.brand?.brand_name_en ?? "",
    brandUuid: row.brand?.brand_uuid ?? "",
    managerName: row.contact?.contact_name ?? "",
    created: formatDate(row.store_created_at),
    updated: formatDate(row.store_updated_at)
  }));
}

export async function getCompanyMallsAndBrands(contactUuid: string) {
  const companyIds = await companyIdsForContact(contactUuid);

  const [malls, brands] = await prisma.$transaction([
    prisma.mall.findMany({
      orderBy: { mall_name_en: "asc" },
      take: 200,
      select: { mall_uuid: true, mall_name_en: true }
    }),
    prisma.brand.findMany({
      where: companyIds.length ? { company_id: { in: companyIds } } : { company_id: -1 },
      orderBy: { brand_name_en: "asc" },
      take: 200,
      select: { brand_uuid: true, brand_name_en: true }
    })
  ]);

  return {
    malls: malls.map((m) => ({ uuid: m.mall_uuid, name: m.mall_name_en })),
    brands: brands.map((b) => ({ uuid: b.brand_uuid, name: b.brand_name_en }))
  };
}

export async function getCompanySelectOptions(contactUuid: string) {
  const companyIds = await companyIdsForContact(contactUuid);
  if (!companyIds.length) return [];

  const companies = await prisma.company.findMany({
    where: { company_id: { in: companyIds }, deleted: 0 },
    orderBy: { company_name: "asc" },
    select: { company_id: true, company_name: true }
  });

  return companies.map((c) => ({ id: c.company_id, name: c.company_name }));
}
