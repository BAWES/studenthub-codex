"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { updateEmailCampaign, deleteEmailCampaign } from "../actions";

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

export function EmailCampaignDetailForm({ campaign }: { campaign: EmailCampaignDetail }) {
  const [subject, setSubject] = useState(campaign.subject ?? "");
  const [message, setMessage] = useState(campaign.message ?? "");
  const [target, setTarget] = useState(campaign.target ?? "both");
  const [isRecurring, setIsRecurring] = useState(campaign.is_recurring ?? false);

  const updateAction = async () => {
    await updateEmailCampaign(campaign.campaign_uuid, { subject, message, target, is_recurring: isRecurring });
    return { success: true };
  };

  const [state, formAction, pending] = useActionState(updateAction, null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Email Campaign</CardTitle>
          <CardDescription>Update campaign settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="target">Target</Label>
                <Select value={target} onValueChange={(val) => setTarget(val)}>
                  <SelectTrigger id="target" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="candidate">Candidate</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Recurring</Label>
                <div className="pt-2">
                  <Switch checked={isRecurring} onCheckedChange={(v) => setIsRecurring(v)} />
                </div>
              </div>
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
          <CardDescription>Permanently delete this campaign.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async () => { await deleteEmailCampaign(campaign.campaign_uuid); }}>
            <Button type="submit" variant="destructive">Delete Campaign</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
