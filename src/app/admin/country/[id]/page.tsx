import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCountry } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCountryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;
  const countryId = Number(id);

  if (Number.isNaN(countryId)) {
    notFound();
  }

  const data = await getCountry(countryId);

  if (!data.country) {
    notFound();
  }

  const country = data.country;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Countries"
        title={country.country_name_en}
        metrics={[]}
      >
        <DetailSection
          title="Country Details"
          facts={[
            { label: "English name", value: country.country_name_en },
            { label: "Arabic name", value: country.country_name_ar || "—" },
            { label: "Nationality (EN)", value: country.country_nationality_name_en },
            { label: "Nationality (AR)", value: country.country_nationality_name_ar || "—" },
            { label: "ISO", value: country.iso || "—" },
            { label: "Flag", value: country.emoji || "—" },
            { label: "Country code", value: country.country_code != null ? `+${country.country_code}` : "—" },
            { label: "Currency", value: country.currency_code || "—" },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
