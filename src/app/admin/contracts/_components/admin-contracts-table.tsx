"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { ContractRow } from "../schemas";
import { createContract, updateContract, deleteContract } from "../actions";

type Props = {
  session: SessionUser;
  contracts: ContractRow[];
};

const STATUS_LABELS: Record<number, { label: string; variant: "default" | "secondary" | "success" | "warning" | "outline" }> = {
  0: { label: "Draft", variant: "outline" },
  1: { label: "Active", variant: "success" },
  2: { label: "Suspended", variant: "warning" },
  3: { label: "Terminated", variant: "outline" },
};

function getStatusBadge(status: number) {
  const s = STATUS_LABELS[status] ?? { label: `Status ${status}`, variant: "outline" as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function AdminContractsTable({ session, contracts }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage contracts — employment agreements linked to candidates and companies."
      metrics={[
        { label: "Total contracts", value: contracts.length, note: "Active agreements in the system" },
      ]}
    >
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add contract</h3>
          <CreateContractForm onSuccess={() => router.refresh()} />
        </CardContent>
      </Card>

      <DataTable
        title="Contracts"
        description="All employment agreements. Click a row to edit."
        rows={contracts.map((c) => ({ ...c, id: c.contract_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "type",
            label: "Type",
            render: (row) =>
              editingId === row.contract_uuid ? (
                <EditContractForm
                  row={row}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm px-0 h-auto hover:underline"
                  onClick={() => setEditingId(row.contract_uuid)}
                >
                  {row.type ?? "—"}
                </Button>
              ),
          },
          {
            key: "company_name",
            label: "Company",
            render: (row) =>
              editingId === row.contract_uuid ? null : (
                <span className="text-sm text-foreground">{row.company_name ?? "—"}</span>
              ),
          },
          {
            key: "candidate_name",
            label: "Candidate",
            render: (row) =>
              editingId === row.contract_uuid ? null : (
                <span className="text-sm text-foreground">{row.candidate_name ?? "—"}</span>
              ),
          },
          {
            key: "status",
            label: "Status",
            render: (row) =>
              editingId === row.contract_uuid ? null : getStatusBadge(row.status),
          },
          {
            key: "start_date",
            label: "Start date",
            render: (row) =>
              editingId === row.contract_uuid ? null : (
                <span className="text-sm text-foreground">
                  {row.start_date ? new Date(row.start_date).toLocaleDateString() : "—"}
                </span>
              ),
          },
          {
            key: "end_date",
            label: "End date",
            render: (row) =>
              editingId === row.contract_uuid ? null : (
                <span className="text-sm text-foreground">
                  {row.end_date ? new Date(row.end_date).toLocaleDateString() : "—"}
                </span>
              ),
          },
          {
            key: "delete",
            label: "",
            render: (row) =>
              editingId === row.contract_uuid ? null : (
                <DeleteContractButton
                  contractUuid={row.contract_uuid}
                  onDone={() => router.refresh()}
                />
              ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}

// ---------------------------------------------------------------------------
// CreateContractForm
// ---------------------------------------------------------------------------

function CreateContractForm({ onSuccess }: { onSuccess: () => void }) {
  const [type, setType] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await createContract({
      type,
      companyId: Number(companyId),
      candidateId: candidateId ? Number(candidateId) : null,
    });

    setPending(false);

    if (result.operation === "error") {
      setError(result.message);
    } else {
      setType("");
      setCompanyId("");
      setCandidateId("");
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="create-type">Type</Label>
        <Input
          id="create-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="e.g. full_time"
          required
          className="h-9"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="create-company">Company ID</Label>
        <Input
          id="create-company"
          type="number"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          placeholder="Company ID"
          required
          className="h-9 w-28"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="create-candidate">Candidate ID</Label>
        <Input
          id="create-candidate"
          type="number"
          value={candidateId}
          onChange={(e) => setCandidateId(e.target.value)}
          placeholder="Optional"
          className="h-9 w-28"
        />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding..." : "Add"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}

// ---------------------------------------------------------------------------
// EditContractForm
// ---------------------------------------------------------------------------

function EditContractForm({
  row,
  onDone,
  onCancel,
}: {
  row: ContractRow;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState(row.type);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await updateContract({
      contractUuid: row.contract_uuid,
      type,
    });

    setPending(false);

    if (result.operation === "error") {
      setError(result.message);
    } else {
      onDone();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="h-8 w-40 text-sm"
        required
      />
      <Button type="submit" size="sm" variant="default" disabled={pending}>
        {pending ? "..." : "Save"}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}

// ---------------------------------------------------------------------------
// DeleteContractButton
// ---------------------------------------------------------------------------

function DeleteContractButton({
  contractUuid,
  onDone,
}: {
  contractUuid: string;
  onDone: () => void;
}) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this contract? This action cannot be undone.")) return;
    setPending(true);
    const result = await deleteContract({ contractUuid });
    setPending(false);

    if (result.operation === "success") {
      onDone();
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="text-destructive text-xs"
      disabled={pending}
      onClick={handleDelete}
    >
      {pending ? "..." : "Delete"}
    </Button>
  );
}
