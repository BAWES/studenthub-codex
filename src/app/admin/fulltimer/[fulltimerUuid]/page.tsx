import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getFulltimer } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminFulltimerDetailPage({
  params,
}: {
  params: Promise<{ fulltimerUuid: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { fulltimerUuid } = await params;

  if (!fulltimerUuid) notFound();

  const data = await getFulltimer(fulltimerUuid);
  if (!data) notFound();

  const f = data;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Fulltimers"
        title={f.fulltimer_name}
        metrics={[]}
      >
        <DetailSection
          title="Fulltimer Details"
          facts={[
            { label: "Name", value: f.fulltimer_name },
            { label: "Email", value: f.fulltimer_email },
            { label: "Phone", value: f.fulltimer_phone ?? "—" },
            { label: "Employed", value: f.fulltimer_employed === true ? "Yes" : f.fulltimer_employed === false ? "No" : "—" },
            { label: "Current Salary", value: f.fulltimer_current_salary ?? "—" },
            { label: "Expected Salary", value: f.fulltimer_expected_salary ?? "—" },
            { label: "Driving License", value: f.fulltimer_driving_license === true ? "Yes" : f.fulltimer_driving_license === false ? "No" : "—" },
            { label: "Created", value: f.fulltimer_created_datetime ? formatDate(new Date(f.fulltimer_created_datetime)) : "—" },
            { label: "Updated", value: f.fulltimer_updated_datetime ? formatDate(new Date(f.fulltimer_updated_datetime)) : "—" },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
