"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import {
  listSettings,
  createSetting,
  updateSettingAction,
  deleteSettingAction,
} from "../actions";

import type { SessionUser } from "@/modules/auth/types";
import type { SettingItem } from "../schemas";

type Props = {
  session: SessionUser;
  initialSettings: SettingItem[];
  initialTotal: number;
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AdminSettingsTable({ session, initialSettings, initialTotal }: Props) {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingItem[]>(initialSettings);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(initialTotal / 50),
  );
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const limit = 50;

  // ── Fetch settings ────────────────────────────────────────────

  const fetchSettings = useCallback(
    async (q: string, p: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listSettings({ code: q || undefined, page: p, limit });
        setSettings(result.settings);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
        setSettings([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ── Search ───────────────────────────────────────────────────

  function handleSearch(q: string) {
    setSearchQuery(q);
    setPage(1);
    fetchSettings(q, 1);
  }

  // ── Pagination ───────────────────────────────────────────────

  function handlePageChange(newPage: number) {
    setPage(newPage);
    fetchSettings(searchQuery, newPage);
  }

  // ── Load on mount (if page was modified client-side) ─────────

  useEffect(() => {
    fetchSettings(searchQuery, page);
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Columns ──────────────────────────────────────────────────

  const columns = useMemo(
    () => [
      {
        header: "Code",
        cell: (row: SettingItem) => (
          <span className="text-sm font-medium text-foreground">
            {row.code}
          </span>
        ),
      },
      {
        header: "Key",
        cell: (row: SettingItem) => (
          <span className="text-sm text-foreground font-mono">
            {row.key}
          </span>
        ),
      },
      {
        header: "Value",
        cell: (row: SettingItem) =>
          editingId === row.setting_uuid ? (
            <EditSettingForm
              row={row}
              onDone={() => {
                setEditingId(null);
                fetchSettings(searchQuery, page);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="text-sm text-primary h-auto p-0 max-w-[300px] truncate text-left font-normal"
              onClick={() => setEditingId(row.setting_uuid)}
            >
              {row.value ?? "—"}
            </Button>
          ),
        className: "max-w-[400px]",
      },
      {
        header: "Serialized",
        cell: (row: SettingItem) =>
          editingId === row.setting_uuid ? null : (
            <Badge variant={row.serialized ? "default" : "secondary"}>
              {row.serialized ? "Yes" : "No"}
            </Badge>
          ),
        className: "hidden sm:table-cell",
      },
      {
        header: "Updated",
        cell: (row: SettingItem) =>
          editingId === row.setting_uuid ? null : (
            <span className="text-sm text-muted-foreground">
              {row.updated_at
                ? new Date(row.updated_at).toLocaleDateString()
                : "—"}
            </span>
          ),
        className: "hidden lg:table-cell",
      },
      {
        header: "",
        cell: (row: SettingItem) =>
          editingId !== row.setting_uuid ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete setting</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &ldquo;{row.code}/{row.key}&rdquo;? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      const result = await deleteSettingAction({
                        settingUuid: row.setting_uuid,
                      });
                      if (result.operation === "success") {
                        toast.success("Setting deleted", {
                          description: `"${row.code}/${row.key}" has been removed.`,
                        });
                      } else {
                        toast.error("Failed to delete", {
                          description: result.message,
                        });
                      }
                      fetchSettings(searchQuery, page);
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null,
      },
    ],
    [editingId, searchQuery, page, fetchSettings],
  );

  // ── Render ──────────────────────────────────────────────────

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="System Settings — application configuration key-value pairs."
      metrics={[
        { label: "Total settings", value: total, note: "Configuration entries in the system" },
      ]}
    >
      {/* Create form */}
      <section className="mb-6">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 text-card-foreground">Add setting</h3>
          <CreateSettingForm onSuccess={() => fetchSettings(searchQuery, page)} />
        </div>
      </section>

      {/* Toolbar: search */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="relative w-full max-w-xs">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="Filter by code…"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8 text-xs h-8"
          />
        </div>
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        rows={settings}
        rowKey={(row) => row.setting_uuid}
        loading={loading}
        error={error}
        emptyTitle="No settings found"
        emptyDescription={
          searchQuery
            ? `No settings match "${searchQuery}". Try a different filter.`
            : "No settings in the system yet."
        }
        skeletonRows={8}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-4">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} — {total} total entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}

// ---------------------------------------------------------------------------
// Create form
// ---------------------------------------------------------------------------

function CreateSettingForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const code = formData.get("code") as string;
      const key = formData.get("key") as string;
      const value = formData.get("value") as string;
      const serialized = formData.get("serialized") === "true";

      const result = await createSetting({ code, key, value: value || null, serialized });
      if (result.operation === "success") {
        onSuccess();
        return { error: undefined };
      }
      return { error: result.message };
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
      <div className="grid gap-1">
        <Label className="text-xs font-medium">Code *</Label>
        <Input name="code" required maxLength={128} placeholder="e.g. AppConfig" className="w-36" />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium">Key *</Label>
        <Input name="key" required maxLength={128} placeholder="site_name" className="w-36" />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium">Value</Label>
        <Input name="value" placeholder="Optional" className="w-48" />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium">Serialized</Label>
        <Select name="serialized" defaultValue="false">
          <SelectTrigger className="w-fit">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">No</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
          </SelectContent>
        </Select>
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

// ---------------------------------------------------------------------------
// Inline edit form
// ---------------------------------------------------------------------------

function EditSettingForm({
  row, onDone, onCancel,
}: {
  row: SettingItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const value = formData.get("value") as string;
      const result = await updateSettingAction({
        settingUuid: row.setting_uuid,
        value: value || null,
      });
      if (result.operation === "success") {
        onDone();
        return { error: undefined };
      }
      return { error: result.message };
    },
    null,
  );

  return (
    <form action={action} className="flex items-center gap-2 flex-wrap">
      <Input
        name="value"
        defaultValue={row.value ?? ""}
        className="w-48 h-8 text-sm"
        placeholder="New value"
      />
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "..." : "Save"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
