"use client";

import { useActionState, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { updateSettingAction, deleteSettingAction } from "../actions";

interface SettingDetail {
  setting_uuid: string;
  code: string;
  key: string;
  value: string | null;
  serialized: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export function SettingDetailForm({
  setting,
}: {
  setting: SettingDetail;
}) {
  const router = useRouter();
  const [code, setCode] = useState(setting.code);
  const [key, setKey] = useState(setting.key);
  const [value, setValue] = useState(setting.value ?? "");
  const [serialized, setSerialized] = useState(setting.serialized ?? false);

  const updateAction = async (_prevState: unknown, formData: FormData) => {
    formData.set("code", code);
    formData.set("key", key);
    formData.set("value", value);
    formData.set("serialized", serialized ? "true" : "");

    await updateSettingAction({
      settingUuid: setting.setting_uuid,
      value: value || null,
    });
    return { success: true } as const;
  };

  const [state, formAction, pending] = useActionState(
    updateAction,
    null,
  ) as unknown as [state: { success?: boolean } | null, formAction: () => void, pending: boolean];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Setting</CardTitle>
          <CardDescription>
            Update the setting code, key, and value.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  name="key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Textarea
                id="value"
                name="value"
                value={value}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="serialized"
                checked={serialized}
                onCheckedChange={(val: boolean) => setSerialized(val)}
              />
              <Label htmlFor="serialized">Serialized (JSON/encoded)</Label>
              {serialized && (
                <Badge variant="warning">JSON</Badge>
              )}
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
            Deleting this setting will permanently remove it. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Setting</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete setting</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &ldquo;{setting.code}/{setting.key}&rdquo;? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    const result = await deleteSettingAction({
                      settingUuid: setting.setting_uuid,
                    });
                    if (result.operation === "success") {
                      toast.success("Setting deleted");
                      router.push("/admin/setting");
                    } else {
                      toast.error("Failed to delete", {
                        description: result.message,
                      });
                    }
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
