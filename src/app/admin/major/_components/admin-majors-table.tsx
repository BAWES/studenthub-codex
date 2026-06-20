"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { MajorItem } from "../schemas";
import { createMajor, updateMajor, deleteMajor } from "../actions";

type Props = {
  session: SessionUser;
  majors: MajorItem[];
};

export function AdminMajorsTable({ session, majors }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage majors — organize academic majors across the system."
      metrics={[
        {
          label: "Total majors",
          value: majors.length,
          note: "Majors in the system",
        },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--ink)" }}
          >
            Add major
          </h3>
          <CreateMajorForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Majors"
        description="All majors. Click a row to edit or delete."
        rows={majors.map((m) => ({ ...m, id: m.major_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "major_name_en",
            label: "English name",
            render: (row) =>
              editingId === row.major_uuid ? (
                <EditMajorForm
                  row={row}
                  onDone={() => {
                    setEditingId(null);
                    router.refresh();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline"
                  style={{ color: "var(--sh-primary)" }}
                  onClick={() => setEditingId(row.major_uuid)}
                >
                  {row.major_name_en}
                </button>
              ),
          },
          {
            key: "major_name_ar",
            label: "Arabic name",
            render: (row) => (
              <span className="text-sm" style={{ color: "var(--ink)" }}>
                {row.major_name_ar}
              </span>
            ),
          },
          {
            key: "data_source",
            label: "Data source",
            render: (row) => {
              if (row.data_source == null) return "—";
              return String(row.data_source);
            },
          },
          {
            key: "updated",
            label: "Last updated",
            render: (row) => {
              if (!row.major_updated_at) return "—";
              return new Date(row.major_updated_at).toLocaleDateString();
            },
          },
          {
            key: "created",
            label: "Created",
            render: (row) => {
              if (!row.major_created_at) return "—";
              return new Date(row.major_created_at).toLocaleDateString();
            },
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingId !== row.major_uuid ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10"
                  style={{ color: "var(--sh-error)" }}
                  onClick={async () => {
                    if (
                      confirm(`Delete major "${row.major_name_en}"?`)
                    ) {
                      const result = await deleteMajor(row.major_uuid);
                      if (result.operation === "error") {
                        alert(result.message);
                      }
                      router.refresh();
                    }
                  }}
                >
                  Delete
                </button>
              ) : null,
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateMajorForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("majorNameEn") as string;
      const nameAr = formData.get("majorNameAr") as string;
      const dsRaw = formData.get("dataSource") as string;
      const dataSource = dsRaw ? Number(dsRaw) : null;
      const result = await createMajor(nameEn, nameAr, dataSource);
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
      onSubmit={() =>
        setTimeout(() => {
          formRef.current?.reset();
        }, 100)
      }
    >
      <div className="grid gap-1">
        <label
          className="text-xs font-medium"
          style={{ color: "var(--muted)" }}
        >
          English name
        </label>
        <input
          name="majorNameEn"
          required
          maxLength={150}
          placeholder="e.g. Computer Science"
          className="h-9 rounded-lg px-3 text-sm border"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--ink)",
          }}
        />
      </div>
      <div className="grid gap-1">
        <label
          className="text-xs font-medium"
          style={{ color: "var(--muted)" }}
        >
          Arabic name
        </label>
        <input
          name="majorNameAr"
          required
          maxLength={150}
          placeholder="e.g. علوم الحاسوب"
          className="h-9 rounded-lg px-3 text-sm border"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--ink)",
          }}
        />
      </div>
      <div className="grid gap-1">
        <label
          className="text-xs font-medium"
          style={{ color: "var(--muted)" }}
        >
          Data source
        </label>
        <input
          name="dataSource"
          type="number"
          placeholder="Optional"
          className="h-9 rounded-lg px-3 text-sm border w-24"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--ink)",
          }}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg px-4 text-sm font-semibold"
        style={{ background: "var(--sh-primary)", color: "#fff" }}
      >
        {pending ? "Adding..." : "Add"}
      </button>
      {state?.error ? (
        <p className="text-xs w-full" style={{ color: "var(--sh-error)" }}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function EditMajorForm({
  row,
  onDone,
  onCancel,
}: {
  row: MajorItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("majorNameEn") as string;
      const nameAr = formData.get("majorNameAr") as string;
      const dsRaw = formData.get("dataSource") as string;
      const dataSource = dsRaw ? Number(dsRaw) : null;
      const result = await updateMajor(
        row.major_uuid,
        nameEn,
        nameAr,
        dataSource,
      );
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
      <input
        name="majorNameEn"
        defaultValue={row.major_name_en}
        required
        maxLength={150}
        className="h-8 rounded px-2 text-sm border w-36"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--ink)",
        }}
      />
      <input
        name="majorNameAr"
        defaultValue={row.major_name_ar}
        required
        maxLength={150}
        className="h-8 rounded px-2 text-sm border w-36"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--ink)",
        }}
      />
      <input
        name="dataSource"
        type="number"
        defaultValue={row.data_source ?? ""}
        className="h-8 rounded px-2 text-sm border w-20"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--ink)",
        }}
      />
      <button
        type="submit"
        disabled={pending}
        className="h-8 rounded px-3 text-xs font-semibold"
        style={{ background: "var(--sh-primary)", color: "#fff" }}
      >
        {pending ? "..." : "Save"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="h-8 rounded px-3 text-xs"
        style={{ color: "var(--muted)" }}
      >
        Cancel
      </button>
      {state?.error ? (
        <p className="text-xs" style={{ color: "var(--sh-error)" }}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
