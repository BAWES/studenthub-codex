"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateSetting, deleteSetting } from "../actions";
import type { SessionUser } from "@/modules/auth/types";
import type { SettingDetail } from "@/modules/admin/settings/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface SettingDetailFormProps {
  session: SessionUser;
  setting: SettingDetail;
}

export function SettingDetailForm({ setting }: SettingDetailFormProps) {
  const router = useRouter();
  const [code, setCode] = useState(setting.code);
  const [key, setKey] = useState(setting.key);
  const [value, setValue] = useState(setting.value ?? "");
  const [serialized, setSerialized] = useState(setting.serialized ?? false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const result = await updateSetting({
      setting_uuid: setting.setting_uuid,
      code,
      key,
      value,
      serialized,
    });
    setSaving(false);
    if (result.success) {
      setMessage("Saved");
      router.refresh();
    } else {
      setMessage(result.message);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this setting?")) return;
    setDeleting(true);
    await deleteSetting({ setting_uuid: setting.setting_uuid });
    router.push("/admin/setting");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Button variant="ghost" onClick={() => router.push("/admin/setting")}>
        &larr; Back to Settings
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Setting Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key">Key</Label>
              <Input id="key" value={key} onChange={(e) => setKey(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Textarea id="value" value={value} onChange={(e) => setValue(e.target.value)} rows={6} />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="serialized"
              checked={serialized}
              onCheckedChange={(v) => setSerialized(v === true)}
            />
            <Label htmlFor="serialized" className="cursor-pointer">
              Serialized (JSON)
            </Label>
          </div>

          {message && (
            <p className={`text-sm ${message === "Saved" ? "text-green-600" : "text-destructive"}`}>
              {message}
            </p>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
