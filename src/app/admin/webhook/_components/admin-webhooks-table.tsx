1|"use client";
2|
3|import { useActionState, useState, useRef } from "react";
4|import { useRouter } from "next/navigation";
5|import { DataTable } from "@/modules/workspace/DataTable";
6|import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
7|
8|import type { SessionUser } from "@/modules/auth/types";
9|import type { WebhookItem } from "../schemas";
10|import { createWebhook, updateWebhook, deleteWebhook } from "../actions";
11|
12|type Props = {
13|  session: SessionUser;
14|  webhooks: WebhookItem[];
15|};
16|
17|const WEBHOOK_METHOD_OPTIONS = ["GET", "POST"] as const;
18|
19|export function AdminWebhooksTable({ session, webhooks }: Props) {
20|  const router = useRouter();
21|  const [editingId, setEditingId] = useState<number | null>(null);
22|
23|  return (
24|    <WorkspaceShell
25|      session={session}
26|      eyebrow="Admin settings"
27|      title="Manage webhooks — configure HTTP callbacks for system events."
28|      metrics={[
29|        { label: "Total webhooks", value: webhooks.length, note: "Webhooks in the system" },
30|      ]}
31|    >
32|      <section className="mb-6">
33|        <div className="rounded-lg border bg-card p-5">
34|          <h3 className="text-sm font-semibold mb-3 text-foreground">Add webhook</h3>
35|          <CreateWebhookForm onSuccess={() => router.refresh()} />
36|        </div>
37|      </section>
38|
39|      <DataTable
40|        title="Webhooks"
41|        description="All webhooks. Click a row to edit or delete."
42|        rows={webhooks.map((w) => ({ ...w, id: w.webhook_id }))}
43|        rowHref={undefined}
44|        columns={[
45|          {
46|            key: "event",
47|            label: "Event",
48|            render: (row) =>
49|              editingId === row.webhook_id ? (
50|                <EditWebhookForm
51|                  row={row}
52|                  onDone={() => { setEditingId(null); router.refresh(); }}
53|                  onCancel={() => setEditingId(null)}
54|                />
55|              ) : (
56|                <button
57|                  type="button"
58|                  className="text-sm hover:underline text-primary"
59|                  onClick={() => setEditingId(row.webhook_id)}
60|                >
61|                  {row.event}
62|                </button>
63|              ),
64|          },
65|          {
66|            key: "endpoint",
67|            label: "Endpoint",
68|            render: (row) => (
69|              <span className="text-sm truncate max-w-[200px] inline-block align-middle text-muted-foreground">
70|                {row.endpoint}
71|              </span>
72|            ),
73|          },
74|          {
75|            key: "method",
76|            label: "Method",
77|            render: (row) => (
78|              <span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
79|                {row.method ?? "—"}
80|              </span>
81|            ),
82|          },
83|          {
84|            key: "updated",
85|            label: "Last updated",
86|            render: (row) => {
87|              if (!row.updated_at) return "—";
88|              return new Date(row.updated_at).toLocaleDateString();
89|            },
90|          },
91|          {
92|            key: "created",
93|            label: "Created",
94|            render: (row) => {
95|              if (!row.created_at) return "—";
96|              return new Date(row.created_at).toLocaleDateString();
97|            },
98|          },
99|          {
100|            key: "actions",
101|            label: "Actions",
102|            render: (row) =>
103|              editingId !== row.webhook_id ? (
104|                <button
105|                  type="button"
106|                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
107|                  onClick={async () => {
108|                    if (confirm(`Delete webhook "${row.event}"?`)) {
109|                      const result = await deleteWebhook(row.webhook_id);
110|                      if (result.operation === "error") {
111|                        alert(result.message);
112|                      }
113|                      router.refresh();
114|                    }
115|                  }}
116|                >
117|                  Delete
118|                </button>
119|              ) : null,
120|          },
121|        ]}
122|      />
123|    </WorkspaceShell>
124|  );
125|}
126|
127|function CreateWebhookForm({ onSuccess }: { onSuccess: () => void }) {
128|  const [state, action, pending] = useActionState(
129|    async (_prev: { error?: string } | null, formData: FormData) => {
130|      const event = formData.get("event") as string;
131|      const endpoint = formData.get("endpoint") as string;
132|      const method = formData.get("method") as string;
133|      const result = await createWebhook(event, endpoint, method || undefined);
134|      if (result.operation === "success") {
135|        onSuccess();
136|        return { error: undefined };
137|      }
138|      return { error: result.message };
139|    },
140|    null,
141|  );
142|  const formRef = useRef<HTMLFormElement>(null);
143|
144|  return (
145|    <form
146|      ref={formRef}
147|      action={action}
148|      className="flex flex-wrap items-end gap-3"
149|      onSubmit={() => setTimeout(() => { formRef.current?.reset(); }, 100)}
150|    >
151|      <div className="grid gap-1">
152|        <label className="text-xs font-medium text-muted-foreground">Event</label>
153|        <input
154|          name="event"
155|          required
156|          maxLength={50}
157|          placeholder="e.g. user.created"
158|          className="h-9 rounded-lg px-3 text-sm border"
159|         
160|        />
161|      </div>
162|      <div className="grid gap-1">
163|        <label className="text-xs font-medium text-muted-foreground">Endpoint</label>
164|        <input
165|          name="endpoint"
166|          required
167|          maxLength={255}
168|          placeholder="https://hooks.example.com/notify"
169|          className="h-9 rounded-lg px-3 text-sm border"
170|         
171|        />
172|      </div>
173|      <div className="grid gap-1">
174|        <label className="text-xs font-medium text-muted-foreground">Method</label>
175|        <select
176|          name="method"
177|          defaultValue="POST"
178|          className="h-9 rounded-lg px-3 text-sm border"
179|         
180|        >
181|          <option value="">No method</option>
182|          {WEBHOOK_METHOD_OPTIONS.map((m) => (
183|            <option key={m} value={m}>{m}</option>
184|          ))}
185|        </select>
186|      </div>
187|      <button
188|        type="submit"
189|        disabled={pending}
190|        className="h-9 rounded-lg px-4 text-sm font-semibold bg-primary text-primary-foreground"
191|      >
192|        {pending ? "Adding..." : "Add"}
193|      </button>
194|      {state?.error ? (
195|        <p className="text-xs w-full text-destructive">{state.error}</p>
196|      ) : null}
197|    </form>
198|  );
199|}
200|
201|function EditWebhookForm({
202|  row,
203|  onDone,
204|  onCancel,
205|}: {
206|  row: WebhookItem;
207|  onDone: () => void;
208|  onCancel: () => void;
209|}) {
210|  const [state, action, pending] = useActionState(
211|    async (_prev: { error?: string } | null, formData: FormData) => {
212|      const event = formData.get("event") as string;
213|      const endpoint = formData.get("endpoint") as string;
214|      const method = formData.get("method") as string;
215|      const result = await updateWebhook(row.webhook_id, event, endpoint, method || undefined);
216|      if (result.operation === "success") {
217|        onDone();
218|        return { error: undefined };
219|      }
220|      return { error: result.message };
221|    },
222|    null,
223|  );
224|
225|  return (
226|    <form action={action} className="flex items-center gap-2 flex-wrap">
227|      <input
228|        name="event"
229|        defaultValue={row.event}
230|        required
231|        maxLength={50}
232|        className="h-8 rounded px-2 text-sm border w-32"
233|       
234|      />
235|      <input
236|        name="endpoint"
237|        defaultValue={row.endpoint}
238|        required
239|        maxLength={255}
240|        className="h-8 rounded px-2 text-sm border w-48"
241|       
242|      />
243|      <select
244|        name="method"
245|        defaultValue={row.method ?? ""}
246|        className="h-8 rounded px-2 text-sm border"
247|       
248|      >
249|        <option value="">No method</option>
250|        {WEBHOOK_METHOD_OPTIONS.map((m) => (
251|          <option key={m} value={m}>{m}</option>
252|        ))}
253|      </select>
254|      <button
255|        type="submit"
256|        disabled={pending}
257|        className="h-8 rounded px-3 text-xs font-semibold bg-primary text-primary-foreground"
258|      >
259|        {pending ? "..." : "Save"}
260|      </button>
261|      <button
262|        type="button"
263|        onClick={onCancel}
264|        className="h-8 rounded px-3 text-xs text-muted-foreground"
265|      >
266|        Cancel
267|      </button>
268|      {state?.error ? (
269|        <p className="text-xs text-destructive">{state.error}</p>
270|      ) : null}
271|    </form>
272|  );
273|}
274|