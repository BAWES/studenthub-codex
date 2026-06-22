"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { updateEmailCampaign, deleteEmailCampaign } from "../actions";

interface EmailCampaignDetail {
  id: string;
  subject: string;
  message: string;
  progress: number;
  trigger_at: string | null;
  last_trigger_at: string | null;
  is_recurring: boolean;
  trigger_period: number | null;
  target: string;
  status: boolean;
  created_at: string | null;
  updated_at: string | null;
  filters: Array<{ id: string; param: string; value: string }>;
}

export function EmailCampaignDetailForm({
  campaign,
}: {
  campaign: EmailCampaignDetail;
}) {
  const [subject, setSubject] = useState(campaign.subject);
  const [message, setMessage] = useState(campaign.message);
  const [target, setTarget] = useState(campaign.target);
  const [isRecurring, setIsRecurring] = useState(campaign.is_recurring);
  const [triggerPeriod, setTriggerPeriod] = useState(
    campaign.trigger_period ? String(campaign.trigger_period) : ""
  );
  const [triggerDate, setTriggerDate] = useState(
    campaign.trigger_at ? campaign.trigger_at.slice(0, 16) : ""
  );
  const [active, setActive] = useState(campaign.status);

  const updateAction = async (_prevState: unknown, formData: FormData) => {
    formData.set("subject", subject);
    formData.set("message", message);
    formData.set("target", target);
    formData.set("is_recurring", String(isRecurring));
    formData.set("trigger_period", triggerPeriod);
    formData.set("trigger_date_time", triggerDate);
    formData.set("status", String(active));

    await updateEmailCampaign(campaign.id, {
      subject,
      message,
      target,
      is_recurring: isRecurring,
      trigger_period: triggerPeriod ? Number(triggerPeriod) : null,
      trigger_date_time: triggerDate || null,
      status: active,
    });
    return { success: true };
  };

  const [state, formAction, pending] = useActionState(updateAction, null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Email Campaign</CardTitle>
          <CardDescription>
            Update the campaign subject, message content, scheduling, and targeting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (HTML)</Label>
              <Textarea
                id="message"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target">Target Audience</Label>
                <Select value={target} onValueChange={(val) => setTarget(val)}>
                  <SelectTrigger id="target" className="w-full">
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="candidates">Candidates</SelectItem>
                    <SelectItem value="employers">Employers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger_date_time">Schedule Date</Label>
                <Input
                  id="trigger_date_time"
                  name="trigger_date_time"
                  type="datetime-local"
                  value={triggerDate}
                  onChange={(e) => setTriggerDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="is_recurring">Recurring</Label>
                  <p className="text-sm text-muted-foreground">
                    Repeat this campaign automatically
                  </p>
                </div>
                <Switch
                  id="is_recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
              </div>

              {isRecurring && (
                <div className="space-y-2">
                  <Label htmlFor="trigger_period">Repeat Interval (days)</Label>
                  <Input
                    id="trigger_period"
                    name="trigger_period"
                    type="number"
                    min={1}
                    value={triggerPeriod}
                    onChange={(e) => setTriggerPeriod(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="status">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Campaign will be sent when scheduled
                </p>
              </div>
              <Switch
                id="status"
                checked={active}
                onCheckedChange={setActive}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
              {state?.success && (
                <span className="text-sm text-green-700 font-medium">
                  Saved successfully
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {campaign.filters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              {campaign.filters.length} filter{campaign.filters.length !== 1 ? "s" : ""} configured
              for this campaign.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {campaign.filters.map((f) => (
                <Badge key={f.id} variant="secondary">
                  {f.param}: {f.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {campaign.last_trigger_at && (
        <Card>
          <CardHeader>
            <CardTitle>Last Execution</CardTitle>
            <CardDescription>
              The campaign was last triggered on{" "}
              {new Date(campaign.last_trigger_at).toLocaleString()}.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Deleting this campaign will permanently remove it and all associated filters.
            This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              await deleteEmailCampaign(campaign.id);
            }}
          >
            <Button type="submit" variant="destructive">
              Delete Campaign
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
