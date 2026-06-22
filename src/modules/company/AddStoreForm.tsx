"use client";

import { useActionState } from "react";
import { addCompanyStore } from "@/modules/company/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card>
      <CardContent className="p-5">
        <form action={action} className="grid gap-4">
          <h3 className="text-base font-semibold m-0">Add Store</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="addstore-company">Company</Label>
              <select id="addstore-company" name="companyId" required disabled={pending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Select company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="addstore-name">Store name</Label>
              <Input id="addstore-name" name="storeName" placeholder="Store name" required disabled={pending} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="addstore-location">Location</Label>
              <Input id="addstore-location" name="storeLocation" placeholder="Location (address)" disabled={pending} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="addstore-mall">Mall</Label>
              <select id="addstore-mall" name="mallUuid" disabled={pending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">No mall</option>
                {malls.map((m) => (
                  <option key={m.uuid} value={m.uuid}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="addstore-brand">Brand</Label>
              <select id="addstore-brand" name="brandUuid" disabled={pending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">No brand</option>
                {brands.map((b) => (
                  <option key={b.uuid} value={b.uuid}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={pending}>
              {pending ? "Adding..." : "Add Store"}
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
