"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { updateWebhook, deleteWebhook } from "../actions";
import type { WebhookMethod } from "../actions";

interface WebhookDetail {
  webhook_id: number;
  event: string;
  endpoint: string;
  method: WebhookMethod | null;
  created_by: number | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export function WebhookDetailForm({ webhook }: { webhook: WebhookDetail }) {
  const [event, setEvent] = useState(webhook.event);
  const [endpoint, setEndpoint] = useState(webhook.endpoint);
  const [method, setMethod] = useState(webhook.method ?? "");

  const METHODS: { value: string; label: string }[] = [
    { value: "", label: "— None —" },
    { value: "GET", label: "GET" },
    { value: "POST", label: "POST" },
    { value: "PUT", label: "PUT" },
    { value: "PATCH", label: "PATCH" },
    { value: "DELETE", label: "DELETE" },
  ];

  const updateAction = async () => {
    await updateWebhook(webhook.webhook_id, {
      event,
      endpoint,
      method: (method || undefined) as WebhookMethod | undefined,
    });
    return { success: true };
  };

  const [state, formAction, pending] = useActionState(updateAction, null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Webhook</CardTitle>
          <CardDescription>Update webhook configuration.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Input id="event" value={event} onChange={(e) => setEvent(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">HTTP Method</Label>
                <Select value={method} onValueChange={(val) => setMethod(val)}>
                  <SelectTrigger id="method" className="w-full"><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint URL</Label>
              <Input id="endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} required />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Changes"}</Button>
              {state?.success && <span className="text-sm text-green-700 font-medium">Saved successfully</span>}
            </div>
          </form>
        </CardContent>
      </Card>
      <Separator />
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Permanently delete this webhook.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async () => { await deleteWebhook(webhook.webhook_id); }}>
            <Button type="submit" variant="destructive">Delete Webhook</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
