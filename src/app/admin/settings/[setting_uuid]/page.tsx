import { notFound, redirect } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getSettingDetail } from "@/modules/admin/settings/data";
import { updateSettingAction } from "@/modules/admin/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminSettingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;
  const setting = await getSettingDetail(id);

  if (!setting || !session) {
    notFound();
  }

  const s: NonNullable<typeof setting> = setting!;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Settings"
      title={`${s.code}: ${s.key}`}
      metrics={[]}
    >
      <Card>
        <CardHeader>
          <h2 className="text-xl">Edit Setting</h2>
          <p className="text-muted-foreground text-sm">
            Update the value for this configuration key.
          </p>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              const result = await updateSettingAction(id, null, formData);
              if (result.success) {
                redirect("/admin/settings");
              }
            }}
            className="grid gap-4 max-w-xl"
          >
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={s.code} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="key">Key</Label>
              <Input id="key" value={s.key} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Value</Label>
              <textarea
                id="value"
                name="value"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={s.value ?? ""}
                rows={6}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="hidden"
                name="serialized"
                value={s.serialized ? "true" : "false"}
              />
              <span className="text-sm text-muted-foreground">
                {s.serialized ? "Serialized (JSON)" : "Plain text"}
              </span>
            </div>
            <div className="flex gap-3">
              <Button type="submit">Save Changes</Button>
              <Button type="button" variant="outline" asChild>
                <a href="/admin/settings">Cancel</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </WorkspaceShell>
  );
}
