import { prisma } from "@/lib/prisma";

export async function getCompanyCreateFormCompanies(contactUuid: string) {
  const links = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
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
