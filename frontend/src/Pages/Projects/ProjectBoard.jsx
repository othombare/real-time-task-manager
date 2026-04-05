import { useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  BriefcaseBusinessIcon,
  CheckCircle2Icon,
  LayersIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Addtask from "../Addtask";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { KanbanColumn } from "../Dashboard/KanbanColumn";
import { cloneProjectBoard, projectBoardTemplate } from "./projectData";
import { useProjects } from "./useProjects";

function ProjectBoard() {
  const navigate = useNavigate();
  const { projectSlug } = useParams();
  const { getProjectBySlug, updateProjectBoard } = useProjects();
  const project = getProjectBySlug(projectSlug);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("To Do");
  const boardColumns = useMemo(
    () => (project ? cloneProjectBoard(project.board) : cloneProjectBoard(projectBoardTemplate)),
    [project]
  );

  const boardStats = useMemo(() => {
    const allTasks = boardColumns.flatMap((column) => column.tasks);

    return {
      total: allTasks.length,
      completed: boardColumns.find((column) => column.title === "Done")?.tasks.length || 0,
      inProgress: boardColumns.find((column) => column.title === "In Progress")?.tasks.length || 0,
    };
  }, [boardColumns]);

  const handleAddTask = (newTask) => {
    updateProjectBoard(projectSlug, (currentColumns) =>
      currentColumns.map((column) =>
        column.title === newTask.status
          ? {
              ...column,
              tasks: [{ id: Date.now(), ...newTask }, ...column.tasks],
            }
          : column
      )
    );
  };

  const openAddTaskModal = (status = "To Do") => {
    setSelectedStatus(status);
    setIsAddTaskOpen(true);
  };

  if (!project) {
    return (
      <DashboardLayout>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Project not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The project board you requested is not available right now.
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
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">
              {project.stage}
            </span>
            <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
              {project.status}
            </span>
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

        <section className="grid gap-5 xl:grid-cols-[1.55fr_0.8fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
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

            <div className="rounded-[32px] border border-border bg-card p-5 shadow-sm">
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
                  />
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                  <UsersIcon size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Project Team</h3>
                  <p className="text-xs text-muted-foreground">Owner and active contributors.</p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Owner</span>
                  <span className="font-semibold">{project.owner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-semibold">{project.members.length}</span>
                </div>
              </div>

              <div className="mt-4 flex -space-x-2">
                {project.members.map((member) => (
                  <div
                    key={member}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-card bg-primary text-xs font-bold text-primary-foreground"
                  >
                    {member}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
              <h3 className="font-semibold text-primary">Workflow</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Each project now has its own Jira-style task board, so you can open a project and manage only the work
                that belongs to it.
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
        initialStatus={selectedStatus}
      />
    </DashboardLayout>
  );
}

export default ProjectBoard;
