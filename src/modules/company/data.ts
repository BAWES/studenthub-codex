import { prisma } from "@/lib/prisma";

export async function getCompanySelectOptions(contactUuid: string) {
  const links = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true, company: { select: { company_name: true } } },
  });

  return links
    .filter((l) => l.company_id !== null && l.company !== null)
    .map((l) => ({ id: l.company_id as number, name: l.company!.company_name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCompanyContactsRows(contactUuid: string) {
  const linked = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true },
  });

  const companyIds = linked
    .filter((l) => l.company_id !== null)
    .map((l) => l.company_id as number);

  if (companyIds.length === 0) return [];

  const contacts = await prisma.company_contact.findMany({
    where: { company_id: { in: companyIds } },
    select: {
      company_contact_uuid: true,
      contact_position: true,
      allow_access: true,
      contact: { select: { contact_name: true, contact_email: true } },
      company: { select: { company_name: true } },
    },
    orderBy: { updated_at: "desc" },
  });

  return contacts.map((c) => ({
    id: c.company_contact_uuid,
    name: c.contact?.contact_name ?? "—",
    email: c.contact?.contact_email ?? "—",
    position: c.contact_position ?? "—",
    companyName: c.company?.company_name ?? "—",
    allowAccess: c.allow_access ?? false,
  }));
}

export async function getCompanyStoresRows(contactUuid: string) {
  const linked = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true },
  });

  const companyIds = linked
    .filter((l) => l.company_id !== null)
    .map((l) => l.company_id as number);

  if (companyIds.length === 0) return [];

  const stores = await prisma.store.findMany({
    where: { company_id: { in: companyIds }, deleted: 0 },
    select: {
      store_id: true,
      store_name: true,
      store_location: true,
      brand: { select: { brand_name_en: true } },
      mall: { select: { mall_name_en: true } },
      company: { select: { company_name: true } },
      contact: { select: { contact_name: true } },
    },
    orderBy: { store_updated_at: "desc" },
  });

  return stores.map((s) => ({
    id: s.store_id,
    name: s.store_name,
    location: s.store_location,
    mallName: s.mall?.mall_name_en ?? "—",
    brandName: s.brand?.brand_name_en ?? "—",
    companyName: s.company?.company_name ?? "—",
    managerName: s.contact?.contact_name ?? "—",
  }));
}

export async function getCompanyMallsAndBrands(contactUuid: string) {
  const linked = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true },
  });

  const companyIds = linked
    .filter((l) => l.company_id !== null)
    .map((l) => l.company_id as number);

  const [malls, brands] = await Promise.all([
    prisma.mall.findMany({
      select: { mall_uuid: true, mall_name_en: true },
      orderBy: { mall_name_en: "asc" },
    }),
    prisma.brand.findMany({
      where: companyIds.length > 0 ? { company_id: { in: companyIds } } : undefined,
      select: { brand_uuid: true, brand_name_en: true },
      orderBy: { brand_name_en: "asc" },
    }),
  ]);

  return {
    malls: malls.map((m) => ({ uuid: m.mall_uuid, name: m.mall_name_en })),
    brands: brands.map((b) => ({ uuid: b.brand_uuid, name: b.brand_name_en })),
  };
}
