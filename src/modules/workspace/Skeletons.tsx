1|"use client";
2|
3|/** Shimmer skeleton block used by DataTable. */
4|function ShimmerBlock({ className = "" }: { className?: string }) {
5|  return (
6|    <div
7|      data-slot="skeleton"
8|<<<<<<< HEAD
9|      className={`animate-pulse rounded bg-muted ${className}`}
10|=======
11|      className={`animate-pulse rounded-md bg-muted ${className}`}
12|>>>>>>> 96d77fc6 (style: replace glass + inline styles with Tailwind in skeletons and data-table [STU-4009])
13|      aria-hidden="true"
14|    />
15|  );
16|}
17|
18|/** Full-page skeleton matching the WorkspaceShell layout for route transitions. */
19|export function WorkspaceShellSkeleton({ rowCount = 8 }: { rowCount?: number }) {
20|  return (
21|    <div className="block">
22|      <section className="overflow-x-hidden grid content-start gap-3.5 p-3.5">
23|        {/* Topbar */}
24|        <section className="sticky top-2.5 z-20 flex items-center justify-between gap-3 min-h-14 px-4 mb-1 rounded-lg bg-card border border-border">
25|          <div>
26|            <ShimmerBlock className="h-3 w-24 mb-2" />
27|            <ShimmerBlock className="h-7 w-64" />
28|          </div>
29|          <div className="flex items-center gap-2.5 min-h-10 rounded-md bg-card border border-border px-3">
30|            <ShimmerBlock className="h-3 w-12" />
31|            <ShimmerBlock className="h-4 w-28" />
32|            <ShimmerBlock className="h-3 w-40" />
33|          </div>
34|        </section>
35|
36|        {/* Metrics */}
37|        <section
38|          className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5"
39|          aria-label="Loading metrics"
40|        >
41|          {[1, 2, 3, 4].map((i) => (
42|            <article
43|              className="min-h-[100px] grid content-start gap-1.5 p-4 rounded-lg bg-card border border-border shadow-sm"
44|              key={i}
45|            >
46|              <ShimmerBlock className="h-3 w-16 mb-2" />
47|              <ShimmerBlock className="h-9 w-20 mb-1" />
48|              <ShimmerBlock className="h-3 w-12" />
49|            </article>
50|          ))}
51|        </section>
52|
53|        {/* Content area */}
54|<<<<<<< HEAD
55|        <div className="grid gap-3.5 p-[18px_22px]">
56|=======
57|        <div className="p-[18px_22px] grid gap-3.5">
58|>>>>>>> 96d77fc6 (style: replace glass + inline styles with Tailwind in skeletons and data-table [STU-4009])
59|          <ShimmerBlock className="h-6 w-48" />
60|          <ShimmerBlock className="h-40 w-full rounded-lg" />
61|        </div>
62|
63|        {/* Data lists */}
64|        <section className="grid gap-2">
65|          {[1, 2].map((col) => (
66|            <section className="grid gap-2" key={col}>
67|              <div className="flex items-center justify-between px-1">
68|                <ShimmerBlock className="h-4 w-32" />
69|                <ShimmerBlock className="h-5 w-8 rounded-full" />
70|              </div>
71|              <div className="grid gap-[3px]">
72|                {Array.from({ length: rowCount }).map((_, i) => (
73|                  <article
74|                    className="flex items-center justify-between gap-3 min-h-11 px-3 py-2 rounded-sm bg-card border border-transparent"
75|                    key={i}
76|                  >
77|                    <div className="grid gap-0.5 min-w-0">
78|                      <ShimmerBlock className="h-4 w-48 mb-1" />
79|                      <ShimmerBlock className="h-3 w-64" />
80|                    </div>
81|                    <div className="shrink-0">
82|                      <ShimmerBlock className="h-3 w-16" />
83|                    </div>
84|                  </article>
85|                ))}
86|              </div>
87|            </section>
88|          ))}
89|        </section>
90|      </section>
91|    </div>
92|  );
93|}
94|
95|/** Skeleton for data-table list pages. Clean card with shimmer. */
96|export function DataTableSkeleton({ rows = 10 }: { rows?: number }) {
97|  return (
98|    <div className="rounded-lg border bg-white shadow-sm p-[18px_22px]">
99|      {/* Header */}
100|      <div className="flex justify-between items-center mb-2">
101|        <ShimmerBlock className="h-6 w-40" />
102|        <ShimmerBlock className="h-8 w-28" />
103|      </div>
104|
105|      {/* Filter/search bar */}
106|      <div className="flex gap-2.5 mb-1">
107|        <ShimmerBlock className="h-9 flex-1" />
108|        <ShimmerBlock className="h-9 w-24" />
109|      </div>
110|
111|      {/* Rows */}
112|      <div className="grid gap-px">
113|        {/* Header row */}
114|<<<<<<< HEAD
115|        <div
116|          style={{
117|            display: "grid",
118|            gridTemplateColumns: "1fr 1fr 120px 100px",
119|            gap: 12,
120|            padding: "10px 14px",
121|            borderBottom: "1px solid var(--border)",
122|          }}
123|        >
124|=======
125|        <div className="grid grid-cols-[1fr_1fr_120px_100px] gap-3 px-[14px] py-[10px] border-b border-border">
126|>>>>>>> 96d77fc6 (style: replace glass + inline styles with Tailwind in skeletons and data-table [STU-4009])
127|          <ShimmerBlock className="h-3 w-20" />
128|          <ShimmerBlock className="h-3 w-24" />
129|          <ShimmerBlock className="h-3 w-16" />
130|          <ShimmerBlock className="h-3 w-16" />
131|        </div>
132|        {Array.from({ length: rows }).map((_, i) => (
133|          <div
134|            key={i}
135|<<<<<<< HEAD
136|            style={{
137|              display: "grid",
138|              gridTemplateColumns: "1fr 1fr 120px 100px",
139|              gap: 12,
140|              padding: "12px 14px",
141|              borderBottom: "1px solid var(--border)",
142|            }}
143|=======
144|            className="grid grid-cols-[1fr_1fr_120px_100px] gap-3 px-[14px] py-3 border-b border-border"
145|>>>>>>> 96d77fc6 (style: replace glass + inline styles with Tailwind in skeletons and data-table [STU-4009])
146|          >
147|            <ShimmerBlock className="h-4 w-44" />
148|            <ShimmerBlock className="h-3 w-56" />
149|            <ShimmerBlock className="h-5 w-20" />
150|            <ShimmerBlock className="h-4 w-16" />
151|          </div>
152|        ))}
153|      </div>
154|    </div>
155|  );
156|}
157|
158|/** Compact skeleton for detail pages with fact panels. */
159|export function DetailPageSkeleton({ panels = 3 }: { panels?: number }) {
160|  return (
161|    <div className="p-[18px_22px] grid gap-3.5">
162|      {/* Action bar placeholder */}
163|      <div className="rounded-lg border bg-white shadow-sm p-5">
164|        <ShimmerBlock className="h-24 w-full" />
165|      </div>
166|
167|      {/* Hero section */}
168|      <div className="rounded-lg border bg-white shadow-sm p-5">
169|        <ShimmerBlock className="h-48 w-full" />
170|      </div>
171|
172|      {/* Fact panels */}
173|      <div className="grid grid-cols-2 gap-3">
174|        {Array.from({ length: panels }).map((_, i) => (
175|          <div key={i} className="rounded-lg border bg-white shadow-sm p-4">
176|            <ShimmerBlock className="h-4 w-24 mb-3" />
177|            {[1, 2, 3, 4].map((r) => (
178|              <div key={r} className="flex justify-between mb-2">
179|                <ShimmerBlock className="h-3 w-16" />
180|                <ShimmerBlock className="h-3 w-32" />
181|              </div>
182|            ))}
183|          </div>
184|        ))}
185|      </div>
186|
187|      {/* Related lists */}
188|      <div className="grid grid-cols-2 gap-3">
189|        {[1, 2].map((col) => (
190|          <div key={col} className="rounded-lg border bg-white shadow-sm p-4">
191|            <ShimmerBlock className="h-4 w-32 mb-3" />
192|            {[1, 2, 3, 4].map((r) => (
193|              <ShimmerBlock key={r} className="h-10 w-full mb-2" />
194|            ))}
195|          </div>
196|        ))}
197|      </div>
198|    </div>
199|  );
200|}
201|
202|/** Lightweight top-of-page pulse skeleton for Suspense fallbacks. */
203|export function QuickSkeleton({ lines = 4 }: { lines?: number }) {
204|  return (
205|    <div className="p-[14px_22px] grid gap-2">
206|      {Array.from({ length: lines }).map((_, i) => (
207|        <ShimmerBlock key={i} className={`h-${i === 0 ? 5 : 3} w-${i === 0 ? 48 : 36}`} />
208|      ))}
209|    </div>
210|  );
211|}
212|