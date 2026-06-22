import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getCertificate } from "./actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function fmtDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  try {
    const d = typeof value === "string" ? new Date(value) : value;
    if (!isFinite(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return "—";
  }
}

export default async function CandidateCertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { id } = await params;

  const certificate = await getCertificate(id);
  if (!certificate) {
    notFound();
  }

  const period =
    certificate.start_date && certificate.end_date
      ? `${fmtDate(certificate.start_date)} – ${fmtDate(certificate.end_date)}`
      : certificate.start_date
        ? `From ${fmtDate(certificate.start_date)}`
        : certificate.end_date
          ? `Until ${fmtDate(certificate.end_date)}`
          : "—";

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Certificates"
      title={certificate.certificate_title ?? "Certificate"}
      metrics={[
        { label: "Title", value: certificate.certificate_title ?? "—", note: "Certificate" },
        { label: "Issuer", value: certificate.certificate_issuer ?? "—", note: "Issuing organization" },
        { label: "Period", value: period, note: "Validity period" },
      ]}
    >
      <DetailSection
        title="Certificate Details"
        facts={[
          { label: "Title", value: certificate.certificate_title ?? "—" },
          { label: "Issuer", value: certificate.certificate_issuer ?? "—" },
          { label: "URL", value: certificate.certificate_url ?? "—" },
          { label: "Start Date", value: fmtDate(certificate.start_date) },
          { label: "End Date", value: fmtDate(certificate.end_date) },
          { label: "Created", value: certificate.created_at ? formatDate(certificate.created_at) : "N/A" },
          { label: "Updated", value: certificate.updated_at ? formatDate(certificate.updated_at) : "N/A" },
        ]}
      />

      <div className="flex items-center gap-3 mt-8">
        <Button asChild variant="outline">
          <Link href="/candidate/certificates">
            Back to Certificates
          </Link>
        </Button>
      </div>
    </WorkspaceShell>
  );
}
