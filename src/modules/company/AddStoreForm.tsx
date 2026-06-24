"use client";

import { useActionState } from "react";
import { addCompanyStore } from "@/modules/company/actions";
import { Alert } from "@/components/ui/alert";

export function AddStoreForm({
  companies,
  malls,
  brands
}: {
  companies: { id: number; name: string }[];
  malls: { uuid: string; name: string }[];
  brands: { uuid: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(addCompanyStore, { error: "" });

  return (
    <form action={action} className="grid gap-4 rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground m-0">Add Store</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <select
          name="companyId"
          required
          disabled={pending}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground disabled:opacity-60"
        >
          <option value="">Select company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          name="storeName"
          placeholder="Store name"
          required
          disabled={pending}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-60"
        />
        <input
          name="storeLocation"
          placeholder="Location (address)"
          disabled={pending}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-60"
        />
        <select
          name="mallUuid"
          disabled={pending}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground disabled:opacity-60"
        >
          <option value="">No mall</option>
          {malls.map((m) => (
            <option key={m.uuid} value={m.uuid}>{m.name}</option>
          ))}
        </select>
        <select
          name="brandUuid"
          disabled={pending}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground disabled:opacity-60"
        >
          <option value="">No brand</option>
          {brands.map((b) => (
            <option key={b.uuid} value={b.uuid}>{b.name}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Adding..." : "Add Store"}
        </button>
      </div>
      {state.error && (
        <Alert variant="destructive" className="py-2 text-sm">
          {state.error}
        </Alert>
      )}
    </form>
  );
}
