import { getDashboardData } from "@/modules/dashboard/data";
import { EmptyState } from "@/modules/workspace/EmptyState";
import { MetricCard } from "@/components/ui/metric-card";

export async function Dashboard() {
  const dashboard = await getDashboardData();

  return (
    <>
      <section className="metrics" aria-label="StudentHub health metrics">
        {dashboard.metrics.map((metric, idx) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            note={metric.note}
            delay={idx * 60}
            accent="info"
          />
        ))}
      </section>

      <section className="workspace">
        <div className="statusOverview">
          <h2>Request Pipeline</h2>
          <div className="statusMix">
            {dashboard.statusMix.map((status) => (
              <div className="statusRow" key={status.label}>
                <span>{status.label}</span>
                <strong>{status.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lists">
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
    <section className="dataList">
      <div className="listHeader">
        <h2>{title}</h2>
        <span>{items.length}</span>
      </div>
      <div className="rows">
        {items.length ? items.map((item) => (
          <article className="row" key={item.id}>
            <div className="rowMain">
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </div>
            <div className="rowMeta">
              <span>{item.meta}</span>
              {item.amount ? <strong>{item.amount}</strong> : null}
              {item.count !== undefined ? <strong>{item.count} seats</strong> : null}
              {item.date ? <small>{item.date}</small> : null}
            </div>
          </article>
        )) : <EmptyState variant="no-activity" message="No recent activity" />}
      </div>
    </section>
  );
}
