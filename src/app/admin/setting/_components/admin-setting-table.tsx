"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import type { Route } from "next";

import type { SessionUser } from "@/modules/auth/types";
import type { SettingItem } from "@/modules/admin/setting/schemas";
import { createSetting, deleteSettingAction } from "@/modules/admin/setting/actions";

type Props = {
  session: SessionUser;
  records: SettingItem[];
};

export function AdminSettingTable({ session, records }: Props) {
  const router = useRouter();

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Settings — manage application configuration."
      metrics={[
        { label: "Settings", value: records.length, note: "Config entries" },
      ]}
    >
      <section className="mb-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add a setting</h3>
          <CreateSettingForm onSuccess={() => router.refresh()} />
        </Card>
      </section>

      <DataTable
        title="Settings"
        description="List of all application settings."
        rows={records.map((r) => ({ ...r, id: r.setting_uuid }))}
        rowHref={(row) => `/admin/setting/${row.setting_uuid}` as Route}
        columns={[
          {
            key: "code",
            label: "Code",
            render: (row) => (
              <Badge variant="outline" className="font-mono text-xs">
                {row.code ?? "—"}
              </Badge>
            ),
          },
          {
            key: "key",
            label: "Key",
            render: (row) => (
              <span className="text-sm font-mono font-medium text-foreground">
                {row.key ?? "—"}
              </span>
            ),
          },
          {
            key: "value",
            label: "Value",
            render: (row) => (
              <span className="text-sm text-muted-foreground truncate max-w-[300px] inline-block">
                {row.value ?? "—"}
              </span>
            ),
          },
          {
            key: "serialized",
            label: "Serialized",
            render: (row) =>
              row.serialized ? (
                <Badge variant="secondary" className="text-xs">Yes</Badge>
              ) : (
                <span className="text-xs text-muted-foreground">No</span>
              ),
          },
          {
            key: "actions",
            label: "",
            render: (row) => (
              <DeleteSettingButton
                settingUuid={row.setting_uuid}
                settingKey={`${row.code}.${row.key}`}
                onDelete={async () => {
                  await deleteSettingAction({ settingUuid: row.setting_uuid });
                  router.refresh();
                }}
              />
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function DeleteSettingButton({
  settingUuid,
  settingKey,
  onDelete,
}: {
  settingUuid: string;
  settingKey: string;
  onDelete: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete setting</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{settingKey}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError(null);
              try {
                await onDelete();
                setOpen(false);
              } catch {
                setError("Failed to delete setting");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CreateSettingForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const code = formData.get("code") as string;
      const key = formData.get("key") as string;
      const value = formData.get("value") as string;
      const serialized = formData.get("serialized") === "true";

      try {
        await createSetting({ code, key, value, serialized });
        onSuccess();
        return { error: undefined };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Failed to create setting" };
      }
    },
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end"
      onSubmit={() => setTimeout(() => { formRef.current?.reset(); }, 100)}
    >
      <div className="grid gap-1">
        <Label className="text-xs font-medium text-muted-foreground">Code</Label>
        <Input name="code" maxLength={128} placeholder="e.g. app, email, sms" />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium text-muted-foreground">Key</Label>
        <Input name="key" maxLength={128} placeholder="e.g. site_name" />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium text-muted-foreground">Value</Label>
        <Input name="value" placeholder="e.g. StudentHub" />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium text-muted-foreground">Serialized</Label>
        <Select name="serialized" defaultValue="false">
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">No</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="col-span-2 md:col-span-4 justify-self-start"
      >
        {pending ? "Adding..." : "Add Setting"}
      </Button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive col-span-full">{state.error}</p>
      ) : null}
    </form>
  );
}
