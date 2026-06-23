"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { updateStory, deleteStory } from "../actions";

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
}

export function StoryDetailForm({ story }: { story: StoryDetail }) {
  const [status, setStatus] = useState(String(story.story_status));
  const [employees, setEmployees] = useState(String(story.number_of_employees ?? ""));
  const [timeSpent, setTimeSpent] = useState(String(story.story_time_spent ?? ""));

  const updateAction = async () => {
    const fd = new FormData();
    fd.set("storyUuid", story.story_uuid);
    fd.set("story_status", String(Number(status) || 0));
    fd.set("number_of_employees", employees ? String(Number(employees)) : "");
    fd.set("story_time_spent", timeSpent ? String(Number(timeSpent)) : "");
    await updateStory(null, fd);
    return { success: true } as const;
  };

  const [state, formAction, pending] = useActionState<{ success?: boolean } | null>(updateAction, null);

  const statusColors: Record<number, "default" | "secondary" | "success" | "warning" | "outline"> = {
    0: "secondary",
    1: "success",
    2: "warning",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Story</CardTitle>
          <CardDescription>Update story details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Badge variant={statusColors[story.story_status] ?? "outline"}>
              Status {story.story_status}
            </Badge>
          </div>
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="story_status">Status</Label>
                <Input id="story_status" type="number" value={status} onChange={(e) => setStatus(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number_of_employees">Employees</Label>
                <Input id="number_of_employees" type="number" value={employees} onChange={(e) => setEmployees(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="story_time_spent">Time Spent (min)</Label>
                <Input id="story_time_spent" type="number" value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} />
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
          <CardDescription>Soft-delete this story (sets status to -1).</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async () => { await deleteStory(story.story_uuid); }}>
            <Button type="submit" variant="destructive">Delete Story</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
