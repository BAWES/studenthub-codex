import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection, type DetailSectionRow } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getCandidatePaymentDetail } from "../actions";

export const dynamic = "force-dynamic";

export default async function CandidatePaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { id } = await params;
  const data = await getCandidatePaymentDetail({ tcId: Number(id) });

  if (!data) {
    notFound();
  }

  const { transferCandidate: tc, transfer } = data;

  const facts = [
    { label: "Hours", value: tc.hours },
    { label: "Hourly Rate", value: tc.hourlyRate },
    { label: "Bonus", value: tc.bonus },
    { label: "Your Total", value: tc.candidateTotal },
    { label: "Company Total", value: tc.companyTotal },
    { label: "Transfer Cost", value: tc.cost },
    { label: "Status", value: tc.paid },
    { label: "Store", value: tc.store },
    { label: "Beneficiary", value: tc.beneficiary },
    { label: "IBAN", value: tc.iban },
    { label: "Bank", value: tc.bank },
    { label: "Created", value: tc.created },
    { label: "Updated", value: tc.updated },
  ];

  const transferFacts = transfer
    ? [
        { label: "Company", value: tc.company },
        { label: "Period", value: transfer.period },
        { label: "Payment Received", value: transfer.paymentReceived },
      ]
    : [];

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate / Payments"
      title={`Payment #${tc.id}`}
      metrics={[
        { label: "Total", value: tc.candidateTotal, note: "Your payout" },
        { label: "Status", value: tc.paid, note: "Payment status" },
        { label: "Hours", value: tc.hours, note: "Worked" },
      ]}
    >
      <DetailSection title="Payment Breakdown" facts={facts} />
      {transfer && <DetailSection title="Transfer Run" facts={transferFacts} />}
      {data.invoices.length > 0 && (
        <section className="detailPanel">
          <h2>Receipts & Invoices</h2>
          <p className="detailPanelNote">
            Paid invoices linked to this payment period serve as your receipt.
          </p>
          <DetailSection
            type="list"
            title="Invoices"
            rows={data.invoices.map((inv) => ({
              id: inv.id,
              title: `Invoice #${inv.id}`,
              subtitle: inv.date
                ? new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(inv.date)
                : "No date",
              meta: inv.status ?? "Unknown",
            })) as DetailSectionRow[]}
          />
        </section>
      )}
    </WorkspaceShell>
  );
}
