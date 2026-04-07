import { useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  BriefcaseBusinessIcon,
  CheckIcon,
  CheckCircle2Icon,
  CopyIcon,
  KeyRoundIcon,
  LayersIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Addtask from "../Addtask";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { KanbanColumn } from "../Dashboard/KanbanColumn";
import { cloneProjectBoard, getInitials, hasProjectAccess, projectBoardTemplate, resolveMemberLabel } from "./projectData";
import { useProjects } from "./useProjects";
import { useCurrentUser } from "../../hooks/useCurrentUser";

function ProjectBoard() {
  const navigate = useNavigate();
  const { projectSlug } = useParams();
  const { profile } = useCurrentUser();
  const { getProjectBySlug, updateProjectBoard, updateProjectTask, addProjectMember } = useProjects();
  const project = getProjectBySlug(projectSlug);
  const displayName = profile?.name || "Workspace User";
  const currentMemberId = getInitials(displayName);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("To Do");
  const [newMemberName, setNewMemberName] = useState("");
  const [memberFeedback, setMemberFeedback] = useState("");
  const boardColumns = useMemo(
    () => (project ? cloneProjectBoard(project.board) : cloneProjectBoard(projectBoardTemplate)),
    [project]
  );
  const assigneeOptions = useMemo(
    () =>
      (project?.members ?? []).map((member) => ({
        value: member,
        label: resolveMemberLabel(member, project?.memberDirectory),
      })),
    [project]
  );

  const boardStats = useMemo(() => {
    const allTasks = boardColumns.flatMap((column) => column.tasks);

    return {
      total: allTasks.length,
      completed: boardColumns.find((column) => column.title === "Done")?.tasks.length || 0,
      inProgress: boardColumns.find((column) => column.title === "In Progress")?.tasks.length || 0,
      inReview: boardColumns.find((column) => column.title === "In Review")?.tasks.length || 0,
    };
  }, [boardColumns]);

  const handleAddTask = (newTask) => {
    updateProjectBoard(projectSlug, (currentColumns) =>
      currentColumns.map((column) =>
        column.title === newTask.status
          ? {
              ...column,
              tasks: [
                {
                  id: Date.now(),
                  ...newTask,
                  createdBy: newTask.createdBy || profile?.name || "Workspace",
                },
                ...column.tasks,
              ],
            }
          : column
      )
    );
  };

  const openAddTaskModal = (status = "To Do") => {
    setSelectedStatus(status);
    setIsAddTaskOpen(true);
  };

  const handleUpdateTask = (taskId, updates) => {
    updateProjectTask(projectSlug, taskId, updates);
  };

  const handleAddMember = () => {
    const result = addProjectMember(projectSlug, newMemberName);
    setMemberFeedback(result.success ? `${result.memberName} was added to the project team.` : result.error);

    if (result.success) {
      setNewMemberName("");
    }
  };

  const handleCopyCode = async () => {
    if (!project?.joinCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(project.joinCode);
      setMemberFeedback(`Copied ${project.joinCode} to the clipboard.`);
    } catch {
      setMemberFeedback(`Share this code manually: ${project.joinCode}`);
    }
  };

  if (!project || !hasProjectAccess(project, currentMemberId, displayName)) {
    return (
      <DashboardLayout>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Project not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The project board you requested is not available for your current account.
          </p>
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <ArrowLeftIcon size={16} />
            Back to Projects
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 rounded-[32px] border border-border bg-card p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-primary transition hover:text-primary/80"
            >
              <ArrowLeftIcon size={14} />
              Back to Projects
            </button>
            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{project.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openAddTaskModal()}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <PlusIcon size={16} />
              New Task
            </button>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                    <LayersIcon size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total Tasks</p>
                    <p className="text-2xl font-bold">{boardStats.total}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-500/10 p-2 text-amber-600">
                    <BriefcaseBusinessIcon size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">{boardStats.inProgress}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-500/10 p-2 text-amber-600">
                    <CheckIcon size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">In Review</p>
                    <p className="text-2xl font-bold">{boardStats.inReview}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600">
                    <CheckCircle2Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Done</p>
                    <p className="text-2xl font-bold">{boardStats.completed}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-w-0 rounded-[32px] border border-border bg-card p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Project Board</h2>
                  <p className="text-sm text-muted-foreground">
                    Organize work the way teams usually do in Jira: backlog into progress into delivery.
                  </p>
                </div>
              </div>

              <div className="flex gap-8 overflow-x-auto pb-4 custom-scrollbar pr-2">
                {boardColumns.map((column) => (
                  <KanbanColumn
                    key={column.title}
                    {...column}
                    onAddTask={openAddTaskModal}
                    onUpdateTask={handleUpdateTask}
                  />
                ))}
              </div>
            </div>
          </div>

          <aside className="min-w-0 space-y-4 xl:w-[360px] 2xl:w-[400px]">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                  <UsersIcon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Project Team</h3>
                  <p className="text-xs text-muted-foreground">Admin, members, and invite access.</p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Admin</span>
                  <span className="font-semibold">{project.admin || project.owner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-semibold">{project.members.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Group code</span>
                  <span className="font-semibold">{project.joinCode}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {project.members.map((member) => (
                  <div key={member} className="flex items-center gap-3 rounded-2xl bg-muted/50 px-3 py-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-card bg-primary text-xs font-bold text-primary-foreground">
                      {member}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{resolveMemberLabel(member, project.memberDirectory)}</p>
                      <p className="text-xs text-muted-foreground">
                        {member === currentMemberId ? "You" : "Project member"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2">
                  <UsersIcon size={16} className="text-primary" />
                  <h4 className="text-sm font-semibold">Add member</h4>
                </div>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(event) => {
                    setNewMemberName(event.target.value);
                    setMemberFeedback("");
                  }}
                  placeholder="Enter teammate name"
                  className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <CheckIcon size={14} />
                  Add to team
                </button>
              </div>

              <div className="mt-4 space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2">
                  <KeyRoundIcon size={16} className="text-primary" />
                  <h4 className="text-sm font-semibold">Invite by code</h4>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-3 text-sm font-semibold">
                  <span>{project.joinCode}</span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-primary transition hover:text-primary/80"
                  >
                    <CopyIcon size={14} />
                    Copy
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Teammates can join from the Projects page by entering this group code.
                </p>
              </div>

              {memberFeedback && (
                <p className="mt-4 rounded-2xl bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                  {memberFeedback}
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-semibold">Project Access</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The creator is treated as the project admin, and task comments or attachments can be updated from the
                task drawer by any project member on the frontend.
              </p>
            </div>
          </aside>
        </section>
      </div>

      <Addtask
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSubmit={handleAddTask}
        statuses={boardColumns.map((column) => column.title)}
        assigneeOptions={assigneeOptions}
        initialStatus={selectedStatus}
      />
    </DashboardLayout>
  );
}

export default ProjectBoard;
