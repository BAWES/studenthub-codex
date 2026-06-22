import { getDashboardData } from "@/modules/dashboard/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, FileText, ArrowRightLeft } from "lucide-react";

const metricIcons = [Users, Building2, FileText, ArrowRightLeft] as const;
const metricAccents: Array<"info" | "success" | "warning" | "primary"> = [
  "info",
  "success",
  "warning",
  "primary",
];

export async function Dashboard() {
  const dashboard = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* ── Metrics grid — shadcn MetricCard ── */}
      <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {dashboard.metrics.map((metric, i) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            subtitle={metric.note}
            icon={metricIcons[i]}
            accent={metricAccents[i]}
          />
        ))}
      </div>

      {/* ── Workspace + Status Mix + Next Slices ── */}
      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        {/* Main workspace card (span 2 cols) */}
        <Card className="col-span-2 max-lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-[14px] font-semibold">Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-1">
                Migration Strategy
              </p>
              <h2 className="text-lg font-semibold leading-snug text-foreground">
                Build from the real data model, one clean workflow at a time.
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                This workspace is reading the local production clone when enabled. Each old portal becomes a
                role-aware surface inside one product.
              </p>
            </div>

            {/* Status Mix — shadcn Card sub-grid */}
            <div className="grid grid-cols-2 gap-3">
              {dashboard.statusMix.map((status) => (
                <div
                  key={status.label}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {status.label}
                  </span>
                  <span className="text-sm font-bold">{status.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Slices — numbered list card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[14px] font-semibold">Next Slices</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {[
                "Candidate list/detail/edit",
                "Company and request pipeline",
                "Work logs and approvals",
                "Transfer and payroll review",
              ].map((slice, i) => (
                <li key={slice} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-foreground">{slice}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent lists — shadcn Card + Badge ── */}
      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <DataListCard title="Recent Candidates" items={dashboard.recentCandidates} />
        <DataListCard title="Recent Companies" items={dashboard.recentCompanies} />
      </div>
      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <DataListCard title="Recent Requests" items={dashboard.recentRequests} />
        <DataListCard title="Recent Transfers" items={dashboard.recentTransfers} />
      </div>
    </div>
  );
}

// ── Types ──

type DataListItem = {
  id: number | string;
  title: string;
  subtitle: string;
  meta: string;
  amount?: string;
  date?: string;
  count?: number;
};

// ── DataListCard — shadcn Card-based list ──

function DataListCard({ title, items }: { title: string; items: DataListItem[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
        <CardTitle className="text-[14px] font-semibold">{title}</CardTitle>
        <Badge variant="secondary">{items.length}</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-semibold">
                  {item.title}
                </strong>
                <span className="block truncate text-xs text-muted-foreground">
                  {item.subtitle}
                </span>
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-3">
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {item.meta}
                </span>
                {item.amount ? (
                  <strong className="whitespace-nowrap text-xs font-semibold">
                    {item.amount}
                  </strong>
                ) : null}
                {item.count !== undefined ? (
                  <Badge variant="outline" className="text-[11px]">
                    {item.count} seats
                  </Badge>
                ) : null}
                {item.date ? (
                  <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                    {item.date}
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
