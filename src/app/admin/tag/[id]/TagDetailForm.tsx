"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateTag, deleteTag } from "@/modules/admin/tag/actions";
import type { TagListItem } from "@/modules/admin/tag/schemas";

type Props = {
  tag: TagListItem;
};

export function TagDetailForm({ tag }: Props) {
  const router = useRouter();
  const [name, setName] = useState(tag.tag);

  const updateAction = async () => {
    await updateTag({ tag_id: tag.tag_id, tag: name });
    return { success: true } as const;
  };

  const [state, formAction, pending] = useActionState(updateAction, null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Tag</CardTitle>
          <CardDescription>
            Update the tag name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tag">Tag Name</Label>
                <Input
                  id="tag"
                  name="tag"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
              {state?.success && (
                <span className="text-sm text-green-600 font-medium">
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
            Deleting this tag will remove it from all associated records.
            This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              await deleteTag(tag.tag_id);
              router.push("/admin/tag");
              router.refresh();
            }}
          >
            <Button type="submit" variant="destructive">
              Delete Tag
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
