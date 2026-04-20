import { BellIcon, CalendarIcon, CheckCheckIcon, Clock3Icon, SparklesIcon } from "lucide-react";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useProjects } from "../Projects/useProjects";
import { isTaskAssignedToUser } from "../../utils/taskAdapters";

const getUserInitials = (name) =>
  (name || "OJ")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function Notifications() {
  const { profile } = useCurrentUser();
  const { projects } = useProjects();
  const userInitials = getUserInitials(profile?.name);

  const notifications = projects.flatMap((project) =>
    project.board.flatMap((column) =>
      column.tasks
        .filter((task) =>
          isTaskAssignedToUser(task, {
            userId: profile?._id || null,
            initials: userInitials,
          })
        )
        .map((task) => ({
          id: `${project.slug}-${column.title}-${task.id}`,
          title: task.title,
          description: `Assigned to you in ${project.title}. Status: ${column.title}. Due ${task.dueDate}.`,
          time: task.dueDate,
          type: "Assigned Task",
          unread: column.title !== "Done",
          priority: task.priority,
          projectName: project.title,
        }))
    )
  );

  const unreadCount = notifications.filter((item) => item.unread).length;
  const activeCount = notifications.filter((item) => item.unread).length;
  const completedCount = notifications.length - activeCount;
  const highPriorityCount = notifications.filter((item) => item.priority === "High").length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Updates</p>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              See only the tasks that are assigned to you across the workspace.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <BellIcon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">{unreadCount} active task notifications</p>
              <p className="text-xs text-muted-foreground">Generated from your assigned work</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((item) => (
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
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                          {item.projectName}
                        </span>
                        {item.unread && (
                          <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
                            Active
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
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-card px-5 py-10 text-center shadow-sm">
                <p className="text-sm font-semibold">No assigned task notifications right now.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  New notifications will appear here when tasks are assigned to you in project boards.
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600">
                  <CheckCheckIcon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Assignment Summary</h3>
                  <p className="text-xs text-muted-foreground">A quick view of your task alerts.</p>
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total assigned</span>
                  <span className="font-semibold">{notifications.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Still active</span>
                  <span className="font-semibold">{activeCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold">{completedCount}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-500/10 p-2 text-amber-600">
                  <CalendarIcon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Priority Watch</h3>
                  <p className="text-xs text-muted-foreground">What needs attention first.</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>{highPriorityCount} high-priority assigned tasks.</li>
                <li>{activeCount} tasks still open on your boards.</li>
                <li>{completedCount} assigned tasks already done.</li>
              </ul>
            </div>

            
           
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Notifications;
