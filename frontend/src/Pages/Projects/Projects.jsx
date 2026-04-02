import { BriefcaseBusinessIcon, FolderKanbanIcon, SparklesIcon, TrendingUpIcon } from "lucide-react";
import DashboardLayout from "../Dashboard/DashboardLayout";

const projects = [
  {
    id: 1,
    title: "TaskVue Web App",
    description: "Frontend dashboard build with auth, profile, and multi-page navigation.",
    status: "On Track",
    stage: "Sprint 3",
  },
  {
    id: 2,
    title: "Client Onboarding Revamp",
    description: "Improve conversion, simplify forms, and reduce drop-off during setup.",
    status: "Planning",
    stage: "Discovery",
  },
  {
    id: 3,
    title: "Analytics Module",
    description: "Prepare charts and trend reporting views for stakeholder review.",
    status: "In Progress",
    stage: "Build",
  },
];

function Projects() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Delivery</p>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground">
              A project view for tracking active initiatives, stages, and overall momentum.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <BriefcaseBusinessIcon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">7 active projects</p>
              <p className="text-xs text-muted-foreground">3 shipping this month</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="space-y-4">
            {projects.map((project) => (
              <article key={project.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                      {project.stage}
                    </span>
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
                      {project.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold">{project.title}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">{project.description}</p>
                </div>
              </article>
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
                <h3 className="font-semibold">Next Layer</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Later we can add project creation, owners, milestones, and health metrics here.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Projects;
