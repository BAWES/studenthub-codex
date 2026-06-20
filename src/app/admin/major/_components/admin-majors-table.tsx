1|"use client";
2|
3|import { useActionState, useState, useRef } from "react";
4|import { useRouter } from "next/navigation";
5|import { DataTable } from "@/modules/workspace/DataTable";
6|import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
7|
8|import type { SessionUser } from "@/modules/auth/types";
9|import type { MajorItem } from "../schemas";
10|import { createMajor, updateMajor, deleteMajor } from "../actions";
11|
12|type Props = {
13|  session: SessionUser;
14|  majors: MajorItem[];
15|};
16|
17|export function AdminMajorsTable({ session, majors }: Props) {
18|  const router = useRouter();
19|  const [editingId, setEditingId] = useState<string | null>(null);
20|
21|  return (
22|    <WorkspaceShell
23|      session={session}
24|      eyebrow="Admin settings"
25|      title="Manage majors — fields of study candidates can select."
26|      metrics={[
27|        { label: "Total majors", value: majors.length, note: "Majors in the system" },
28|      ]}
29|    >
30|      <section className="mb-6">
31|        <div className="rounded-lg border bg-card p-5">
32|          <h3 className="text-sm font-semibold mb-3 text-foreground">Add major</h3>
33|          <CreateMajorForm onSuccess={() => router.refresh()} />
34|        </div>
35|      </section>
36|
37|      <DataTable
38|        title="Majors"
39|        description="All fields of study. Click a major name to edit or delete."
40|        rows={majors.map((m) => ({ ...m, id: m.major_uuid }))}
41|        rowHref={undefined}
42|        columns={[
43|          {
44|            key: "name_en",
45|            label: "Name (EN)",
46|            render: (row) =>
47|              editingId === row.major_uuid ? (
48|                <EditMajorForm
49|                  row={row}
50|                  onDone={() => { setEditingId(null); router.refresh(); }}
51|                  onCancel={() => setEditingId(null)}
52|                />
53|              ) : (
54|                <button
55|                  type="button"
56|                  className="text-sm hover:underline text-primary"
57|                  onClick={() => setEditingId(row.major_uuid)}
58|                >
59|                  {row.major_name_en}
60|                </button>
61|              ),
62|          },
63|          {
64|            key: "name_ar",
65|            label: "Name (AR)",
66|            render: (row) =>
67|              editingId === row.major_uuid ? null : (
68|                <span className="text-sm text-foreground">
69|                  {row.major_name_ar}
70|                </span>
71|              ),
72|          },
73|          {
74|            key: "updated",
75|            label: "Updated",
76|            render: (row) =>
77|              editingId === row.major_uuid ? null : (
78|                <span className="text-sm text-muted-foreground">
79|                  {row.major_updated_at
80|                    ? new Date(row.major_updated_at).toLocaleDateString()
81|                    : "—"}
82|                </span>
83|              ),
84|          },
85|          {
86|            key: "actions",
87|            label: "",
88|            render: (row) =>
89|              editingId !== row.major_uuid ? (
90|                <button
91|                  type="button"
92|                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
93|                  onClick={async () => {
94|                    if (confirm(`Delete major "${row.major_name_en}"?`)) {
95|                      const result = await deleteMajor(row.major_uuid);
96|                      if (result.operation === "error") {
97|                        alert(result.message);
98|                      }
99|                      router.refresh();
100|                    }
101|                  }}
102|                >
103|                  Delete
104|                </button>
105|              ) : null,
106|          },
107|        ]}
108|      />
109|    </WorkspaceShell>
110|  );
111|}
112|
113|function CreateMajorForm({ onSuccess }: { onSuccess: () => void }) {
114|  const [state, action, pending] = useActionState(
115|    async (_prev: { error?: string } | null, formData: FormData) => {
116|      const nameEn = formData.get("majorNameEn") as string;
117|      const nameAr = formData.get("majorNameAr") as string;
118|      const result = await createMajor(nameEn, nameAr);
119|      if (result.operation === "success") {
120|        onSuccess();
121|        return { error: undefined };
122|      }
123|      return { error: result.message };
124|    },
125|    null,
126|  );
127|  const formRef = useRef<HTMLFormElement>(null);
128|
129|  return (
130|    <form
131|      ref={formRef}
132|      action={action}
133|      className="flex flex-wrap items-end gap-3"
134|      onSubmit={() => setTimeout(() => { formRef.current?.reset(); }, 100)}
135|    >
136|      <div className="grid gap-1">
137|        <label className="text-xs font-medium text-muted-foreground">Name (EN) *</label>
138|        <input name="majorNameEn" required maxLength={150} placeholder="e.g. Computer Science"
139|          className="h-9 rounded-lg px-3 text-sm border w-48"
140|          />
141|      </div>
142|      <div className="grid gap-1">
143|        <label className="text-xs font-medium text-muted-foreground">Name (AR) *</label>
144|        <input name="majorNameAr" required maxLength={150} placeholder="علوم الحاسوب"
145|          className="h-9 rounded-lg px-3 text-sm border w-36"
146|          />
147|      </div>
148|      <button
149|        type="submit" disabled={pending}
150|        className="h-9 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground"
151|      >
152|        {pending ? "Adding..." : "Add"}
153|      </button>
154|      {state?.error ? (
155|        <p className="text-xs w-full text-destructive">{state.error}</p>
156|      ) : null}
157|    </form>
158|  );
159|}
160|
161|function EditMajorForm({
162|  row, onDone, onCancel,
163|}: {
164|  row: MajorItem;
165|  onDone: () => void;
166|  onCancel: () => void;
167|}) {
168|  const [state, action, pending] = useActionState(
169|    async (_prev: { error?: string } | null, formData: FormData) => {
170|      const nameEn = formData.get("majorNameEn") as string;
171|      const nameAr = formData.get("majorNameAr") as string;
172|      const result = await updateMajor(row.major_uuid, nameEn, nameAr);
173|      if (result.operation === "success") {
174|        onDone();
175|        return { error: undefined };
176|      }
177|      return { error: result.message };
178|    },
179|    null,
180|  );
181|
182|  return (
183|    <form action={action} className="flex items-center gap-2 flex-wrap">
184|      <input name="majorNameEn" defaultValue={row.major_name_en} required maxLength={150}
185|        className="h-8 rounded px-2 text-sm border w-40"
186|        />
187|      <input name="majorNameAr" defaultValue={row.major_name_ar} required maxLength={150}
188|        className="h-8 rounded px-2 text-sm border w-36"
189|        />
190|      <button type="submit" disabled={pending}
191|        className="h-8 rounded px-3 text-xs font-semibold bg-primary text-primary-foreground">
192|        {pending ? "..." : "Save"}
193|      </button>
194|      <button type="button" onClick={onCancel}
195|        className="h-8 rounded px-3 text-xs text-muted-foreground">
196|        Cancel
197|      </button>
198|      {state?.error ? (
199|        <p className="text-xs w-full text-destructive">{state.error}</p>
200|      ) : null}
201|    </form>
202|  );
203|}
204|