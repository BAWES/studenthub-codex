import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { CompactList, DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getCompanyDetail } from "@/modules/workspace/data";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminCompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRoleCapability("admin", "company.read.any");
  const { id } = await params;
  const data = await getCompanyDetail(Number(id));

  if (!data.company) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Company"
      title={data.company.company_name}
      metrics={data.metrics}
      primary={{ title: "Requests", rows: data.requests }}
      secondary={{ title: "Contacts", rows: data.contacts }}
    >
      <DetailSection
        title="Account"
        facts={[
          { label: "Email", value: data.company.company_email },
          { label: "Common Name", value: data.company.company_common_name_en },
          { label: "Website", value: data.company.company_website },
          { label: "Country", value: data.company.country?.country_name_en },
          { label: "Created", value: formatDate(data.company.company_created_at) },
          { label: "Updated", value: formatDate(data.company.company_updated_at) }
        ]}
      />
      <section className="detailGrid">
        <CompactList title="Stores" rows={data.stores} />
        <CompactList title="Notes" rows={data.notes} />
      </section>

      <section className="flex gap-2 p-4">
        <Link href={"/admin/companies" as Route}>
          <Button variant="outline">Back to Companies</Button>
        </Link>
      </section>
    </WorkspaceShell>
  );
}
