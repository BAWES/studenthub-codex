"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { SessionUser } from "@/modules/auth/types";
import type { DegreeItem } from "../schemas";
import { createDegree, updateDegree, deleteDegree, getDegreeGroupOptions } from "../actions";

type GroupOption = { degree_group_uuid: string; degree_group_name_en: string };

type Props = {
  session: SessionUser;
  degrees: DegreeItem[];
};

function groupName(degree: DegreeItem, groups: GroupOption[]): string {
  if (!degree.degree_group_uuid) return "—";
  return groups.find((g) => g.degree_group_uuid === degree.degree_group_uuid)
    ?.degree_group_name_en ?? "—";
}

export function AdminDegreeTable({ session, degrees }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [groupsLoaded, setGroupsLoaded] = useState(false);

  // Lazy-load degree groups for the inline edit form
  if (!groupsLoaded && degrees.length > 0) {
    getDegreeGroupOptions().then((g) => {
      setGroups(g);
      setGroupsLoaded(true);
    }).catch(() => {
      setGroups([]);
      setGroupsLoaded(true);
    });
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage degrees — organize degree classifications used across the system."
      metrics={[
        { label: "Total degrees", value: degrees.length, note: "Degree types in the system" },
      ]}
    >
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add degree</h3>
          <CreateDegreeForm onSuccess={() => router.refresh()} />
        </CardContent>
      </Card>

      <DataTable
        title="Degrees"
        description="All degrees. Edit in-line or delete."
        rows={degrees.map((d) => ({ ...d, id: d.degree_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "name_en",
            label: "English name",
            render: (row) =>
              editingId === row.degree_uuid ? (
                <EditDegreeForm
                  row={row as unknown as DegreeItem}
                  groups={groups}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm px-0 h-auto hover:underline"
                  onClick={() => setEditingId(row.degree_uuid)}
                >
                  {row.degree_name_en}
                </Button>
              ),
          },
          {
            key: "name_ar",
            label: "Arabic name",
            render: (row) => row.degree_name_ar || "—",
          },
          {
            key: "sort_order",
            label: "Sort",
            render: (row) => row.degree_sort_order ?? "—",
          },
          {
            key: "group",
            label: "Group",
            render: (row) => groupName(row as unknown as DegreeItem, groups),
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingId !== row.degree_uuid ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (confirm(`Delete degree "${row.degree_name_en}"?`)) {
                      await deleteDegree(row.degree_uuid);
                      router.refresh();
                    }
                  }}
                >
                  Delete
                </Button>
              ) : null,
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateDegreeForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("nameEn") as string;
      const nameAr = formData.get("nameAr") as string;
      const sortOrder = formData.get("sortOrder") as string;
      const groupUuid = formData.get("groupUuid") as string;
      try {
        await createDegree({
          degree_name_en: nameEn,
          degree_name_ar: nameAr || undefined,
          degree_sort_order: sortOrder ? Number(sortOrder) : undefined,
          degree_group_uuid: groupUuid || undefined,
        });
        onSuccess();
        return { error: undefined };
      } catch (e: unknown) {
        return { error: e instanceof Error ? e.message : "Failed to create degree" };
      }
    },
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-wrap items-end gap-3"
      onSubmit={() => setTimeout(() => { formRef.current?.reset(); }, 100)}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="nameEn">English name *</Label>
        <Input
          id="nameEn"
          name="nameEn"
          required
          maxLength={255}
          placeholder="e.g. Bachelor, Master, PhD"
          className="w-44"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="nameAr">Arabic name</Label>
        <Input
          id="nameAr"
          name="nameAr"
          maxLength={255}
          placeholder="الاسم بالعربية"
          className="w-44"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="sortOrder">Sort</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          placeholder="0"
          className="w-16"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add"}
      </Button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}

function EditDegreeForm({
  row,
  groups,
  onDone,
  onCancel,
}: {
  row: DegreeItem;
  groups: GroupOption[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("nameEn") as string;
      const nameAr = formData.get("nameAr") as string;
      const sortOrder = formData.get("sortOrder") as string;
      const groupUuid = formData.get("groupUuid") as string;
      try {
        await updateDegree(row.degree_uuid, {
          degree_name_en: nameEn,
          degree_name_ar: nameAr || undefined,
          degree_sort_order: sortOrder ? Number(sortOrder) : 0,
          degree_group_uuid: groupUuid || null,
        });
        onDone();
        return { error: undefined };
      } catch (e: unknown) {
        return { error: e instanceof Error ? e.message : "Failed to update degree" };
      }
    },
    null,
  );

  return (
    <form action={action} className="flex items-center gap-2 flex-wrap">
      <Input
        name="nameEn"
        defaultValue={row.degree_name_en}
        required
        maxLength={255}
        className="w-28 h-8"
      />
      <Input
        name="nameAr"
        defaultValue={row.degree_name_ar ?? ""}
        maxLength={255}
        placeholder="Name (AR)"
        className="w-28 h-8"
      />
      <Input
        name="sortOrder"
        defaultValue={row.degree_sort_order ?? ""}
        type="number"
        className="w-12 h-8"
      />
      <Select
        name="groupUuid"
        defaultValue={row.degree_group_uuid ?? ""}
      >
        <SelectTrigger className="w-28 h-8">
          <SelectValue placeholder="Group" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {groups.map((g) => (
            <SelectItem key={g.degree_group_uuid} value={g.degree_group_uuid}>
              {g.degree_group_name_en}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "..." : "Save"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      {state?.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
