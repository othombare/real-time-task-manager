import { BarChart3Icon, LineChartIcon, PieChartIcon, SparklesIcon } from "lucide-react";
import DashboardLayout from "../Dashboard/DashboardLayout";

const metrics = [
  { label: "Productivity Score", value: "86%", detail: "Up 9% from last week" },
  { label: "Completed Work", value: "124", detail: "Tasks closed this month" },
  { label: "Team Velocity", value: "31", detail: "Story points per sprint" },
];

function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Insights</p>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              View team performance trends, output signals, and project momentum in one place.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <BarChart3Icon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">Performance tracking ready</p>
              <p className="text-xs text-muted-foreground">Frontend analytics placeholder screen</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="grid gap-4 md:grid-cols-3">
            {metrics.map((metric) => (
              <article key={metric.label} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">{metric.value}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{metric.detail}</p>
              </article>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600">
                  <LineChartIcon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Trend Note</h3>
                  <p className="text-xs text-muted-foreground">What the team is doing better.</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>Task completion cadence is improving week over week.</li>
                <li>Review bottlenecks are shrinking across active workstreams.</li>
                <li>Project handoffs look smoother than the previous sprint.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-primary">
                <PieChartIcon size={18} />
                <h3 className="font-semibold">Later Upgrade</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This screen is ready for charts once you connect a real metrics API or analytics backend.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Analytics;
