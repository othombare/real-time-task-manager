import { CheckCircle2Icon, Clock3Icon, ListTodoIcon, SparklesIcon } from "lucide-react";
import DashboardLayout from "../Dashboard/DashboardLayout";

const taskSections = [
  {
    id: 1,
    title: "Design system refresh",
    description: "Align buttons, inputs, and badges across the dashboard screens before the next release.",
    status: "In Progress",
    due: "Today",
  },
  {
    id: 2,
    title: "Auth flow polish",
    description: "Refine register, login, and forgot password states with cleaner validation messaging.",
    status: "Review",
    due: "Tomorrow",
  },
  {
    id: 3,
    title: "Sidebar navigation rollout",
    description: "Connect the new workspace sections and make the navigation feel more complete.",
    status: "Planned",
    due: "This Week",
  },
];

function Tasks() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Execution</p>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-sm text-muted-foreground">
              Track your priority work, deadlines, and the next items that need attention.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <ListTodoIcon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">18 active tasks</p>
              <p className="text-xs text-muted-foreground">5 due in the next 48 hours</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="space-y-4">
            {taskSections.map((task) => (
              <article key={task.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                      {task.status}
                    </span>
                    <h2 className="text-lg font-semibold">{task.title}</h2>
                    <p className="text-sm leading-6 text-muted-foreground">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Clock3Icon size={14} />
                    {task.due}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600">
                  <CheckCircle2Icon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Progress Snapshot</h3>
                  <p className="text-xs text-muted-foreground">A quick read on current execution.</p>
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completed this week</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Needs review</span>
                  <span className="font-semibold">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Blocked</span>
                  <span className="font-semibold">2</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-primary">
                <SparklesIcon size={18} />
                <h3 className="font-semibold">Focus Tip</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Keep this page for your main work queue and connect it to backend task data later.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Tasks;
