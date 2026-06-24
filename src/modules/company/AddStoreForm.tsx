"use client";

import { useActionState } from "react";
import { addCompanyStore } from "@/modules/company/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <form action={action} className="space-y-4 rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">Add Store</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          name="companyId"
          required
          disabled={pending}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <Input name="storeName" placeholder="Store name" required disabled={pending} />
        <Input name="storeLocation" placeholder="Location (address)" disabled={pending} />
        <select
          name="mallUuid"
          disabled={pending}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">No mall</option>
          {malls.map((m) => (
            <option key={m.uuid} value={m.uuid}>{m.name}</option>
          ))}
        </select>
        <select
          name="brandUuid"
          disabled={pending}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">No brand</option>
          {brands.map((b) => (
            <option key={b.uuid} value={b.uuid}>{b.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending} size="sm">
          {pending ? "Adding..." : "Add Store"}
        </Button>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
