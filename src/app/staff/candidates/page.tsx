import type { Route } from "next";
import Link from "next/link";
import { logoutAction } from "@/modules/auth/actions";
import { requireRole } from "@/modules/auth/session";
import { StaffCandidateConsole } from "@/modules/workspace/StaffCandidateConsole";
import { getStaffCandidateConsole, type StaffCandidateFilter } from "@/modules/workspace/data";

export const dynamic = "force-dynamic";

const filters: { label: string; value: StaffCandidateFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Needs review", value: "needs-review" },
  { label: "Incomplete", value: "incomplete" },
  { label: "Civil ID", value: "civil-id" }
];

function parseFilter(value: string | string[] | undefined): StaffCandidateFilter {
  const filter = Array.isArray(value) ? value[0] : value;
  return filters.some((item) => item.value === filter) ? (filter as StaffCandidateFilter) : "all";
}

function parseCandidateId(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  const id = Number(candidate);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

export default async function StaffCandidatesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; filter?: string; candidate?: string }>;
}) {
  const session = await requireRole("staff");
  const params = await searchParams;
  const query = params.q ?? "";
  const filter = parseFilter(params.filter);
  const data = await getStaffCandidateConsole({
    staffId: Number(session.id),
    search: query,
    filter,
    candidateId: parseCandidateId(params.candidate)
  });

  return (
    <main className="studentOS">
      <aside className="studentOSSidebar">
        <Link className="studentOSBrand" href="/hub">
          <span>SH</span>
          <strong>StudentHub</strong>
        </Link>

        <div className="studentOSUser">
          <span>Staff workspace</span>
          <strong>{session.name}</strong>
          <small>{session.email}</small>
        </div>

        <nav className="studentOSNav" aria-label="Staff operating system">
          {data.staffOS.tabs.map((tab) => (
            <Link className={tab.active ? "active" : ""} href={tab.href as Route} key={tab.label}>
              <span>{tab.label}</span>
              <strong>{tab.value.toLocaleString("en-US")}</strong>
            </Link>
          ))}
        </nav>

        <section className="studentOSEstate" aria-label="Imported production data">
          {data.staffOS.estate.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value.toLocaleString("en-US")}</strong>
              <small>{item.note}</small>
            </div>
          ))}
        </section>

        <form className="studentOSSignout" action={logoutAction}>
          <button type="submit">Sign out</button>
        </form>
      </aside>

      <section className="studentOSMain">
        <header className="studentOSTop">
          <div>
            <p className="eyebrow">Staff OS</p>
            <h1>Candidate operations</h1>
            <p>One live workspace for hiring demand, candidate readiness, time, payroll, invoices, and ID documents.</p>
          </div>
          <div className="studentOSKeys" aria-label="Keyboard shortcuts">
            <span>⌘K command</span>
            <span>/ search</span>
            <span>G R requests</span>
            <span>G C candidates</span>
          </div>
        </header>

        <StaffCandidateConsole data={data} filter={filter} filters={filters} query={query} />
      </section>
    </main>
  );
}
