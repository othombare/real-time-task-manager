import { useMemo, useState } from "react";
import {
  ArrowRightIcon,
  BriefcaseBusinessIcon,
  FolderInputIcon,
  KeyRoundIcon,
  PaperclipIcon,
  Trash2Icon,
  TrendingUpIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getInitials, hasProjectAccess } from "./projectData";
import useProjects from "./useProjects";

const normalizeComparableValue = (value = "") => value.trim().toLowerCase();

const getProjectOwnerId = (project) => {
  if (!project?.createdBy) {
    return null;
  }

  return typeof project.createdBy === "object" ? project.createdBy._id : project.createdBy;
};

const getProjectCreatorName = (project) =>
  (typeof project?.createdBy === "object" ? project.createdBy?.name : null) ||
  project?.owner ||
  project?.admin ||
  "";

const isProjectCompleted = (project) => {
  const boardColumns = project?.board ?? [];
  const workingColumns = boardColumns.filter((column) =>
    ["To Do", "In Progress", "In Review"].includes(column.title)
  );

  return workingColumns.every((column) => (column.tasks ?? []).length === 0);
};

function Projects() {
  const navigate = useNavigate();
  const { profile } = useCurrentUser();
  const { projects, joinProjectByCode, removeProject } = useProjects();
  const [joinCode, setJoinCode] = useState("");
  const [joinFeedback, setJoinFeedback] = useState("");
  const [joinFeedbackType, setJoinFeedbackType] = useState("neutral");
  const [isJoining, setIsJoining] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const displayName = profile?.name || "Workspace User";
  const memberId = getInitials(displayName);

  const visibleProjects = useMemo(
    () => projects.filter((project) => hasProjectAccess(project, memberId, displayName)),
    [displayName, memberId, projects]
  );
  const completedProjects = useMemo(
    () => visibleProjects.filter((project) => isProjectCompleted(project)),
    [visibleProjects]
  );
  const activeProjects = useMemo(
    () => visibleProjects.filter((project) => !isProjectCompleted(project)),
    [visibleProjects]
  );

  const handleJoinProject = async () => {
    setJoinFeedback("");
    setJoinFeedbackType("neutral");

    if (!joinCode.trim()) {
      setJoinFeedback("Enter a project code first.");
      setJoinFeedbackType("error");
      return;
    }

    setIsJoining(true);
    const result = await joinProjectByCode(joinCode, displayName);
    setIsJoining(false);

    if (!result.success) {
      setJoinFeedback(result.error);
      setJoinFeedbackType("error");
      return;
    }

    setJoinCode("");
    setJoinFeedback(`Joined ${result.projectTitle}. Redirecting you now.`);
    setJoinFeedbackType("success");
    navigate(`/projects/${result.projectSlug}`);
  };

  const handleDeleteProject = async (event, project) => {
    event.stopPropagation();

    const isOwnerById = Boolean(profile?._id && getProjectOwnerId(project) === profile._id);
    const normalizedDisplayName = normalizeComparableValue(displayName);
    const isOwnerByName = normalizedDisplayName === normalizeComparableValue(getProjectCreatorName(project));

    if (!isOwnerById && !isOwnerByName) {
      alert("Only the project creator can delete this project.");
      return;
    }

    const confirmed = window.confirm(`Delete "${project.title}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingProjectId(project._id || project.id);
    const result = await removeProject(project._id || project.id);
    setDeletingProjectId(null);

    if (!result?.success) {
      alert(result?.error || "Unable to delete project.");
    }
  };

  const handleOpenProject = (projectSlug) => {
    navigate(`/projects/${projectSlug}`);
  };

  const handleProjectCardKeyDown = (event, projectSlug) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenProject(projectSlug);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground">
              Here is the list of projects you are involved in. You can create a new project, join an existing one with a code, or manage your current projects.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <BriefcaseBusinessIcon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">{activeProjects.length} active projects</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="space-y-4">
            {visibleProjects.map((project) => {
              const canDeleteProject =
                Boolean(profile?._id && getProjectOwnerId(project) === profile._id) ||
                normalizeComparableValue(displayName) === normalizeComparableValue(getProjectCreatorName(project));

              return (
                <button
                  key={project._id || project.id}
                  type="button"
                  onClick={() => navigate(`/projects/${project.slug}`)}
                  className="w-full rounded-3xl border border-border bg-card p-5 text-left shadow-sm transition hover:border-primary/20 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold">{project.title}</h2>
                        <p className="text-sm leading-6 text-muted-foreground">{project.description}</p>
                      </div>

                      {canDeleteProject && (
                        <button
                          type="button"
                          onClick={(event) => handleDeleteProject(event, project)}
                          disabled={deletingProjectId === (project._id || project.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground transition hover:border-rose-200 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Delete ${project.title}`}
                        >
                          <Trash2Icon size={16} />
                        </button>
                      )}
                    </div>

                    {(project.attachments ?? 0) > 0 && (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                        <PaperclipIcon size={12} />
                        {project.attachments} attachment{project.attachments > 1 ? "s" : ""}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Project code
                        </p>
                        <p className="text-sm font-semibold">{project.joinCode}</p>
                      </div>
                      <div className="flex items-center gap-2 text-primary">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Open board
                        </span>
                        <ArrowRightIcon size={16} className="text-primary" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {visibleProjects.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
                No projects are linked to you yet. Create a project from the header or use a code to join one.
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
                  
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active</span>
                  <span className="font-semibold">{activeProjects.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold">{completedProjects.length}</span>
                </div>
                
              </div>
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
                      setJoinFeedbackType("neutral");
                    }}
                    placeholder="Enter group code"
                    className="h-12 w-full rounded-2xl border border-input bg-background pl-11 pr-4 text-sm uppercase outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleJoinProject}
                  disabled={isJoining}
                  className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isJoining ? "Joining..." : "Join project"}
                </button>
                
                {joinFeedback && (
                  <p
                    className={`rounded-2xl px-3 py-2 text-xs font-medium ${
                      joinFeedbackType === "error"
                        ? "bg-rose-50 text-rose-600"
                        : joinFeedbackType === "success"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
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
