"use client";

import { useActionState } from "react";
import { addCompanyContact } from "@/modules/company/actions";
import { Alert } from "@/components/ui/alert";

export function AddContactForm({ companies }: { companies: { id: number; name: string }[] }) {
  const [state, action, pending] = useActionState(addCompanyContact, { error: "" });

  return (
    <form action={action} className="grid gap-4 rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground m-0">Add Contact</h3>
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
          name="name"
          placeholder="Contact name"
          required
          disabled={pending}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-60"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          disabled={pending}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-60"
        />
        <input
          name="position"
          placeholder="Position (e.g. HR, Manager)"
          disabled={pending}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-60"
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone"
          disabled={pending}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-60"
        />
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input
            name="allowAccess"
            type="checkbox"
            value="1"
            defaultChecked
            disabled={pending}
            className="size-4 rounded border-border text-primary focus:ring-primary"
          />
          Allow access
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Adding..." : "Add Contact"}
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
