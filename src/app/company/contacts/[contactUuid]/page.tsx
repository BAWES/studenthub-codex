import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getCompanyContact } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

const BOOLEAN_LABELS: Record<string, string> = {
  true: "Yes",
  false: "No",
};

export default async function CompanyContactDetailPage({
  params,
}: {
  params: Promise<{ contactUuid: string }>;
}) {
  const session = await requireRoleCapability("company", "company.read.linked");
  const { contactUuid } = await params;

  const data = await getCompanyContact(contactUuid);

  if (!data) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Company / Contacts"
        title={data.contact_name ?? "Contact Detail"}
        metrics={[]}
      >
        <DetailSection
          title="Contact Details"
          facts={[
            { label: "UUID", value: data.company_contact_uuid ?? "—" },
            { label: "Name", value: data.contact_name ?? "—" },
            { label: "Email", value: data.contact_email ?? "—" },
            { label: "Position", value: data.contact_position ?? "—" },
            { label: "Company", value: data.company_name ?? "—" },
            {
              label: "Allow Access",
              value:
                data.allow_access === null
                  ? "—"
                  : BOOLEAN_LABELS[String(data.allow_access)],
            },
            {
              label: "Created",
              value: data.created_at
                ? formatDate(new Date(data.created_at))
                : "—",
            },
            {
              label: "Updated",
              value: data.updated_at
                ? formatDate(new Date(data.updated_at))
                : "—",
            },
          ]}
        />

        <section className="flex gap-2 p-4">
          <Link href={"/company/contacts" as Route}>
            <Button variant="outline">Back to Contacts</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
