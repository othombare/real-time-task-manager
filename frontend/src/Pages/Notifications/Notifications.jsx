import { BellIcon, CalendarIcon, CheckCheckIcon, Clock3Icon, SparklesIcon } from "lucide-react";
import DashboardLayout from "../Dashboard/DashboardLayout";

const notifications = [
  {
    id: 1,
    title: "Sprint review scheduled",
    description: "The product sprint review is booked for 4:00 PM with design and QA.",
    time: "10 min ago",
    type: "Meeting",
    unread: true,
  },
  {
    id: 2,
    title: "Two tasks moved to review",
    description: "API integration and dashboard chart polish are now ready for final review.",
    time: "28 min ago",
    type: "Workflow",
    unread: true,
  },
  {
    id: 3,
    title: "Weekly report generated",
    description: "Your weekly productivity report is ready to download and share with the team.",
    time: "1 hour ago",
    type: "Report",
    unread: false,
  },
  {
    id: 4,
    title: "Client feedback received",
    description: "The client added comments on onboarding flow and requested a smaller hero section.",
    time: "Today",
    type: "Feedback",
    unread: false,
  },
];

function Notifications() {
  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Updates</p>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              Stay on top of alerts, reviews, and teammate activity in one place.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <BellIcon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">{unreadCount} unread updates</p>
              <p className="text-xs text-muted-foreground">Last checked a few moments ago</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="space-y-4">
            {notifications.map((item) => (
              <article
                key={item.id}
                className={`rounded-3xl border p-5 shadow-sm transition-colors ${
                  item.unread ? "border-primary/30 bg-card ring-1 ring-primary/10" : "border-border bg-card"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                        {item.type}
                      </span>
                      {item.unread && (
                        <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
                          New
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Clock3Icon size={14} />
                    {item.time}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600">
                  <CheckCheckIcon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Focus Summary</h3>
                  <p className="text-xs text-muted-foreground">Your workspace is mostly under control.</p>
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Unread</span>
                  <span className="font-semibold">{unreadCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Resolved today</span>
                  <span className="font-semibold">11</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">High priority</span>
                  <span className="font-semibold">2</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-500/10 p-2 text-amber-600">
                  <CalendarIcon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Coming Up</h3>
                  <p className="text-xs text-muted-foreground">What deserves attention next.</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>Review sprint board before the evening sync.</li>
                <li>Share the weekly progress snapshot with stakeholders.</li>
                <li>Reply to client comments on the onboarding flow.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-primary">
                <SparklesIcon size={18} />
                <h3 className="font-semibold">Quick Tip</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Clear the unread items first, then jump into profile settings if you want to update your workspace identity.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Notifications;
