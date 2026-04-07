import { useMemo, useState } from "react";
import {
  ArrowRightIcon,
  BriefcaseBusinessIcon,
  FolderInputIcon,
  FolderKanbanIcon,
  KeyRoundIcon,
  PaperclipIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getInitials, hasProjectAccess } from "./projectData";
import { useProjects } from "./useProjects";

function Projects() {
  const navigate = useNavigate();
  const { profile } = useCurrentUser();
  const { projects, joinProjectByCode } = useProjects();
  const [joinCode, setJoinCode] = useState("");
  const [joinFeedback, setJoinFeedback] = useState("");
  const displayName = profile?.name || "Workspace User";
  const memberId = getInitials(displayName);
  const visibleProjects = useMemo(
    () => projects.filter((project) => hasProjectAccess(project, memberId, displayName)),
    [displayName, memberId, projects]
  );

  const handleJoinProject = () => {
    const result = joinProjectByCode(joinCode, displayName);

    if (!result.success) {
      setJoinFeedback(result.error);
      return;
    }

    setJoinCode("");
    setJoinFeedback(`Joined ${result.projectTitle}. Redirecting you now.`);
    navigate(`/projects/${result.projectSlug}`);
  };

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
              <p className="text-sm font-semibold">{visibleProjects.length} active projects</p>
              <p className="text-xs text-muted-foreground">Projects you can access from this workspace</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="space-y-4">
            {visibleProjects.map((project) => (
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
            {visibleProjects.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
                No projects are linked to you yet. Use a group code on the right to join one.
              </div>
            )}
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
                Open any project card to see its Jira-style board with `To Do`, `In Progress`, `In Review`, and `Done` columns.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                  <FolderInputIcon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Take Me to Project</h3>
                  <p className="text-xs text-muted-foreground">Enter a group code to join a project.</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="relative">
                  <KeyRoundIcon
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(event) => {
                      setJoinCode(event.target.value.toUpperCase());
                      setJoinFeedback("");
                    }}
                    placeholder="Enter group code"
                    className="h-12 w-full rounded-2xl border border-input bg-background pl-11 pr-4 text-sm uppercase outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleJoinProject}
                  className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Join project
                </button>
                <p className="text-xs text-muted-foreground">
                  Teammates can share the code generated during project creation.
                </p>
                {joinFeedback && (
                  <p className="rounded-2xl bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                    {joinFeedback}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Projects;
