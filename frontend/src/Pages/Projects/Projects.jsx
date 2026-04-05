import { ArrowRightIcon, BriefcaseBusinessIcon, FolderKanbanIcon, PaperclipIcon, TrendingUpIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { useProjects } from "./useProjects";

function Projects() {
  const navigate = useNavigate();
  const { projects } = useProjects();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Delivery</p>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground">
              A project view for tracking active initiatives and overall momentum.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <BriefcaseBusinessIcon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">{projects.length} active projects</p>
              <p className="text-xs text-muted-foreground">Open any project to manage its board</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="space-y-4">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => navigate(`/projects/${project.slug}`)}
                className="w-full rounded-3xl border border-border bg-card p-5 text-left shadow-sm transition hover:border-primary/20 hover:shadow-md"
              >
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold">{project.title}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">{project.description}</p>
                  {(project.attachments ?? 0) > 0 && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                      <PaperclipIcon size={12} />
                      {project.attachments} attachment{project.attachments > 1 ? "s" : ""}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Open board
                    </span>
                    <ArrowRightIcon size={16} className="text-primary" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600">
                  <TrendingUpIcon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Portfolio Health</h3>
                  <p className="text-xs text-muted-foreground">Current delivery pulse.</p>
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">On track</span>
                  <span className="font-semibold">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">At risk</span>
                  <span className="font-semibold">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Planning</span>
                  <span className="font-semibold">2</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-primary">
                <FolderKanbanIcon size={18} />
                <h3 className="font-semibold">Boards Ready</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Open any project card to see its Jira-style board with `To Do`, `In Progress`, and `Done` columns.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Projects;
