"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
import { updateStory, deleteStory } from "../actions";

interface StoryActivity {
  story_activity_uuid: string;
  activity_status: number;
  activity_time_spent: number | null;
  activity_created_at: Date | null;
  activity_last_updated_at: Date | null;
  staff: { staff_name: string } | null;
}

interface StoryDetail {
  story_uuid: string;
  request_uuid: string;
  suggestion_uuid: string | null;
  staff_id: number | null;
  number_of_employees: number | null;
  story_status: number;
  is_old: boolean | null;
  story_time_spent: number | null;
  story_created_at: Date | null;
  story_last_updated_at: Date | null;
  staff: { staff_id: number; staff_name: string } | null;
  request: {
    request_position_title: string | null;
    request_status: string | null;
    company: { company_name: string; company_id: number } | null;
  } | null;
  story_activity: StoryActivity[];
}

function StatusBadge({ status }: { status: number }) {
  const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "success" | "warning" | "outline" }> = {
    0: { label: "Pending", variant: "secondary" },
    1: { label: "Active", variant: "success" },
    2: { label: "Completed", variant: "default" },
    3: { label: "Cancelled", variant: "warning" },
  };
  const config = statusMap[status] ?? { label: `Status ${status}`, variant: "outline" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function StoryDetailForm({ story }: { story: StoryDetail }) {
  const router = useRouter();
  const [numEmployees, setNumEmployees] = useState(String(story.number_of_employees ?? ""));
  const [storyStatus, setStoryStatus] = useState(String(story.story_status));
  const [timeSpent, setTimeSpent] = useState(String(story.story_time_spent ?? ""));

  const updateAction = async (_prevState: unknown, formData: FormData) => {
    formData.set("number_of_employees", numEmployees);
    formData.set("story_status", storyStatus);
    formData.set("story_time_spent", timeSpent);

    await updateStory(story.story_uuid, {
      number_of_employees: Number(numEmployees) || 0,
      story_status: Number(storyStatus) || 0,
      story_time_spent: Number(timeSpent) || 0,
    });
    return { success: true };
  };

  const [state, formAction, pending] = useActionState(updateAction, null);

  const activityStatusLabel = (status: number) => {
    const labels: Record<number, string> = { 0: "Pending", 1: "Active", 2: "Completed", 3: "Cancelled" };
    return labels[status] ?? `Status ${status}`;
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Story Information</CardTitle>
          <CardDescription>
            Placement story details and related records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Request Position</dt>
              <dd className="font-medium">{story.request?.request_position_title ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Company</dt>
              <dd className="font-medium">{story.request?.company?.company_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Request Status</dt>
              <dd>{story.request?.request_status ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Assigned Staff</dt>
              <dd className="font-medium">{story.staff?.staff_name ?? "Unassigned"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Type</dt>
              <dd>
                {story.is_old ? (
                  <Badge variant="warning">Legacy</Badge>
                ) : (
                  <Badge variant="secondary">Current</Badge>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Current Status</dt>
              <dd><StatusBadge status={story.story_status} /></dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Edit Card */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Story</CardTitle>
          <CardDescription>
            Update the story status, employee count, and time tracking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="number_of_employees">Number of Employees</Label>
                <Input
                  id="number_of_employees"
                  name="number_of_employees"
                  type="number"
                  value={numEmployees}
                  onChange={(e) => setNumEmployees(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="story_status">Story Status</Label>
                <Select
                  value={storyStatus}
                  onValueChange={(val) => setStoryStatus(val)}
                >
                  <SelectTrigger id="story_status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Pending</SelectItem>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="2">Completed</SelectItem>
                    <SelectItem value="3">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="story_time_spent">Time Spent (minutes)</Label>
                <Input
                  id="story_time_spent"
                  name="story_time_spent"
                  type="number"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(e.target.value)}
                />
              </div>
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

      {/* Activity Timeline */}
      {story.story_activity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              Recent activity on this story.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {story.story_activity.map((activity) => (
                <div
                  key={activity.story_activity_uuid}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge status={activity.activity_status} />
                    <span className="font-medium">
                      {activity.staff?.staff_name ?? "System"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>
                      {activity.activity_time_spent
                        ? `${activity.activity_time_spent}m`
                        : "—"}
                    </span>
                    <span>
                      {activity.activity_created_at
                        ? new Date(activity.activity_created_at).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Danger Zone */}
      <Card className="border-[var(--sh-error)]/20">
        <CardHeader>
          <CardTitle className="text-[var(--sh-error)]">Danger Zone</CardTitle>
          <CardDescription>
            Deleting this story will permanently remove it and all its associated
            activity records. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              await deleteStory(story.story_uuid);
              router.push("/admin/story");
            }}
          >
            <Button type="submit" variant="destructive">
              Delete Story
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
