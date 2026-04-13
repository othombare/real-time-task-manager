import { useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  CheckCircle2Icon,
  LayersIcon,
  PlusIcon,
  UsersIcon,
  BriefcaseBusinessIcon,
  PinIcon,
  PaperclipIcon,
} from "lucide-react";
import { DragDropContext } from "react-beautiful-dnd";
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
  const { getProjectBySlug, updateProjectBoard, updateProjectTask, deleteProjectTask } = useProjects();
  const project = getProjectBySlug(projectSlug);
  const displayName = profile?.name || "Workspace User";
  const currentMemberId = getInitials(displayName);
  const currentActor = useMemo(
    () => ({
      userId: profile?._id || null,
      name: displayName,
    }),
    [displayName, profile?._id]
  );
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("To Do");
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
  const handleDragEnd = ({ source, destination }) => {
    if (!destination) {
      return;
    }

    const isSamePosition =
      source.droppableId === destination.droppableId && source.index === destination.index;

    if (isSamePosition) {
      return;
    }

    const updateResult = updateProjectBoard(projectSlug, (currentColumns, helpers = {}) => {
      const nextColumns = currentColumns.map((column) => ({
        ...column,
        tasks: [...column.tasks],
      }));

      const sourceColumnIndex = nextColumns.findIndex((column) => column.title === source.droppableId);
      const destinationColumnIndex = nextColumns.findIndex(
        (column) => column.title === destination.droppableId
      );

      if (sourceColumnIndex === -1 || destinationColumnIndex === -1) {
        return currentColumns;
      }

      const sourceColumn = nextColumns[sourceColumnIndex];
      const destinationColumn = nextColumns[destinationColumnIndex];
      const [movedTask] = sourceColumn.tasks.splice(source.index, 1);

      if (!movedTask) {
        return currentColumns;
      }

      if (!helpers.canManageTask?.(movedTask)) {
        return null;
      }

      destinationColumn.tasks.splice(destination.index, 0, {
        ...movedTask,
        status: destinationColumn.title,
      });

      return nextColumns;
    }, currentActor);

    if (!updateResult?.success && updateResult?.error) {
      window.alert(updateResult.error);
    }
  };


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
                  status: newTask.status,
                  createdBy: newTask.createdBy || profile?.name || "Workspace",
                  createdByUserId: newTask.createdByUserId || profile?._id || null,
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
    const result = updateProjectTask(projectSlug, taskId, updates, currentActor);
    if (!result?.success && result?.error) {
      window.alert(result.error);
    }
  };

  const handleDeleteTask = (taskId) => {
    const result = deleteProjectTask(projectSlug, taskId, currentActor);
    if (!result?.success && result?.error) {
      window.alert(result.error);
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
              onClick={() => navigate(`/projects/${project.slug}/attachments`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
            >
              <PaperclipIcon size={16} />
              View Attachments
            </button>


            <button
              type="button"
              onClick={() => navigate(`/projects/${project.slug}/team-members`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
            >
              <UsersIcon size={16} />
              View Team Members
            </button>
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

        <section className="space-y-6">
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
                  
                </div>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid gap-5 xl:grid-cols-4">
                  {boardColumns.map((column) => (
                    <KanbanColumn
                      key={column.title}
                      {...column}
                      droppableId={column.title}
                      onAddTask={openAddTaskModal}
                      onUpdateTask={handleUpdateTask}
                      onDeleteTask={handleDeleteTask}
                      currentUserName={displayName}
                      currentUserId={profile?._id || null}
                    />
                  ))}
                </div>
              </DragDropContext>
            </div>
          </div>
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
