"use client";

import { useActionState } from "react";
import { addCompanyStore } from "@/modules/company/actions";

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
    <form action={action} className="compactForm">
      <h3>Add Store</h3>
      <div className="formRow">
        <select name="companyId" required disabled={pending}>
          <option value="">Select company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input name="storeName" placeholder="Store name" required disabled={pending} />
        <input name="storeLocation" placeholder="Location (address)" disabled={pending} />
        <select name="mallUuid" disabled={pending}>
          <option value="">No mall</option>
          {malls.map((m) => (
            <option key={m.uuid} value={m.uuid}>{m.name}</option>
          ))}
        </select>
        <select name="brandUuid" disabled={pending}>
          <option value="">No brand</option>
          {brands.map((b) => (
            <option key={b.uuid} value={b.uuid}>{b.name}</option>
          ))}
        </select>
        <button type="submit" disabled={pending}>
          {pending ? "Adding..." : "Add Store"}
        </button>
      </div>
      {state.error && <p className="formError">{state.error}</p>}
    </form>
  );
}
