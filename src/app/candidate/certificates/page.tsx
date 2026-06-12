import { requireRoleCapability } from "@/modules/auth/session";
import { listCertificates } from "./actions";
import { CandidateCertificatesTable } from "./candidate-certificates-table";

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

export default async function CandidateCertificatesPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const result = await listCertificates({});

  const rows = result.certificates.map((c: { certificate_uuid?: string; certificate_title?: string | null; certificate_issuer?: string | null; start_date?: string | null; end_date?: string | null; created_at?: string }) => ({
    id: c.certificate_uuid,
    title: c.certificate_title ?? "—",
    issuer: c.certificate_issuer ?? "—",
    period:
      c.start_date && c.end_date
        ? `${fmtDate(c.start_date)} – ${fmtDate(c.end_date)}`
        : c.start_date
          ? `From ${fmtDate(c.start_date)}`
          : c.end_date
            ? `Until ${fmtDate(c.end_date)}`
            : "—",
    createdAt: fmtDate(c.created_at),
  }));

  return <CandidateCertificatesTable session={session} rows={rows} />;
}
