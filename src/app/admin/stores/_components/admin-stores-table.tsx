"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { StoreRow } from "../schemas";
import { createStore, updateStore, deleteStore } from "../actions";

type Props = {
  session: SessionUser;
  stores: StoreRow[];
};

export function AdminStoresTable({ session, stores }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const totalCandidates = stores.reduce((sum, s) => sum + (s.store_total_candidates ?? 0), 0);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage stores — retail locations linked to companies, brands, and malls."
      metrics={[
        { label: "Total stores", value: stores.length, note: "Retail locations in the system" },
        { label: "Total candidates", value: totalCandidates, note: "Candidates across all stores" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add store</h3>
          <CreateStoreForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Stores"
        description="All retail locations. Click a row to edit or remove."
        rows={stores.map((s) => ({ ...s, id: s.store_id }))}
        rowHref={undefined}
        columns={[
          {
            key: "store_name",
            label: "Store name",
            render: (row) =>
              editingId === row.store_id ? (
                <EditStoreForm
                  row={row}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline text-primary"
                  onClick={() => setEditingId(row.store_id)}
                >
                  {row.store_name}
                </button>
              ),
          },
          {
            key: "store_location",
            label: "Location",
            render: (row) =>
              editingId === row.store_id ? null : (
                <span className="text-sm text-foreground">
                  {row.store_location}
                </span>
              ),
          },
          {
            key: "company_name",
            label: "Company",
            render: (row) => row.company_name ?? "—",
          },
          {
            key: "brand_name",
            label: "Brand",
            render: (row) => row.brand_name ?? "—",
          },
          {
            key: "mall_name",
            label: "Mall",
            render: (row) => row.mall_name ?? "—",
          },
          {
            key: "manager_name",
            label: "Manager",
            render: (row) => row.manager_name ?? "—",
          },
          {
            key: "store_status",
            label: "Status",
            render: (row) => (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  row.store_status === 10
                    ? "bg-green-500/10 text-green-600"
                    : "bg-neutral-500/10 text-neutral-500"
                }`}
              >
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    row.store_status === 10 ? "bg-green-500" : "bg-neutral-400"
                  }`}
                />
                {row.store_status === 10 ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "actions",
            label: "",
            render: (row) =>
              editingId !== row.store_id ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
                  onClick={async () => {
                    if (confirm(`Delete store "${row.store_name}"?`)) {
                      const result = await deleteStore({ storeId: row.store_id });
                      if (result.success) {
                        router.refresh();
                      }
                    }
                  }}
                >
                  Delete
                </button>
              ) : null,
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateStoreForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const storeName = formData.get("storeName") as string;
      const storeLocation = formData.get("storeLocation") as string;
      const brandUuid = formData.get("brandUuid") as string;
      const mallUuid = formData.get("mallUuid") as string;

      const result = await createStore({
        store_name: storeName,
        store_location: storeLocation,
        brand_uuid: brandUuid || undefined,
        mall_uuid: mallUuid || undefined,
      });
      if (result.success) {
        onSuccess();
        return { error: undefined };
      }
      return { error: result.error ?? "Failed to create store" };
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
        <label className="text-xs font-medium text-muted-foreground">Store name</label>
        <input
          name="storeName"
          required
          maxLength={255}
          placeholder="e.g. The Luxury Boutique"
          className="h-9 rounded-lg px-3 text-sm border bg-card border-border text-foreground"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Location</label>
        <input
          name="storeLocation"
          required
          maxLength={255}
          placeholder="e.g. The Avenues, Floor 2"
          className="h-9 rounded-lg px-3 text-sm border bg-card border-border text-foreground"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Brand UUID</label>
        <input
          name="brandUuid"
          maxLength={36}
          placeholder="Optional"
          className="h-9 rounded-lg px-3 text-sm border bg-card border-border text-foreground"
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Mall UUID</label>
        <input
          name="mallUuid"
          maxLength={36}
          placeholder="Optional"
          className="h-9 rounded-lg px-3 text-sm border bg-card border-border text-foreground"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground"
      >
        {pending ? "Adding..." : "Add"}
      </button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}

function EditStoreForm({
  row,
  onDone,
  onCancel,
}: {
  row: StoreRow;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const storeName = formData.get("storeName") as string;
      const storeLocation = formData.get("storeLocation") as string;

      const result = await updateStore({
        storeId: row.store_id,
        store_name: storeName,
        store_location: storeLocation,
      });
      if (result.success) {
        onDone();
        return { error: undefined };
      }
      return { error: result.error ?? "Failed to update store" };
    },
    null,
  );

  return (
    <form action={action} className="flex items-center gap-2">
      <input
        name="storeName"
        defaultValue={row.store_name}
        required
        maxLength={255}
        className="h-8 rounded px-2 text-sm border w-40 bg-card border-border text-foreground"
      />
      <input
        name="storeLocation"
        defaultValue={row.store_location}
        required
        maxLength={255}
        className="h-8 rounded px-2 text-sm border w-40 bg-card border-border text-foreground"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-8 rounded px-3 text-xs font-semibold bg-primary text-primary-foreground"
      >
        {pending ? "..." : "Save"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="h-8 rounded px-3 text-xs text-muted-foreground"
      >
        Cancel
      </button>
      {state?.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
