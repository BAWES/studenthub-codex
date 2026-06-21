1|import Link from "next/link";
2|import type { Route } from "next";
3|import { UserRound, Briefcase, Building2, Shield, ClipboardCheck } from "lucide-react";
4|import { getSession } from "@/modules/auth/session";
5|import { portalContent } from "@/modules/auth/portalContent";
6|import { ThemeToggle } from "@/modules/theme/ThemeToggle";
7|import { Button } from "@/components/ui/button";
8|import { Card, CardContent } from "@/components/ui/card";
9|
10|export const dynamic = "force-dynamic";
11|
12|const benefits = [
13|  {
14|    title: "Purpose-built portals",
15|    body: "Each role gets exactly the right tools — no clutter, no missing features, no one-size-fits-all compromises.",
16|  },
17|  {
18|    title: "Smart candidate search",
19|    body: "Typo-tolerant, filter-rich search across countries, skills, and statuses. Saved searches for repeat workflows.",
20|  },
21|  {
22|    title: "End-to-end workflows",
23|    body: "From profile readiness to timesheets and payments — every step is connected in one system.",
24|  },
25|  {
26|    title: "Production-grade foundation",
27|    body: "Built for real data volumes, real teams, and real compliance — not a prototype.",
28|  },
29|];
30|
31|const portalRoles = ["candidate", "staff", "company", "admin", "inspector"] as const;
32|
33|const portalIcons: Record<(typeof portalRoles)[number], React.ComponentType<{ className?: string }>> = {
34|  candidate: UserRound,
35|  staff: Briefcase,
36|  company: Building2,
37|  admin: Shield,
38|  inspector: ClipboardCheck
39|};
40|
41|export default async function Home() {
42|  const session = await getSession();
43|
44|  return (
45|    <main className="min-h-svh w-[min(1320px,calc(100%_-_28px))] mx-auto grid content-start gap-4 pt-[18px] pb-[42px] max-sm:w-[min(calc(100%_-_20px),720px)]">
46|      {/* Nav */}
47|      <nav
48|        className="sticky top-3 z-20 min-h-[62px] flex items-center justify-between gap-3.5 border border-[color-mix(in_srgb,var(--line)_84%,transparent)] rounded-lg bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-2 shadow-[0_18px_50px_rgba(16,24,40,0.08)] max-sm:static max-sm:flex-col max-sm:items-stretch"
49|        aria-label="StudentHub public navigation"
50|      >
51|        <Link
52|          className="inline-flex items-center gap-2.5 text-[var(--ink)] px-2 no-underline min-h-11"
53|          href="/"
54|        >
55|          <span className="size-9 inline-flex items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--surface)] font-black">
56|            SH
57|          </span>
58|          <strong>StudentHub</strong>
59|        </Link>
60|        <div className="flex items-center gap-3.5 max-sm:flex-col max-sm:items-stretch">
61|          {session ? (
62|            <Button variant="outline" asChild>
63|              <Link href="/app">Open app</Link>
64|            </Button>
65|          ) : (
66|            <Button variant="outline" asChild>
67|              <Link href="/login">Sign in</Link>
68|            </Button>
69|          )}
70|          <ThemeToggle />
71|        </div>
72|      </nav>
73|
74|      {/* Hero */}
75|      <section className="relative min-h-[min(760px,calc(100svh_-_96px))] grid grid-cols-1 items-center overflow-hidden border border-[var(--line)] rounded-lg bg-[var(--surface)] p-[clamp(22px,5vw,76px)] max-lg:min-h-auto max-lg:p-7 after:absolute after:inset-0 after:pointer-events-none after:bg-[linear-gradient(90deg,var(--surface)_0%,color-mix(in_srgb,var(--surface)_94%,transparent)_38%,transparent_78%),linear-gradient(180deg,transparent_72%,var(--surface)_100%)] max-lg:after:bg-[linear-gradient(180deg,var(--surface)_0%,color-mix(in_srgb,var(--surface)_94%,transparent)_56%,var(--surface)_100%)]">
76|        {/* Decorative stage */}
77|        <div
78|          className="absolute inset-0 grid place-items-center place-content-end p-[clamp(20px,4vw,58px)] opacity-[0.96] max-lg:relative max-lg:min-h-[360px] max-lg:order-2 max-lg:p-0 max-lg:pt-[18px]"
79|          aria-hidden="true"
80|        >
81|          <div className="w-[min(880px,72vw)] min-h-[510px] grid grid-cols-[132px_minmax(0,1fr)_220px] gap-2.5 border border-[var(--line)] rounded-lg bg-[color-mix(in_srgb,var(--surface-soft)_92%,transparent)] p-2.5 shadow-[var(--shadow)] max-lg:w-full max-lg:min-h-[360px] max-lg:grid-cols-[92px_minmax(0,1fr)] max-sm:grid-cols-1">
82|            {/* Rail */}
83|            <div className="grid content-start gap-2 p-3 border border-[var(--line)] rounded-lg bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] max-sm:grid-cols-4">
84|              {["Search", "Queue", "Work", "Money"].map((item, i) => (
85|                <span
86|                  key={item}
87|                  className={
88|                    i === 0
89|                      ? "min-h-9 flex items-center rounded-[7px] bg-[color-mix(in_srgb,var(--blue)_12%,var(--surface))] text-[var(--blue)] text-xs font-black px-2.5 max-sm:justify-center max-sm:px-1.5"
90|                      : "min-h-9 flex items-center rounded-[7px] text-[var(--muted)] text-xs font-black px-2.5 max-sm:justify-center max-sm:px-1.5"
91|                  }
92|                >
93|                  {item}
94|                </span>
95|              ))}
96|            </div>
97|            {/* Main */}
98|            <div className="grid content-start gap-2.5 p-3.5 border border-[var(--line)] rounded-lg bg-[color-mix(in_srgb,var(--surface)_94%,transparent)]">
99|              <div className="min-h-[170px] grid content-end gap-2 border border-[var(--line)] rounded-lg bg-[var(--surface-soft)] p-[18px]">
100|                <span className="text-[var(--blue)] text-[11px] font-black uppercase">Candidate search</span>
101|                <strong className="text-[clamp(42px,6vw,76px)] leading-[0.88]">jaafar</strong>
102|                <small className="text-[var(--muted)]">80 scoped results · FAD · needs review · Lebanon</small>
103|              </div>
104|              <div className="grid grid-cols-4 gap-2.5 max-sm:grid-cols-1">
105|                {[
106|                  { label: "Profile ready", status: "Live" },
107|                  { label: "CV export", status: "PDF" },
108|                  { label: "Timesheet", status: "Live" },
109|                  { label: "Payment", status: "Live" },
110|                ].map((item) => (
111|                  <div
112|                    key={item.label}
113|                    className="min-h-[138px] grid content-between border border-[var(--line)] rounded-lg bg-[var(--surface)] p-3.5 max-sm:min-h-[92px]"
114|                  >
115|                    <span className="text-[var(--blue)] text-[11px] font-black uppercase">{item.label}</span>
116|                    <strong className="text-2xl">{item.status}</strong>
117|                  </div>
118|                ))}
119|              </div>
120|            </div>
121|122|            {/* Aside */}
123|            <div className="grid content-end gap-2 p-4 border border-[var(--line)] rounded-lg bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] max-lg:hidden">
124|              <span className="text-[var(--blue)] text-[11px] font-black uppercase">Command</span>
125|              <strong className="text-[22px] leading-[1.08]">Send CVs to employer</strong>
126|              <small className="text-[var(--muted)]">Same action layer for staff and admin, scoped by role.</small>
127|            </div>
128|          </div>
129|        </div>
130|        {/* Hero copy */}
131|        <div className="relative z-[2] max-w-[690px] max-lg:max-w-none">
132|          <p className="text-[var(--blue)] text-[11px] font-black uppercase">Next-generation StudentHub</p>
133|          <h1 className="mt-0 text-[clamp(44px,6.4vw,92px)] leading-[0.94] max-sm:text-[40px]">
134|            One modern platform, purpose-built portals.
135|          </h1>
136|          <p className="max-w-[620px] text-[clamp(17px,1.7vw,21px)]">
137|            A Silicon Valley-grade rebuild for candidates, staff, companies, inspectors, and admins. One login opens the
138|            right workspace, while shared modules keep search, documents, payments, and reporting unified.
139|          </p>
140|          <div className="flex flex-wrap items-center gap-3.5 mt-4 max-sm:flex-col max-sm:items-stretch">
141|            <Button size="lg" asChild>
142|              <Link href="/login">Sign in</Link>
143|            </Button>
144|          </div>
145|          <div className="flex flex-wrap gap-2 mt-[18px]" aria-label="StudentHub platform goals">
146|            {["Role-specific workspaces", "Shared search and documents", "Production-data migration path"].map(
147|              (stat) => (
148|                <span
149|                  key={stat}
150|                  className="min-h-8 inline-flex items-center border border-[var(--line)] rounded-full bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-3 text-[var(--blue)] text-[11px] font-black uppercase"
151|                >
152|                  {stat}
153|                </span>
154|              )
155|            )}
156|180|          </div>
181|        </div>
182|      </section>
183|
184|      {/* Portal grid */}
185|      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 max-sm:gap-2" aria-label="StudentHub portals">
186|        {portalRoles.map((role) => {
187|          const portal = portalContent[role];
188|          const Icon = portalIcons[role];
189|          return (
190|191|            <Link
192|              href={portal.href as Route}
193|              key={role}
194|              className="group no-underline transition-[border-color,background,transform,box-shadow] duration-140"
195|            >
196|              <Card className="h-full group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_45px_rgba(16,24,40,0.1)]">
197|                <CardContent className="flex flex-col gap-2 p-4">
198|                  <Icon className="size-5 text-[var(--blue)] shrink-0" aria-hidden="true" />
199|                  <span className="text-[var(--blue)] text-[11px] font-black uppercase">{portal.label}</span>
200|                  <strong className="text-sm">{portal.audience}</strong>
201|                  <small className="text-[var(--muted)] text-xs leading-relaxed">{portal.promise}</small>
202|                </CardContent>
203|              </Card>
204|211|            </Link>
212|          );
213|        })}
214|      </section>
215|
216|217|      {/* Benefits section */}
218|      <section
219|        className="grid grid-cols-[1fr] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center rounded-lg bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] p-[clamp(24px,4vw,48px)] gap-[clamp(18px,3vw,38px)] shadow-[0_18px_60px_rgba(16,24,40,0.08)]"
220|        aria-label="Why StudentHub"
221|      >
222|        <div>
223|          <p className="text-[var(--blue)] text-[11px] font-black uppercase">Why StudentHub</p>
224|          <h2 className="text-[clamp(28px,4vw,42px)] leading-[1.08] m-0">
225|            Built for how staffing actually works.
226|          </h2>
227|          <p className="text-[var(--muted)] leading-relaxed">
228|235|            Not a generic dashboard. Every feature is shaped by real placement workflows — search, shortlisting,
236|            document exchange, timesheets, and payments run in one system.
237|          </p>
238|        </div>
239|240|        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
241|          {benefits.map((b) => (
242|            <Card key={b.title}>
243|              <CardContent className="grid content-start gap-1 p-4">
244|                <strong className="text-sm">{b.title}</strong>
245|                <p className="text-[var(--muted)] text-xs leading-relaxed m-0">{b.body}</p>
246|              </CardContent>
247|            </Card>
248|256|          ))}
257|        </div>
258|      </section>
259|    </main>
260|  );
261|}
262|