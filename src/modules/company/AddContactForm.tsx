"use client";

import { useActionState } from "react";
import { addCompanyContact } from "@/modules/company/actions";

export function AddContactForm({ companies }: { companies: { id: number; name: string }[] }) {
  const [state, action, pending] = useActionState(addCompanyContact, { error: "" });

  return (
    <form action={action} className="compactForm">
      <h3>Add Contact</h3>
      <div className="formRow">
        <select name="companyId" required disabled={pending}>
          <option value="">Select company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input name="name" placeholder="Contact name" required disabled={pending} />
        <input name="email" type="email" placeholder="Email" disabled={pending} />
        <input name="position" placeholder="Position (e.g. HR, Manager)" disabled={pending} />
        <input name="phone" type="tel" placeholder="Phone" disabled={pending} />
        <label className="checkboxLabel">
          <input name="allowAccess" type="checkbox" value="1" defaultChecked disabled={pending} />
          Allow access
        </label>
        <button type="submit" disabled={pending}>
          {pending ? "Adding..." : "Add Contact"}
        </button>
      </div>
      {state.error && <p className="formError">{state.error}</p>}
    </form>
  );
}
