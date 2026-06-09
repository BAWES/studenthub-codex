1|"use client";
2|
3|import type { SessionUser } from "@/modules/auth/types";
4|import type { Route } from "next";
5|import { logoutAction } from "@/modules/auth/actions";
6|import { ThemeToggle } from "@/modules/theme/ThemeToggle";
7|import Link from "next/link";
8|import { navForRole } from "./navigation";
9|import { WorkspaceMobileNavigation, WorkspaceNavigation } from "./WorkspaceNavigation";
10|import { useWorkspaceOS } from "./WorkspaceOSContext";
11|import { EMPTY_NO_RECORDS, EMPTY_HINT_DEFAULT } from "./emptyStates";
12|
13|type Metric = {
14|  label: string;
15|  value: string | number;
16|  note: string;
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
27|export function WorkspaceShell({
28|  session,
29|  title,
30|  eyebrow,
31|  metrics,
32|  primary,
33|  secondary,
34|  children
35|}: {
36|  session: SessionUser;
37|  title: string;
38|  eyebrow: string;
39|  metrics: Metric[];
40|  primary?: { title: string; rows: Row[] };
41|  secondary?: { title: string; rows: Row[] };
42|  children?: React.ReactNode;
43|}) {
44|  const { embedded } = useWorkspaceOS();
45|  const navItems = navForRole(session.role);
46|
47|  const rail = (
48|    <aside className="workspaceRail" aria-label="Main navigation">
49|      <Link className="workspaceMark" href="/app" aria-label="StudentHub app">
50|        <span>SH</span>
51|        <strong>StudentHub</strong>
52|      </Link>
53|      <WorkspaceNavigation items={navItems} role={session.role} />
54|      <div className="workspaceRailFooter">
55|        <ThemeToggle />
56|        <form className="workspaceSignout" action={logoutAction}>
57|          <button type="submit">Sign out</button>
58|        </form>
59|      </div>
60|    </aside>
61|  );
62|
63|  const stage = (
64|    <section className="workspaceStage">
65|      <section className="topbar">
66|        <div>
67|          <p className="eyebrow">{eyebrow}</p>
68|          <h1>{title}</h1>
69|        </div>
70|        <div className="accountBox">
71|          <span>{session.role}</span>
72|          <strong>{session.name}</strong>
73|          <small>{session.email}</small>
74|        </div>
75|      </section>
76|
77|      {metrics.length ? (
78|        <section className="metrics" aria-label={`${session.role} workspace metrics`}>
79|          {metrics.map((metric) => (
80|            <article className="metric" key={metric.label}>
81|              <span>{metric.label}</span>
82|              <strong>{typeof metric.value === "number" ? metric.value.toLocaleString("en-US") : metric.value}</strong>
83|              <p>{metric.note}</p>
84|            </article>
85|          ))}
86|        </section>
87|      ) : null}
88|
89|      {children}
90|
91|      <section className="lists">
92|        {primary ? <WorkspaceList title={primary.title} rows={primary.rows} /> : null}
93|        {secondary ? <WorkspaceList title={secondary.title} rows={secondary.rows} /> : null}
94|      </section>
95|    </section>
96|  );
97|
98|  // When embedded in a WorkspaceOS layout, the layout already provides the rail and mobile nav.
99|  if (embedded) {
100|    return (
101|      <>
102|        <a
103|          href="#main-content"
104|          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded focus:ring-2 focus:ring-blue-500"
105|        >
106|          Skip to content
107|        </a>
108|        <main id="main-content" className="shell shellEmbedded">
109|          {stage}
110|          <WorkspaceMobileNavigation items={navItems} role={session.role} />
111|        </main>
112|      </>
113|    );
114|  }
115|
116|  return (
117|    <>
118|      <a
119|          href="#main-content"
120|          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded focus:ring-2 focus:ring-blue-500"
121|        >
122|          Skip to content
123|        </a>
124|      <main id="main-content" className="shell">
125|        {rail}
126|        {stage}
127|        <WorkspaceMobileNavigation items={navItems} role={session.role} />
128|      </main>
129|    </>
130|  );
131|}
132|
133|function WorkspaceList({ title, rows }: { title: string; rows: Row[] }) {
134|  return (
135|    <section className="dataList">
136|      <div className="listHeader">
137|        <h2>{title}</h2>
138|        <span>{rows.length}</span>
139|      </div>
140|      <div className="rows">
141|        {rows.length ? (
142|          rows.map((row) => (
143|            <article className="row" key={row.id}>
144|              <div className="rowMain">
145|                {row.href ? (
146|                  <Link href={row.href as Route}>
147|                    <strong>{row.title}</strong>
148|                  </Link>
149|                ) : (
150|                  <strong>{row.title}</strong>
151|                )}
152|                <span>{row.subtitle}</span>
153|              </div>
154|              <div className="rowMeta">{row.meta ? <span>{row.meta}</span> : null}</div>
155|            </article>
156|          ))
157|        ) : (
158|          <div className="emptyState">
159|            <strong>{EMPTY_NO_RECORDS}</strong>
160|            <span>{EMPTY_HINT_DEFAULT}</span>
161|          </div>
162|        )}
163|      </div>
164|    </section>
165|  );
166|}
167|