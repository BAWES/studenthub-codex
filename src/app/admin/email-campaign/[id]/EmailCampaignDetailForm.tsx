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
import { updateEmailCampaign, deleteEmailCampaign } from "../actions";
import { cn } from "@/lib/utils";

interface EmailCampaignDetail {
  campaign_uuid: string;
  subject: string | null;
  message: string | null;
  progress: number | null;
  trigger_date_time: Date | null;
  last_trigger_date_time: Date | null;
  is_recurring: boolean | null;
  trigger_period: number | null;
  target: string | null;
  status: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export function EmailCampaignDetailForm({
  campaign
}: {
  campaign: EmailCampaignDetail;
}) {
  const [subject, setSubject] = useState(campaign.subject ?? "");
  const [message, setMessage] = useState(campaign.message ?? "");
  const [target, setTarget] = useState(campaign.target ?? "both");
  const [isActive, setIsActive] = useState(campaign.status ? "active" : "inactive");
  const [isRecurring, setIsRecurring] = useState(campaign.is_recurring ? "yes" : "no");
  const [triggerPeriod, setTriggerPeriod] = useState(String(campaign.trigger_period ?? ""));
  const [triggerDate, setTriggerDate] = useState(
    campaign.trigger_date_time
      ? new Date(campaign.trigger_date_time).toISOString().slice(0, 16)
      : ""
  );

  const updateAction = async (_prevState: unknown, _formData: FormData) => {
    await updateEmailCampaign(campaign.campaign_uuid, {
      subject: subject || undefined,
      message: message || undefined,
      target: target,
      status: isActive === "active",
      is_recurring: isRecurring === "yes",
      trigger_period: triggerPeriod ? Number(triggerPeriod) : null,
      trigger_date_time: triggerDate ? new Date(triggerDate) : null,
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
            Update the campaign subject, message content, targeting, and scheduling.
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message Content</Label>
              <textarea
                id="message"
                name="message"
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                placeholder="Enter email message body..."
                rows={6}
                className={cn(
                  "flex w-full rounded-md border border-input bg-transparent px-3 py-2",
                  "text-sm shadow-sm placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target">Target Audience</Label>
                <Select value={target} onValueChange={(val: string) => setTarget(val)}>
                  <SelectTrigger id="target" className="w-full">
                    <SelectValue placeholder="Both" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both (Students & Companies)</SelectItem>
                    <SelectItem value="student">Students Only</SelectItem>
                    <SelectItem value="company">Companies Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Active</Label>
                <Select value={isActive} onValueChange={(val: string) => setIsActive(val)}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Inactive" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="is_recurring">Recurring</Label>
                <Select value={isRecurring} onValueChange={(val: string) => setIsRecurring(val)}>
                  <SelectTrigger id="is_recurring" className="w-full">
                    <SelectValue placeholder="No" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No (One-time)</SelectItem>
                    <SelectItem value="yes">Yes (Repeating)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger_period">
                  {isRecurring === "yes" ? "Recurrence Period (days)" : "Delay (days)"}
                </Label>
                <Input
                  id="trigger_period"
                  name="trigger_period"
                  type="number"
                  value={triggerPeriod}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTriggerPeriod(e.target.value)}
                  placeholder={isRecurring === "yes" ? "e.g. 7 for weekly" : "e.g. 0 for immediate"}
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger_date_time">Scheduled Date and Time</Label>
              <Input
                id="trigger_date_time"
                name="trigger_date_time"
                type="datetime-local"
                value={triggerDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTriggerDate(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
              {state?.success && (
                <span className="text-sm text-[#2e7d32] font-medium">
                  Saved successfully
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-[#d32f2f]/20">
        <CardHeader>
          <CardTitle className="text-[#d32f2f]">Danger Zone</CardTitle>
          <CardDescription>
            Deleting this email campaign will permanently remove it and all its
            associated filters. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              await deleteEmailCampaign(campaign.campaign_uuid);
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
