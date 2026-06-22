"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateStory, deleteStory } from "../actions";

interface StoryDetail {
  story_uuid: string;
  request_uuid: string;
  number_of_employees: number | null;
  story_status: number;
  story_time_spent: number | null;
  story_created_at: Date | null;
  story_last_updated_at: Date | null;
  request: { request_uuid: string; request_position_title: string | null } | null;
  staff: { staff_id: number; staff_name: string } | null;
}

export function StoryDetailForm({
  story,
}: {
  story: StoryDetail;
}) {
  const [employees, setEmployees] = useState(String(story.number_of_employees ?? ""));
  const [status, setStatus] = useState(String(story.story_status));
  const [timeSpent, setTimeSpent] = useState(String(story.story_time_spent ?? ""));

  const updateAction = async (_prevState: unknown, formData: FormData) => {
    formData.set("number_of_employees", employees);
    formData.set("story_status", status);
    formData.set("story_time_spent", timeSpent);

    await updateStory(story.story_uuid, {
      number_of_employees: employees ? Number(employees) : null,
      story_status: Number(status) || 0,
      story_time_spent: timeSpent ? Number(timeSpent) : null,
    });
    return { success: true };
  };

  const [state, formAction, pending] = useActionState(updateAction, null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Story</CardTitle>
          <CardDescription>
            Update story details for request &ldquo;{story.request?.request_position_title ?? "Unknown"}&rdquo;.
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
                  value={employees}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployees(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="story_status">Status</Label>
                <Input
                  id="story_status"
                  name="story_status"
                  type="number"
                  value={status}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatus(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="story_time_spent">Time Spent (minutes)</Label>
                <Input
                  id="story_time_spent"
                  name="story_time_spent"
                  type="number"
                  value={timeSpent}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimeSpent(e.target.value)}
                />
              </div>
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

      <Separator />

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Deleting this story will remove it and all related activities, invitations, and jobs.
            This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              await deleteStory(story.story_uuid);
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
