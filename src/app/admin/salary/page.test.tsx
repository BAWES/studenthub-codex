1|<<<<<<< HEAD
2|/**
3| * @vitest-environment node
4| */
5|
6|import { describe, it, expect } from "vitest";
7|import {
8|  salaryItemSchema,
9|  listSalariesResultSchema,
10|} from "@/modules/admin/salary/schemas";
11|
12|describe("admin salary page — data contract", () => {
13|  describe("salaryItemSchema", () => {
14|    it("validates a full salary entry", () => {
15|      const r = salaryItemSchema.safeParse({
16|        staff_salary_uuid: "sal-001",
17|        salary: 1500,
18|        salary_currency: "KWD",
19|        comment: "Monthly salary",
20|        salary_date: new Date("2026-06-01"),
21|      });
22|      expect(r.success).toBe(true);
23|      if (r.success) {
24|        expect(r.data.staff_salary_uuid).toBe("sal-001");
25|        expect(r.data.salary).toBe(1500);
26|      }
27|    });
28|
29|    it("accepts null optional fields", () => {
30|      const r = salaryItemSchema.safeParse({
31|        staff_salary_uuid: "sal-002",
32|        salary: null,
33|        salary_currency: null,
34|        comment: null,
35|        salary_date: null,
36|      });
37|      expect(r.success).toBe(true);
38|    });
39|
40|    it("rejects missing required staff_salary_uuid", () => {
41|      const r = salaryItemSchema.safeParse({
42|        salary: 1500,
43|      });
44|      expect(r.success).toBe(false);
45|    });
46|  });
47|
48|  describe("listSalariesResultSchema", () => {
49|    it("validates a list result", () => {
50|      const r = listSalariesResultSchema.safeParse({
51|        salaries: [
52|          {
53|            staff_salary_uuid: "sal-001",
54|            salary: 1500,
55|            salary_currency: "KWD",
56|            comment: "Monthly",
57|            salary_date: new Date("2026-06-01"),
58|          },
59|        ],
60|        total: 1,
61|      });
62|      expect(r.success).toBe(true);
63|      if (r.success) {
64|        expect(r.data.total).toBe(1);
65|        expect(r.data.salaries).toHaveLength(1);
66|      }
67|    });
68|
69|    it("validates empty list", () => {
70|      const r = listSalariesResultSchema.safeParse({
71|        salaries: [],
72|        total: 0,
73|      });
74|      expect(r.success).toBe(true);
75|    });
76|=======
77|import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
78|import { render, screen, cleanup } from "@testing-library/react";
79|
80|// Mock dependencies
81|vi.mock("@/modules/auth/session", () => ({
82|  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "1" }, role: "admin" }),
83|  requireCapability: vi.fn().mockResolvedValue(undefined),
84|}));
85|
86|vi.mock("@/modules/workspace/ErrorBoundary", () => ({
87|  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
88|}));
89|
90|vi.mock("@/modules/workspace/WorkspaceShell", () => ({
91|  WorkspaceShell: ({
92|    children,
93|    eyebrow,
94|    title,
95|    metrics,
96|  }: {
97|    children: React.ReactNode;
98|    eyebrow: string;
99|    title: string;
100|    metrics: { label: string; value: string | number; note: string }[];
101|  }) => (
102|    <div data-testid="workspace-shell">
103|      <div data-testid="eyebrow">{eyebrow}</div>
104|      <div data-testid="title">{title}</div>
105|      {metrics.map((m) => (
106|        <span key={m.label} data-testid={`metric-${m.label}`}>
107|          {String(m.value)}
108|        </span>
109|      ))}
110|      {children}
111|    </div>
112|  ),
113|}));
114|
115|vi.mock("@/modules/workspace/DetailPanels", () => ({
116|  DetailSection: ({
117|    title,
118|    facts,
119|  }: {
120|    title: string;
121|    facts?: { label: string; value: string | React.ReactNode }[];
122|  }) => (
123|    <div data-testid="detail-section">
124|      <div data-testid="section-title">{title}</div>
125|      {facts?.map((f) => (
126|        <span key={String(f.label)} data-testid={`fact-${f.label}`}>
127|          {String(f.value)}
128|        </span>
129|      ))}
130|    </div>
131|  ),
132|}));
133|
134|vi.mock("@/modules/workspace/DataTable", () => ({
135|  DataTable: ({
136|    title,
137|    description,
138|    columns,
139|    rows,
140|  }: {
141|    title: string;
142|    description: string;
143|    columns: { key: string; label: string; render: (row: any) => React.ReactNode }[];
144|    rows: any[];
145|  }) => (
146|    <div data-testid="data-table">
147|      <div data-testid="table-title">{title}</div>
148|      <div data-testid="table-description">{description}</div>
149|      <div data-testid="table-columns">
150|        {columns.map((col) => (
151|          <span key={col.key} data-testid={`col-${col.key}`}>
152|            {col.label}
153|          </span>
154|        ))}
155|      </div>
156|      <div data-testid="table-rows">
157|        {rows.map((row) => (
158|          <div key={row.id} data-testid={`row-${row.id}`}>
159|            {columns.map((col) => (
160|              <span key={col.key} data-testid={`cell-${row.id}-${col.key}`}>
161|                {col.render(row)}
162|              </span>
163|            ))}
164|          </div>
165|        ))}
166|      </div>
167|    </div>
168|  ),
169|}));
170|
171|vi.mock("@/modules/workspace/DataTableSkeleton", () => ({
172|  DataTableSkeleton: ({ rows }: { rows: number }) => (
173|    <div data-testid="skeleton">{rows} rows</div>
174|  ),
175|}));
176|
177|vi.mock("next/navigation", () => ({
178|  useRouter: () => ({ push: vi.fn() }),
179|}));
180|
181|// Import after mocks
182|import { AdminSalaryTable } from "./_components/admin-salary-table";
183|
184|const mockSalaries = [
185|  {
186|    staff_salary_uuid: "SAL-001",
187|    salary: 2500,
188|    salary_currency: "KWD",
189|    comment: "Monthly salary",
190|    salary_date: new Date("2026-06-01"),
191|  },
192|  {
193|    staff_salary_uuid: "SAL-002",
194|    salary: null,
195|    salary_currency: null,
196|    comment: null,
197|    salary_date: null,
198|  },
199|];
200|
201|type SessionUser = { user: { id: string }; role: string };
202|const mockSession: SessionUser = { user: { id: "1" }, role: "admin" };
203|
204|describe("AdminSalaryTable", () => {
205|  beforeEach(() => {
206|    cleanup();
207|  });
208|
209|  it("renders the workspace shell with title and eyebrow", () => {
210|    render(<AdminSalaryTable session={mockSession} salaries={[]} total={0} />);
211|    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin settings");
212|    expect(screen.getByTestId("title")).toHaveTextContent(/salaries/i);
213|  });
214|
215|  it("displays total salary count in metrics", () => {
216|    render(<AdminSalaryTable session={mockSession} salaries={[]} total={42} />);
217|    expect(screen.getByTestId("metric-Total salaries")).toHaveTextContent("42");
218|  });
219|
220|  it("renders the DataTable with correct columns", () => {
221|    render(<AdminSalaryTable session={mockSession} salaries={[]} total={0} />);
222|    expect(screen.getByTestId("col-salary")).toHaveTextContent("Salary");
223|    expect(screen.getByTestId("col-comment")).toHaveTextContent("Comment");
224|    expect(screen.getByTestId("col-salary_date")).toHaveTextContent("Date");
225|  });
226|
227|  it("renders salary rows with formatted values", () => {
228|    render(
229|      <AdminSalaryTable
230|        session={mockSession}
231|        salaries={mockSalaries}
232|        total={2}
233|      />,
234|    );
235|    expect(screen.getByTestId("row-SAL-001")).toBeInTheDocument();
236|    expect(screen.getByTestId("row-SAL-002")).toBeInTheDocument();
237|  });
238|
239|  it("formats salary with currency", () => {
240|    render(
241|      <AdminSalaryTable session={mockSession} salaries={[mockSalaries[0]]} total={1} />,
242|    );
243|    const cell = screen.getByTestId("cell-SAL-001-salary");
244|    expect(cell.textContent).toContain("2,500");
245|    expect(cell.textContent).toContain("KWD");
246|  });
247|
248|  it("shows em-dash for null salary", () => {
249|    render(
250|      <AdminSalaryTable session={mockSession} salaries={[mockSalaries[1]]} total={1} />,
251|    );
252|    const cell = screen.getByTestId("cell-SAL-002-salary");
253|    expect(cell.textContent).toBe("\u2014");
254|  });
255|
256|  it("shows em-dash for null comment", () => {
257|    render(
258|      <AdminSalaryTable session={mockSession} salaries={[mockSalaries[1]]} total={1} />,
259|    );
260|    const cell = screen.getByTestId("cell-SAL-002-comment");
261|    expect(cell.textContent).toBe("\u2014");
262|  });
263|
264|  it("shows em-dash for null salary_date", () => {
265|    render(
266|      <AdminSalaryTable session={mockSession} salaries={[mockSalaries[1]]} total={1} />,
267|    );
268|    const cell = screen.getByTestId("cell-SAL-002-salary_date");
269|    expect(cell.textContent).toBe("\u2014");
270|  });
271|
272|  it("formats salary_date into locale date string", () => {
273|    render(
274|      <AdminSalaryTable session={mockSession} salaries={[mockSalaries[0]]} total={1} />,
275|    );
276|    const cell = screen.getByTestId("cell-SAL-001-salary_date");
277|    expect(cell.textContent).toMatch(/2026/);
278|>>>>>>> 772524a9 (feat(admin): add admin/salary page — module-level CRUD with DataTable [STU-4044])
279|  });
280|});
281|