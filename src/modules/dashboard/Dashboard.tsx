import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/modules/dashboard/data";

export async function Dashboard() {
  const dashboard = await getDashboardData();

  return (
    <>
      {/* Metrics cards — shadcn Card grid */}
      <section
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        aria-label="StudentHub health metrics"
      >
        {dashboard.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {metric.label}
              </span>
              <strong className="block text-[38px] leading-[1] my-3 font-bold text-foreground">
                {metric.value.toLocaleString("en-US")}
              </strong>
              <p className="text-muted-foreground/70 text-sm mb-0">{metric.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Strategy focus + request status mix */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3">
        <Card>
          <CardContent className="p-5 lg:p-6">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-wide">
              Migration Strategy
            </p>
            <h2 className="mt-2 mb-3 text-2xl font-bold text-foreground max-w-[680px]">
              Build from the real data model, one clean workflow at a time.
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-0 max-w-[760px]">
              This workspace is reading the local production clone when enabled. Each old portal
              becomes a role-aware surface inside one product.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 grid gap-2.5 content-start">
            {dashboard.statusMix.map((status) => (
              <div
                key={status.label}
                className="flex items-center justify-between gap-3 border-b border-border last:border-b-0 pb-2 last:pb-0"
              >
                <span className="text-sm text-muted-foreground">{status.label}</span>
                <strong className="text-foreground">{status.value}</strong>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Next Slices planning card */}
      <Card>
        <CardContent className="p-5 lg:p-6">
          <h2 className="text-lg font-bold text-foreground mb-3">Next Slices</h2>
          <ol className="grid gap-3 pl-5 list-decimal">
            <li className="text-muted-foreground text-sm">Candidate list/detail/edit</li>
            <li className="text-muted-foreground text-sm">Company and request pipeline</li>
            <li className="text-muted-foreground text-sm">Work logs and approvals</li>
            <li className="text-muted-foreground text-sm">Transfer and payroll review</li>
          </ol>
        </CardContent>
      </Card>

      {/* Recent data list panels */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
    <Card>
      <div className="flex items-center justify-between gap-4 px-4 py-3.5 border-b border-border">
        <h2 className="text-lg font-bold text-foreground mb-0">{title}</h2>
        <span className="min-w-[30px] min-h-[30px] inline-flex items-center justify-center text-blue-600 border border-blue-200 bg-blue-50 font-bold text-sm rounded">
          {items.length}
        </span>
      </div>
      <div className="grid">
        {items.length ? (
          items.map((item) => (
            <article
              key={item.id}
              className="min-h-[72px] grid grid-cols-[1fr_minmax(126px,auto)] gap-4 px-4 py-3.5 border-b border-border last:border-b-0"
            >
              <div className="min-w-0 grid gap-1.5 content-center">
                <strong className="text-foreground">{item.title}</strong>
                <span className="text-muted-foreground text-sm">{item.subtitle}</span>
              </div>
              <div className="flex flex-col items-end justify-center gap-1">
                <span className="text-muted-foreground text-xs">{item.meta}</span>
                {item.amount ? <strong className="text-sm text-foreground">{item.amount}</strong> : null}
                {item.count !== undefined ? <strong className="text-sm text-foreground">{item.count} seats</strong> : null}
                {item.date ? <small className="text-xs text-muted-foreground">{item.date}</small> : null}
              </div>
            </article>
          ))
        ) : (
          <div className="grid gap-1.5 p-4 text-muted-foreground">
            <strong className="text-foreground text-[15px]">No items here</strong>
            <span className="text-sm">The imported database did not return rows for this panel.</span>
          </div>
        )}
      </div>
    </Card>
  );
}
