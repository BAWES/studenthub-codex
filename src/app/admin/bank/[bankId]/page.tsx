import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getBank } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminBankDetailPage({
  params,
}: {
  params: Promise<{ bankId: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { bankId } = await params;
  const bankIdNum = Number(bankId);

  if (Number.isNaN(bankIdNum)) {
    notFound();
  }

  const data = await getBank(bankIdNum);

  if (!data.bank) {
    notFound();
  }

  const bank = data.bank;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Banks"
        title={bank.bank_name ?? "Bank Details"}
        metrics={[
          {
            label: "Candidates",
            value: data.candidate_count,
            note: "",
          },
        ]}
      >
        <DetailSection
          title="Bank Details"
          facts={[
            { label: "Name", value: bank.bank_name ?? "—" },
            { label: "IBAN Code", value: bank.bank_iban_code ?? "—" },
            { label: "SWIFT Code", value: bank.bank_swift_code ?? "—" },
            { label: "ABK Code", value: String(bank.bank_code_abk ?? "—") },
            { label: "Address", value: bank.bank_address ?? "—" },
            {
              label: "Transfer Type",
              value: bank.bank_transfer_type ?? "—",
            },
          ]}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
