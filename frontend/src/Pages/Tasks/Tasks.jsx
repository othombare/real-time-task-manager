import { useMemo, useState } from "react";
import { CheckCircle2Icon, Clock3Icon, ListTodoIcon, SparklesIcon } from "lucide-react";
import DashboardLayout from "../Dashboard/DashboardLayout";

const initialTasks = [
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
    status: "Done",
    due: "Tomorrow",
  },
  {
    id: 3,
    title: "Sidebar navigation rollout",
    description: "Connect the new workspace sections and make the navigation feel more complete.",
    status: "To Do",
    due: "This Week",
  },
];

const statusOptions = ["To Do", "In Progress", "Done"];

const statusStyles = {
  "To Do": "bg-slate-100 text-slate-600 border-slate-200",
  "In Progress": "bg-amber-500/10 text-amber-700 border-amber-200",
  "Done": "bg-emerald-500/10 text-emerald-700 border-emerald-200",
};

function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);

  const taskStats = useMemo(() => {
    const active = tasks.filter((task) => task.status !== "Done").length;
    const completed = tasks.filter((task) => task.status === "Done").length;
    const inProgress = tasks.filter((task) => task.status === "In Progress").length;

    return {
      active,
      completed,
      inProgress,
    };
  }, [tasks]);

  const handleStatusChange = (taskId, status) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
            }
          : task
      )
    );
  };

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
              <p className="text-sm font-semibold">{taskStats.active} active tasks</p>
              <p className="text-xs text-muted-foreground">{taskStats.inProgress} currently in progress</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="space-y-4">
            {tasks.map((task) => (
              <article key={task.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusStyles[task.status]}`}
                    >
                      {task.status}
                    </span>
                    <h2 className="text-lg font-semibold">{task.title}</h2>
                    <p className="text-sm leading-6 text-muted-foreground">{task.description}</p>
                  </div>

                  <div className="space-y-3 sm:min-w-[160px]">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Clock3Icon size={14} />
                      {task.due}
                    </div>
                    <select
                      value={task.status}
                      onChange={(event) => handleStatusChange(task.id, event.target.value)}
                      className={`h-11 w-full rounded-2xl border bg-background px-3 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-primary/15 ${statusStyles[task.status]}`}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
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
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold">{taskStats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">In progress</span>
                  <span className="font-semibold">{taskStats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">To do</span>
                  <span className="font-semibold">{tasks.filter((task) => task.status === "To Do").length}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-primary">
                <SparklesIcon size={18} />
                <h3 className="font-semibold">Focus Tip</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Update the status here as work moves forward so the task list stays readable at a glance.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Tasks;
