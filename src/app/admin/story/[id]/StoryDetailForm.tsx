"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateStory, deleteStory } from "@/modules/admin/story/actions";
import type { StoryItem } from "@/modules/admin/story/schemas";

export function StoryDetailForm({ story }: { story: StoryItem }) {
  const router = useRouter();
  const [requestUuid, setRequestUuid] = useState(story.request_uuid);
  const [staffId, setStaffId] = useState(String(story.staff_id ?? ""));
  const [numEmployees, setNumEmployees] = useState(
    String(story.number_of_employees ?? ""),
  );
  const [storyStatus, setStoryStatus] = useState(String(story.story_status));
  const [isOld, setIsOld] = useState(story.is_old ? "true" : "false");
  const [storyTimeSpent, setStoryTimeSpent] = useState(
    String(story.story_time_spent ?? ""),
  );

  const updateAction = async (_prevState: unknown, formData: FormData) => {
    formData.set("storyUuid", story.story_uuid);
    formData.set("requestUuid", requestUuid);
    formData.set("staffId", staffId);
    formData.set("numberOfEmployees", numEmployees);
    formData.set("storyStatus", storyStatus);
    formData.set("isOld", isOld);
    formData.set("storyTimeSpent", storyTimeSpent);

    const result = await updateStory(null, formData);
    if (result.operation === "success") {
      router.refresh();
    }
    return result;
  };

  const [state, formAction, pending] = useActionState(
    updateAction,
    null as { operation?: string; message?: string } | null,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Story</CardTitle>
          <CardDescription>
            Update story details including request, staff, and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="requestUuid">Request UUID</Label>
                <Input
                  id="requestUuid"
                  name="requestUuid"
                  value={requestUuid}
                  onChange={(e) => setRequestUuid(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storyTimeSpent">Time Spent (minutes)</Label>
                <Input
                  id="storyTimeSpent"
                  name="storyTimeSpent"
                  type="number"
                  value={storyTimeSpent}
                  onChange={(e) => setStoryTimeSpent(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="staffId">Staff ID</Label>
                <Input
                  id="staffId"
                  name="staffId"
                  type="number"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfEmployees">Number of Employees</Label>
                <Input
                  id="numberOfEmployees"
                  name="numberOfEmployees"
                  type="number"
                  value={numEmployees}
                  onChange={(e) => setNumEmployees(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="storyStatus">Status</Label>
                <Select
                  value={storyStatus}
                  onValueChange={(val) => setStoryStatus(val)}
                >
                  <SelectTrigger id="storyStatus" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Open</SelectItem>
                    <SelectItem value="1">In Progress</SelectItem>
                    <SelectItem value="2">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isOld">Old Record</Label>
                <Select value={isOld} onValueChange={(val) => setIsOld(val)}>
                  <SelectTrigger id="isOld" className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
              {state?.operation === "success" && (
                <span className="text-sm text-[#2e7d32] font-medium">
                  Saved successfully
                </span>
              )}
              {state?.operation === "error" && (
                <span className="text-sm text-[#d32f2f] font-medium">
                  {state.message}
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
            Deleting this story will remove it and may affect related records. This
            action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Story</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete story?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this story? This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await deleteStory(story.story_uuid);
                    router.push("/admin/story");
                    router.refresh();
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
