import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCountry } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminCountryDetailPage({
  params,
}: {
  params: Promise<{ countryId: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { countryId } = await params;
  const countryIdNum = Number(countryId);

  if (Number.isNaN(countryIdNum)) {
    notFound();
  }

  const data = await getCountry(countryIdNum);

  if (!data.country) {
    notFound();
  }

  const country = data.country;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Countries"
        title={`${country.emoji ?? ""} ${country.country_name_en}`.trim()}
        metrics={[]}
      >
        <DetailSection
          title="Country Details"
          facts={[
            { label: "Name (EN)", value: country.country_name_en },
            { label: "Name (AR)", value: country.country_name_ar ?? "—" },
            { label: "Nationality (EN)", value: country.country_nationality_name_en },
            { label: "Nationality (AR)", value: country.country_nationality_name_ar ?? "—" },
            { label: "ISO Code", value: country.iso ?? "—" },
            { label: "Country Code", value: country.country_code != null ? `+${country.country_code}` : "—" },
            { label: "Currency", value: country.currency_code ?? "—" },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
