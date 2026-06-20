import { getDashboardData } from "@/modules/dashboard/data";

export async function Dashboard() {
  const dashboard = await getDashboardData();

  return (
    <>
      <section className="metrics" aria-label="StudentHub health metrics">
        {dashboard.metrics.map((metric) => (
          <article className="metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value.toLocaleString("en-US")}</strong>
            <p>{metric.note}</p>
          </article>
        ))}
      </section>

      <section className="workspace">
        <div className="focus">
          <div>
            <p className="eyebrow">Migration Strategy</p>
            <h2>Build from the real data model, one clean workflow at a time.</h2>
            <p>
              This workspace is reading the local production clone when enabled. Each old portal becomes a
              role-aware surface inside one product.
            </p>
          </div>
          <div className="statusMix">
            {dashboard.statusMix.map((status) => (
              <div className="statusRow" key={status.label}>
                <span>{status.label}</span>
                <strong>{status.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="rail">
          <h2>Next Slices</h2>
          <ol>
            <li>Candidate list/detail/edit</li>
            <li>Company and request pipeline</li>
            <li>Work logs and approvals</li>
            <li>Transfer and payroll review</li>
          </ol>
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
        {items.map((item) => (
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
        ))}
      </div>
    </section>
  );
}
