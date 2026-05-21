import { getDashboardData } from "@/modules/dashboard/data";

export async function Dashboard() {
  const dashboard = await getDashboardData();

  return (
    <>
      <section className="grid grid-cols-4 gap-3 max-[1040px]:grid-cols-1" aria-label="StudentHub health metrics">
        {dashboard.metrics.map((metric) => (
          <article className="min-h-[118px] p-[18px] border border-[var(--line)] bg-[var(--surface)]" key={metric.label}>
            <span className="text-[var(--blue)] text-[11px] font-black uppercase">{metric.label}</span>
            <strong className="block text-[38px] leading-none my-4 mx-0">{metric.value.toLocaleString("en-US")}</strong>
            <p className="text-[var(--faint)] mb-0">{metric.note}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-[minmax(0,1fr)_340px] gap-3 mb-3 max-[1040px]:grid-cols-1">
        <div className="border border-[var(--line)] bg-[var(--surface)] grid grid-cols-[minmax(0,1fr)_300px] gap-8 p-6">
          <div>
            <p className="text-[var(--blue)] text-xs font-bold uppercase m-0 mb-2.5">Migration Strategy</p>
            <h2 className="max-w-[680px] text-3xl">Build from the real data model, one clean workflow at a time.</h2>
            <p className="max-w-[760px] leading-relaxed mb-0 text-[var(--muted)]">
              This workspace is reading the local production clone when enabled. Each old portal becomes a
              role-aware surface inside one product.
            </p>
          </div>
          <div className="grid content-start gap-2">
            {dashboard.statusMix.map((status) => (
              <div className="flex items-center justify-between gap-4 min-h-11 border-b border-[var(--line)]" key={status.label}>
                <span className="text-[var(--muted)]">{status.label}</span>
                <strong>{status.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[var(--line)] bg-[var(--surface)] p-6">
          <h2>Next Slices</h2>
          <ol className="grid gap-[13px] pl-[22px] mt-[18px] mx-0">
            <li className="text-[var(--muted)]">Candidate list/detail/edit</li>
            <li className="text-[var(--muted)]">Company and request pipeline</li>
            <li className="text-[var(--muted)]">Work logs and approvals</li>
            <li className="text-[var(--muted)]">Transfer and payroll review</li>
          </ol>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 max-[1040px]:grid-cols-1">
        <DataList title="Recent Candidates" items={dashboard.recentCandidates} />
        <DataList title="Recent Companies" items={dashboard.recentCompanies} />
        <DataList title="Recent Requests" items={dashboard.recentRequests} />
        <DataList title="Recent Transfers" items={dashboard.recentTransfers} />
      </section>
    </>
  );
}

type DataListItem = {
  id: number | string;
  title: string;
  subtitle: string;
  meta: string;
  amount?: string;
  date?: string;
  count?: number;
};

function DataList({ title, items }: { title: string; items: DataListItem[] }) {
  return (
    <section className="border border-[var(--line)] bg-[var(--surface)]">
      <div className="min-h-[62px] flex items-center justify-between gap-4 px-[18px] py-[18px] pb-3.5 border-b border-[var(--line)]">
        <h2 className="mb-0">{title}</h2>
        <span className="min-w-[30px] min-h-[30px] inline-flex items-center justify-center text-[var(--blue)] border border-[#b7cff0] bg-[#eef5ff] font-bold">{items.length}</span>
      </div>
      <div className="grid">
        {items.map((item) => (
          <article className="min-h-[72px] grid grid-cols-[minmax(0,1fr)_minmax(126px,auto)] gap-4 px-[18px] py-3.5 border-b border-[var(--line)] last:border-b-0" key={item.id}>
            <div className="min-w-0 grid content-center gap-1.5">
              <strong className="overflow-hidden text-ellipsis whitespace-nowrap">{item.title}</strong>
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--muted)]">{item.subtitle}</span>
            </div>
            <div className="min-w-0 grid content-center justify-items-end text-right gap-1.5">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--muted)]">{item.meta}</span>
              {item.amount ? <strong className="text-[13px]">{item.amount}</strong> : null}
              {item.count !== undefined ? <strong className="text-[13px]">{item.count} seats</strong> : null}
              {item.date ? <small className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--muted)]">{item.date}</small> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
