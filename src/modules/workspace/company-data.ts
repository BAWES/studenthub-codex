import { prisma } from "@/lib/prisma";

export async function getCompanyCreateFormCompanies(contactUuid: string) {
  const links = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true, company: { select: { company_name: true } } },
  });

  return links
    .filter((link) => link.company_id !== null && link.company !== null)
    .map((link) => ({ id: link.company_id as number, name: link.company!.company_name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
