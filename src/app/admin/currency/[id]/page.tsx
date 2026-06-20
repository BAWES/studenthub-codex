import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getCurrency } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminCurrencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;

  const currency = await getCurrency({ id: Number(id) }).catch(() => null);

  if (!currency) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Currency"
        title={`Currency — ${currency.title}`}
        metrics={[
          {
            label: "Title",
            value: currency.title,
            note: "Currency name",
          },
          {
            label: "Code",
            value: currency.code,
            note: "ISO currency code",
          },
          {
            label: "Symbol",
            value: currency.currency_symbol ?? "—",
            note: "",
          },
        ]}
      >
        <DetailSection
          title="Currency Details"
          facts={[
            { label: "Currency ID", value: currency.currency_id },
            { label: "Title", value: currency.title },
            { label: "Code", value: currency.code },
            { label: "Symbol", value: currency.currency_symbol ?? "—" },
            { label: "Rate", value: currency.rate != null ? String(currency.rate) : "—" },
            { label: "Decimal Place", value: currency.decimal_place != null ? String(currency.decimal_place) : "—" },
            { label: "Sort Order", value: currency.sort_order != null ? String(currency.sort_order) : "—" },
            { label: "Status", value: currency.status ? "Active" : "Inactive" },
            {
              label: "Last Updated",
              value: currency.datetime ? formatDate(new Date(currency.datetime)) : "—",
            },
          ]}
        />

        <section className="flex gap-2 p-4">
          <Link href={"/admin/currency" as Route}>
            <Button variant="outline">Back to Currency</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
