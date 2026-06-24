"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
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
              <Badge variant={row.store_status === 10 ? "default" : "secondary"}>
                {row.store_status === 10 ? "Active" : "Inactive"}
              </Badge>
            ),
          },
          {
            key: "actions",
            label: "",
            render: (row) =>
              editingId !== row.store_id ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete store?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove "{row.store_name}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={async () => {
                        const result = await deleteStore({ storeId: row.store_id });
                        if (result.success) {
                          router.refresh();
                        }
                      }}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
        <Label className="text-xs font-medium text-muted-foreground">Store name</Label>
        <Input
          name="storeName"
          required
          maxLength={255}
          placeholder="e.g. The Luxury Boutique"
        />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium text-muted-foreground">Location</Label>
        <Input
          name="storeLocation"
          required
          maxLength={255}
          placeholder="e.g. The Avenues, Floor 2"
        />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium text-muted-foreground">Brand UUID</Label>
        <Input
          name="brandUuid"
          maxLength={36}
          placeholder="Optional"
        />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium text-muted-foreground">Mall UUID</Label>
        <Input
          name="mallUuid"
          maxLength={36}
          placeholder="Optional"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add"}
      </Button>
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
    <form action={action} className="flex items-center gap-2 flex-wrap">
      <Input
        name="storeName"
        defaultValue={row.store_name}
        required
        maxLength={255}
        className="w-40"
      />
      <Input
        name="storeLocation"
        defaultValue={row.store_location}
        required
        maxLength={255}
        className="w-40"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "..." : "Save"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      {state?.error ? (
        <p className="text-xs text-destructive w-full">{state.error}</p>
      ) : null}
    </form>
  );
}
