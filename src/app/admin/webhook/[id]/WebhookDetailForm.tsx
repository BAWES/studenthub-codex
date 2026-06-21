"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateWebhook, deleteWebhook } from "../actions";
import type { webhook_method } from "@prisma/client";

interface WebhookDetail {
  webhook_id: number;
  event: string;
  endpoint: string;
  method: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

export function WebhookDetailForm({
  webhook
}: {
  webhook: WebhookDetail;
}) {
  const [event, setEvent] = useState(webhook.event);
  const [endpoint, setEndpoint] = useState(webhook.endpoint);
  const [method, setMethod] = useState<webhook_method>(webhook.method as webhook_method ?? "POST");

  const updateAction = async (_prevState: unknown, formData: FormData) => {
    formData.set("event", event);
    formData.set("endpoint", endpoint);
    formData.set("method", method);

    await updateWebhook(webhook.webhook_id, {
      event,
      endpoint,
      method
    });
    return { success: true };
  };

  const [state, formAction, pending] = useActionState(updateAction, null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Webhook</CardTitle>
          <CardDescription>
            Update the webhook endpoint, event trigger, and HTTP method.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Input
                  id="event"
                  name="event"
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  required
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">HTTP Method</Label>
                <Select
                  value={method}
                  onValueChange={(val) => {
                    if (METHODS.includes(val as typeof METHODS[number])) {
                      setMethod(val as webhook_method);
                    }
                  }}
                >
                  <SelectTrigger id="method" className="w-full">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint URL</Label>
              <Input
                id="endpoint"
                name="endpoint"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                required
                maxLength={255}
                placeholder="https://example.com/webhook"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
              {state?.success && (
                <span className="text-sm text-[var(--sh-success)] font-medium">
                  Saved successfully
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-[var(--sh-error)]/20">
        <CardHeader>
          <CardTitle className="text-[var(--sh-error)]">Danger Zone</CardTitle>
          <CardDescription>
            Deleting this webhook will immediately stop all deliveries to this
            endpoint. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              await deleteWebhook(webhook.webhook_id);
            }}
          >
            <Button type="submit" variant="destructive">
              Delete Webhook
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
