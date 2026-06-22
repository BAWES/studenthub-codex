"use client";

import { useActionState } from "react";
import { addCompanyContact } from "@/modules/company/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function AddContactForm({ companies }: { companies: { id: number; name: string }[] }) {
  const [state, action, pending] = useActionState(addCompanyContact, { error: "" });

  return (
    <Card>
      <CardContent className="p-5">
        <form action={action} className="grid gap-4">
          <h3 className="text-base font-semibold m-0">Add Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="addcontact-company">Company</Label>
              <select id="addcontact-company" name="companyId" required disabled={pending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Select company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="addcontact-name">Contact name</Label>
              <Input id="addcontact-name" name="name" placeholder="Contact name" required disabled={pending} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="addcontact-email">Email</Label>
              <Input id="addcontact-email" name="email" type="email" placeholder="Email" disabled={pending} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="addcontact-position">Position</Label>
              <Input id="addcontact-position" name="position" placeholder="Position (e.g. HR, Manager)" disabled={pending} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="addcontact-phone">Phone</Label>
              <Input id="addcontact-phone" name="phone" type="tel" placeholder="Phone" disabled={pending} />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input name="allowAccess" type="checkbox" value="1" defaultChecked disabled={pending} className="size-4 rounded border border-input accent-blue-zendesk" />
                Allow access
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={pending}>
              {pending ? "Adding..." : "Add Contact"}
            </Button>
          </div>
          {state.error && (
            <p className="text-sm text-destructive font-medium">{state.error}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
