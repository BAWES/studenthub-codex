import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getCompanyContact } from "./actions";

export const dynamic = "force-dynamic";

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
    <WorkspaceShell
      session={session}
      eyebrow="Company / Contacts"
      title={data.contact_name ?? "Contact Detail"}
      metrics={[]}
    >
      <DetailSection
        title="Contact Details"
        facts={[
          { label: "Name", value: data.contact_name ?? "—" },
          { label: "Email", value: data.contact_email ?? "—" },
          { label: "Position", value: data.contact_position ?? "—" },
          { label: "Company", value: data.company_name ?? "—" },
          {
            label: "Allow Access",
            value:
              data.allow_access === null
                ? "—"
                : data.allow_access
                  ? "Yes"
                  : "No",
          },
          {
            label: "Created",
            value: new Date(data.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          },
          {
            label: "Updated",
            value: new Date(data.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          },
        ]}
      />

      <section style={{ display: "flex", gap: "0.5rem", padding: "1rem" }}>
        <Link href={"/company/contacts" as Route}>
          <Button variant="outline">Back to Contacts</Button>
        </Link>
      </section>
    </WorkspaceShell>
  );
}
