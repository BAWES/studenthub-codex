"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { BankRow } from "../schemas";
import { createBank, updateBank, deleteBank } from "../actions";

type Props = {
  session: SessionUser;
  banks: BankRow[];
};

export function AdminBankTable({ session, banks }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const totalCandidates = banks.reduce((sum, b) => sum + (b.candidate_count ?? 0), 0);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage banks — financial institutions linked to candidate payment profiles."
      metrics={[
        { label: "Total banks", value: banks.length, note: "Financial institutions in the system" },
        { label: "Total candidates", value: totalCandidates, note: "Candidates linked to a bank" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add bank</h3>
          <CreateBankForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Banks"
        description="All financial institutions. Click a row to edit or remove."
        rows={banks.map((b) => ({ ...b, id: b.bank_id }))}
        rowHref={undefined}
        columns={[
          {
            key: "bank_name",
            label: "Bank name",
            render: (row) =>
              editingId === row.bank_id ? (
                <EditBankForm
                  row={row}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm px-0 h-auto hover:underline"
                  onClick={() => setEditingId(row.bank_id)}
                >
                  {row.bank_name ?? "—"}
                </Button>
              ),
          },
          {
            key: "bank_iban_code",
            label: "IBAN",
            render: (row) =>
              editingId === row.bank_id ? null : (
                <code className="text-xs text-foreground">
                  {row.bank_iban_code}
                </code>
              ),
          },
          {
            key: "bank_swift_code",
            label: "SWIFT",
            render: (row) =>
              editingId === row.bank_id ? null : (
                <span className="text-sm text-foreground">
                  {row.bank_swift_code ?? "—"}
                </span>
              ),
          },
          {
            key: "bank_code_abk",
            label: "ABK code",
            render: (row) =>
              editingId === row.bank_id ? null : (
                <span className="text-sm text-foreground">
                  {row.bank_code_abk ?? "—"}
                </span>
              ),
          },
          {
            key: "bank_address",
            label: "Address",
            render: (row) =>
              editingId === row.bank_id ? null : (
                <span className="text-sm text-foreground">
                  {row.bank_address ?? "—"}
                </span>
              ),
          },
          {
            key: "bank_transfer_type",
            label: "Transfer type",
            render: (row) =>
              editingId === row.bank_id ? null : (
                <span className="text-sm text-foreground">
                  {row.bank_transfer_type ?? "—"}
                </span>
              ),
          },
          {
            key: "candidate_count",
            label: "Candidates",
            render: (row) => (
              <span className="text-sm font-medium text-foreground">
                {row.candidate_count}
              </span>
            ),
          },
          {
            key: "actions",
            label: "",
            render: (row) =>
              editingId !== row.bank_id ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={async () => {
                    if (confirm(`Delete bank "${row.bank_name ?? row.bank_iban_code}"?`)) {
                      const result = await deleteBank({ bankId: row.bank_id });
                      if (result.operation === "success") {
                        router.refresh();
                      } else {
                        alert(result.message);
                      }
                    }
                  }}
                >
                  Delete
                </Button>
              ) : null,
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateBankForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const bankName = formData.get("bankName") as string;
      const bankIbanCode = formData.get("bankIbanCode") as string;
      const bankSwiftCode = formData.get("bankSwiftCode") as string;
      const bankCodeAbk = formData.get("bankCodeAbk") as string;
      const bankAddress = formData.get("bankAddress") as string;
      const bankTransferType = formData.get("bankTransferType") as string;

      const result = await createBank({
        bankName,
        bankIbanCode,
        bankSwiftCode: bankSwiftCode || undefined,
        bankCodeAbk: bankCodeAbk ? Number(bankCodeAbk) : undefined,
        bankAddress: bankAddress || undefined,
        bankTransferType: bankTransferType || undefined,
      });
      if (result.operation === "success") {
        onSuccess();
        return { error: undefined };
      }
      return { error: result.message ?? "Failed to create bank" };
    },
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-wrap items-end gap-3"
      onSubmit={() => setTimeout(() => { formRef.current?.reset(); }, 100)}
    >
      <div className="grid gap-1">
        <Label className="text-xs font-medium">Bank name</Label>
        <Input
          name="bankName"
          required
          maxLength={100}
          placeholder="e.g. National Bank of Kuwait"
          className="h-9"
        />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium">IBAN</Label>
        <Input
          name="bankIbanCode"
          required
          maxLength={64}
          placeholder="e.g. KW81NBK000000000000123456"
          className="h-9"
        />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium">SWIFT</Label>
        <Input
          name="bankSwiftCode"
          maxLength={100}
          placeholder="Optional"
          className="h-9"
        />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium">ABK code</Label>
        <Input
          name="bankCodeAbk"
          type="number"
          placeholder="Optional"
          className="h-9 w-28"
        />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium">Address</Label>
        <Input
          name="bankAddress"
          maxLength={100}
          placeholder="Optional"
          className="h-9"
        />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium">Transfer type</Label>
        <Input
          name="bankTransferType"
          maxLength={3}
          placeholder="e.g. WIR"
          className="h-9 w-20"
        />
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="h-9"
      >
        {pending ? "Adding..." : "Add"}
      </Button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}

function EditBankForm({
  row,
  onDone,
  onCancel,
}: {
  row: BankRow;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const bankName = formData.get("bankName") as string;
      const bankIbanCode = formData.get("bankIbanCode") as string;
      const bankSwiftCode = formData.get("bankSwiftCode") as string;
      const bankCodeAbk = formData.get("bankCodeAbk") as string;
      const bankAddress = formData.get("bankAddress") as string;
      const bankTransferType = formData.get("bankTransferType") as string;

      const result = await updateBank({
        bankId: row.bank_id,
        bankName: bankName || undefined,
        bankIbanCode: bankIbanCode || undefined,
        bankSwiftCode: bankSwiftCode || undefined,
        bankCodeAbk: bankCodeAbk ? Number(bankCodeAbk) : undefined,
        bankAddress: bankAddress || undefined,
        bankTransferType: bankTransferType || undefined,
      });
      if (result.operation === "success") {
        onDone();
        return { error: undefined };
      }
      return { error: result.message ?? "Failed to update bank" };
    },
    null,
  );

  return (
    <form action={action} className="flex items-center gap-2 flex-wrap">
      <Input
        name="bankName"
        defaultValue={row.bank_name ?? ""}
        maxLength={100}
        className="h-8 w-36"
      />
      <Input
        name="bankIbanCode"
        defaultValue={row.bank_iban_code}
        required
        maxLength={64}
        placeholder="IBAN"
        className="h-8 w-48"
      />
      <Input
        name="bankSwiftCode"
        defaultValue={row.bank_swift_code ?? ""}
        maxLength={100}
        placeholder="SWIFT"
        className="h-8 w-28"
      />
      <Input
        name="bankCodeAbk"
        type="number"
        defaultValue={row.bank_code_abk ?? ""}
        placeholder="ABK"
        className="h-8 w-20"
      />
      <Input
        name="bankAddress"
        defaultValue={row.bank_address ?? ""}
        maxLength={100}
        placeholder="Address"
        className="h-8 w-36"
      />
      <Input
        name="bankTransferType"
        defaultValue={row.bank_transfer_type ?? ""}
        maxLength={3}
        placeholder="Type"
        className="h-8 w-16"
      />
      <Button
        type="submit"
        disabled={pending}
        size="sm"
      >
        {pending ? "..." : "Save"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCancel}
      >
        Cancel
      </Button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
