import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getStore } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminStoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;
  const storeId = Number(id);

  if (Number.isNaN(storeId)) {
    notFound();
  }

  const data = await getStore(storeId);

  if (!data.store) {
    notFound();
  }

  const store = data.store;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Stores"
        title={store.store_name}
        metrics={[
          {
            label: "Candidates",
            value: store.store_total_candidates ?? 0,
            note: "",
          },
          {
            label: "Status",
            value: store.store_status === 1 ? "Active" : "Inactive",
            note: "",
          },
        ]}
      >
        <DetailSection
          title="Store Details"
          facts={[
            { label: "Name", value: store.store_name },
            { label: "Location", value: store.store_location },
            {
              label: "Status",
              value: store.store_status === 1 ? "Active" : "Inactive",
            },
            {
              label: "Total Candidates",
              value: store.store_total_candidates != null ? String(store.store_total_candidates) : "—",
            },
            {
              label: "Created",
              value: store.store_created_at
                ? formatDate(new Date(store.store_created_at))
                : "—",
            },
            {
              label: "Updated",
              value: store.store_updated_at
                ? formatDate(new Date(store.store_updated_at))
                : "—",
            },
          ]}
        />

        {store.company && (
          <DetailSection
            title="Company"
            facts={[
              { label: "Name", value: store.company.company_name ?? "—" },
              { label: "Email", value: store.company.company_email ?? "—" },
            ]}
          />
        )}

        {store.contact && (
          <DetailSection
            title="Contact"
            facts={[
              { label: "Name", value: store.contact.contact_name ?? "—" },
              { label: "Email", value: store.contact.contact_email ?? "—" },
            ]}
          />
        )}

        <section className="flex gap-2 p-4">
          <Link href={"/admin/stores" as Route}>
            <Button variant="outline">Back to Stores</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
