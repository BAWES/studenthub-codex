1|import type { Route } from "next";
2|import Link from "next/link";
3|<<<<<<< HEAD
4|import {
5|  Card,
6|  CardHeader,
7|  CardTitle,
8|  CardDescription,
9|} from "@/components/ui/card";
10|=======
11|import { Card, CardContent, CardHeader } from "@/components/ui/card";
12|>>>>>>> a3a2061c (refactor: convert DetailPanels and Skeletons to shadcn Card + Tailwind classes)
13|
14|type Fact = {
15|  label: string;
16|  value: string | number | null | undefined;
17|};
18|
19|type Row = {
20|  id: string | number;
21|  title: string;
22|  subtitle: string;
23|  meta?: string;
24|  href?: string;
25|};
26|
27|export function FactPanel({ title, facts }: { title: string; facts: Fact[] }) {
28|  return (
29|<<<<<<< HEAD
30|    <Card className="mt-5">
31|      <CardHeader className="px-[18px] py-[18px] border-b border-border">
32|        <CardTitle className="text-lg mb-0">{title}</CardTitle>
33|      </CardHeader>
34|      <div className="grid grid-cols-2 sm:grid-cols-4">
35|        {facts.map((fact) => (
36|          <div
37|            key={fact.label}
38|            className="min-h-[88px] p-4 border-r border-b border-border last:border-r-0 odd:last:border-r-0"
39|          >
40|            <span className="block mb-2 text-xs font-bold text-muted-foreground uppercase">
41|              {fact.label}
42|            </span>
43|            <strong className="block break-words text-[15px]">
44|              {fact.value || "Not set"}
45|            </strong>
46|          </div>
47|        ))}
48|      </div>
49|=======
50|    <Card>
51|      <CardHeader className="px-4 py-3.5 border-b border-border">
52|        <h2 className="text-sm font-bold m-0 text-foreground">{title}</h2>
53|      </CardHeader>
54|      <CardContent className="p-0">
55|        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 divide-x divide-y divide-border">
56|          {facts.map((fact) => (
57|            <div key={fact.label} className="min-h-[88px] p-4 grid content-start gap-1.5">
58|              <span className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
59|                {fact.label}
60|              </span>
61|              <strong className="text-sm text-foreground break-words">
62|                {fact.value ?? "Not set"}
63|              </strong>
64|            </div>
65|          ))}
66|        </div>
67|      </CardContent>
68|>>>>>>> a3a2061c (refactor: convert DetailPanels and Skeletons to shadcn Card + Tailwind classes)
69|    </Card>
70|  );
71|}
72|
73|export function CompactList({ title, rows }: { title: string; rows: Row[] }) {
74|  return (
75|<<<<<<< HEAD
76|    <Card className="mt-5">
77|      <div className="flex items-center justify-between gap-4 px-[18px] py-[14px] border-b border-border">
78|        <CardTitle className="text-base mb-0">{title}</CardTitle>
79|        <span className="text-sm font-bold text-muted-foreground">
80|          {rows.length}
81|        </span>
82|      </div>
83|      <div className="grid">
84|=======
85|    <Card>
86|      <div className="flex items-center justify-between gap-4 px-4 py-3.5 border-b border-border">
87|        <h2 className="text-sm font-bold m-0 text-foreground">{title}</h2>
88|        <span className="min-w-[28px] min-h-[28px] inline-flex items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
89|          {rows.length}
90|        </span>
91|      </div>
92|      <div className="grid divide-y divide-border">
93|>>>>>>> a3a2061c (refactor: convert DetailPanels and Skeletons to shadcn Card + Tailwind classes)
94|        {rows.length ? (
95|          rows.map((row) => (
96|            <article
97|              key={row.id}
98|<<<<<<< HEAD
99|              className="grid grid-cols-[1fr_minmax(126px,auto)] gap-4 px-4 py-[14px] border-b border-border last:border-b-0"
100|            >
101|              <div className="min-w-0 grid gap-0.5 content-center">
102|                {row.href ? (
103|                  <Link href={row.href as Route}>
104|                    <strong className="text-foreground text-sm">{row.title}</strong>
105|                  </Link>
106|                ) : (
107|                  <strong className="text-foreground text-sm">{row.title}</strong>
108|                )}
109|                <span className="text-muted-foreground text-xs">{row.subtitle}</span>
110|              </div>
111|              {row.meta ? (
112|                <div className="flex items-center justify-end text-muted-foreground text-xs">
113|                  {row.meta}
114|=======
115|              className="min-h-[72px] grid grid-cols-[1fr_minmax(100px,auto)] gap-4 px-4 py-3"
116|            >
117|              <div className="min-w-0 grid content-center gap-1.5">
118|                {row.href ? (
119|                  <Link
120|                    href={row.href as Route}
121|                    className="text-sm font-medium text-foreground no-underline hover:text-blue-zendesk hover:underline underline-offset-2"
122|                  >
123|                    {row.title}
124|                  </Link>
125|                ) : (
126|                  <strong className="text-sm font-medium text-foreground">
127|                    {row.title}
128|                  </strong>
129|                )}
130|                <span className="text-xs text-muted-foreground">{row.subtitle}</span>
131|              </div>
132|              {row.meta ? (
133|                <div className="flex items-center justify-end min-w-0">
134|                  <span className="text-xs text-muted-foreground text-right">
135|                    {row.meta}
136|                  </span>
137|>>>>>>> a3a2061c (refactor: convert DetailPanels and Skeletons to shadcn Card + Tailwind classes)
138|                </div>
139|              ) : null}
140|            </article>
141|          ))
142|        ) : (
143|<<<<<<< HEAD
144|          <p className="text-muted-foreground text-sm text-center py-6 m-0">
145|            No imported records found here yet.
146|          </p>
147|=======
148|          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
149|            No imported records found here yet.
150|          </div>
151|>>>>>>> a3a2061c (refactor: convert DetailPanels and Skeletons to shadcn Card + Tailwind classes)
152|        )}
153|      </div>
154|    </Card>
155|  );
156|}
157|