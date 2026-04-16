import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2Icon,
  ClockIcon,
  AlertCircleIcon,
  LayersIcon,
  FilterIcon,
} from "lucide-react";
import { DragDropContext } from "react-beautiful-dnd";
import DashboardLayout from "./DashboardLayout";
import Addtask from "../Addtask";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { StatCard } from "./StatCard";
import { KanbanColumn } from "./KanbanColumn";
import { useProjects } from "../Projects/useProjects";
import { getInitials, hasProjectAccess } from "../Projects/projectData";
import { isTaskAssignedToUser } from "../../utils/taskAdapters";

const stats = [
  {
    title: "Total Tasks",
    value: "154",
    icon: LayersIcon,
    trend: "12%",
    trendType: "up",
  },
  {
    title: "Completed",
    value: "102",
    icon: CheckCircle2Icon,
    trend: "8%",
    trendType: "up",
  },
  {
    title: "In Progress",
    value: "32",
    icon: ClockIcon,
    trend: "4%",
    trendType: "down",
  },
  {
    title: "Overdue",
    value: "05",
    icon: AlertCircleIcon,
    trend: "2%",
    trendType: "up",
  },
];

const dashboardColumns = [
  {
    title: "To Do",
    color: "bg-slate-400/50",
    tasks: [],
  },
  {
    title: "In Progress",
    color: "bg-primary",
    tasks: [],
  },
  {
    title: "In Review",
    color: "bg-amber-500",
    tasks: [],
  },
  {
    title: "Done",
    color: "bg-emerald-500",
    tasks: [],
  },
];

const PERSONAL_COLUMNS_STORAGE_KEY = "taskvue-dashboard-personal-columns";

const getPersonalColumnsStorageKey = (userId = "anonymous") =>
  `${PERSONAL_COLUMNS_STORAGE_KEY}:${userId || "anonymous"}`;

const cloneDashboardColumns = () =>
  dashboardColumns.map((column) => ({
    ...column,
    tasks: [],
  }));

const readStoredPersonalColumns = (storageKey) => {
  try {
    const savedColumns = localStorage.getItem(storageKey);

    if (!savedColumns) {
      return cloneDashboardColumns();
    }

    const parsedColumns = JSON.parse(savedColumns);

    if (!Array.isArray(parsedColumns)) {
      return cloneDashboardColumns();
    }

    return cloneDashboardColumns().map((column) => {
      const storedColumn = parsedColumns.find((item) => item?.title === column.title);

      return {
        ...column,
        tasks: Array.isArray(storedColumn?.tasks) ? storedColumn.tasks : [],
      };
    });
  } catch {
    return cloneDashboardColumns();
  }
};

const getGreetingByTime = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 24) return "Good Evening";
  return "Welcome to Dashboard";
};

function Home() {
  const { profile } = useCurrentUser();
  const { projects, updateProjectTask } = useProjects();
  const personalColumnsStorageKey = getPersonalColumnsStorageKey(profile?._id);
  const firstName = profile?.name?.split(" ")[0] || "there";
  const displayName = profile?.name || "Workspace User";
  const userInitials = getInitials(displayName || "OJ");
  const greeting = getGreetingByTime();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("To Do");
  const [personalColumns, setPersonalColumns] = useState(() =>
    readStoredPersonalColumns(personalColumnsStorageKey)
  );

  useEffect(() => {
    setPersonalColumns(readStoredPersonalColumns(personalColumnsStorageKey));
  }, [personalColumnsStorageKey]);

  useEffect(() => {
    localStorage.setItem(personalColumnsStorageKey, JSON.stringify(personalColumns));
  }, [personalColumns, personalColumnsStorageKey]);

  const visibleProjects = useMemo(
    () => projects.filter((project) => hasProjectAccess(project, userInitials, displayName)),
    [displayName, projects, userInitials]
  );
  const boardColumns = useMemo(() => {
    const assignedProjectColumns = dashboardColumns.map((column) => ({
      ...column,
      tasks: [],
    }));

    visibleProjects.forEach((project) => {
      project.board.forEach((column) => {
        const targetColumn = assignedProjectColumns.find(
          (item) => item.title === column.title
        );

        if (!targetColumn) {
          return;
        }

        const matchingTasks = column.tasks
          .filter((task) =>
            isTaskAssignedToUser(task, {
              userId: profile?._id || null,
              initials: userInitials,
            })
          )
          .map((task) => ({
                ...task,
                projectName: project.title,
                projectSlug: project.slug,
                createdBy: task.createdBy || project.owner || "Workspace",
              }));

        targetColumn.tasks.push(...matchingTasks);
      });
    });

    return assignedProjectColumns.map((column) => {
      const personalColumn = personalColumns.find(
        (item) => item.title === column.title
      );

      return {
        ...column,
        tasks: [...(personalColumn?.tasks ?? []), ...column.tasks],
      };
    });
  }, [personalColumns, profile?._id, userInitials, visibleProjects]);

  const taskStats = useMemo(() => {
    const allTasks = boardColumns.flatMap((column) => column.tasks);
    const completedCount = boardColumns.find((column) => column.title === "Done")?.tasks.length || 0;
    const inProgressCount = boardColumns.find((column) => column.title === "In Progress")?.tasks.length || 0;
    const overdueCount = allTasks.filter((task) => {
      const parsedDate = task.dueDateRaw ? Date.parse(task.dueDateRaw) : Date.parse(`${task.dueDate}, ${new Date().getFullYear()}`);
      return Number.isFinite(parsedDate) && parsedDate < Date.now() && task.status !== "Done";
    }).length;

    return {
      total: allTasks.length,
      completed: completedCount,
      inProgress: inProgressCount,
      overdue: overdueCount,
    };
  }, [boardColumns]);

  const dashboardStats = [
    {
      ...stats[0],
      value: String(taskStats.total).padStart(2, "0"),
    },
    {
      ...stats[1],
      value: String(taskStats.completed).padStart(2, "0"),
    },
    {
      ...stats[2],
      value: String(taskStats.inProgress).padStart(2, "0"),
    },
    {
      ...stats[3],
      value: String(taskStats.overdue).padStart(2, "0"),
    },
  ];

  const handleAddTask = async (newTask) => {
    setPersonalColumns((currentColumns) =>
      currentColumns.map((column) =>
        column.title === newTask.status
          ? {
              ...column,
              tasks: [
                {
                  id: Date.now(),
                  ...newTask,
                  status: newTask.status,
                  projectName: newTask.projectName || "Workspace",
                  createdBy: newTask.createdBy || profile?.name || "You",
                },
                ...column.tasks,
              ],
            }
          : column
      )
    );

    return { success: true };
  };

  const openAddTaskModal = (status = "To Do") => {
    setSelectedStatus(status);
    setIsAddTaskOpen(true);
  };

  const handleUpdateTask = async (taskId, updates, projectSlug) => {
    if (projectSlug) {
      const result = await updateProjectTask(projectSlug, taskId, updates);
      if (!result?.success && result?.error) {
        window.alert(result.error);
      }
      return;
    }

    setPersonalColumns((currentColumns) => {
      const currentStatus = currentColumns.find((column) =>
        column.tasks.some((task) => task.id === taskId)
      )?.title;
      const nextStatus = updates.status || currentStatus;

      if (!currentStatus) {
        return currentColumns;
      }

      let taskToUpdate = null;

      const columnsWithoutTask = currentColumns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => {
          if (task.id !== taskId) {
            return true;
          }

          taskToUpdate = {
            ...task,
            ...updates,
            status: nextStatus,
          };
          return false;
        }),
      }));

      if (!taskToUpdate) {
        return currentColumns;
      }

      return columnsWithoutTask.map((column) =>
        column.title === nextStatus
          ? {
              ...column,
              tasks: [taskToUpdate, ...column.tasks],
            }
          : column
      );
    });
  };

  const handleDragEnd = async ({ source, destination }) => {
    if (!destination) {
      return;
    }

    const isSamePosition =
      source.droppableId === destination.droppableId && source.index === destination.index;

    if (isSamePosition) {
      return;
    }

    const sourceColumn = boardColumns.find((column) => column.title === source.droppableId);
    const destinationColumn = boardColumns.find((column) => column.title === destination.droppableId);
    const movedTask = sourceColumn?.tasks[source.index];

    if (!sourceColumn || !destinationColumn || !movedTask) {
      return;
    }

    const destinationTasks = [...destinationColumn.tasks];

    if (source.droppableId === destination.droppableId) {
      destinationTasks.splice(source.index, 1);
    }

    if (movedTask.projectSlug) {
      if (source.droppableId === destination.droppableId) {
        return;
      }

      const result = await updateProjectTask(movedTask.projectSlug, movedTask.id, {
        status: destination.droppableId,
      }, {
        preferredColumnTitle: destination.droppableId,
        preferredIndex: destination.index,
      });

      if (!result?.success && result?.error) {
        window.alert(result.error);
      }

      return;
    }

    const personalDestinationIndex = destinationTasks
      .slice(0, destination.index)
      .filter((task) => !task.projectSlug).length;

    setPersonalColumns((currentColumns) => {
      const nextColumns = currentColumns.map((column) => ({
        ...column,
        tasks: [...column.tasks],
      }));

      const sourcePersonalColumnIndex = nextColumns.findIndex(
        (column) => column.title === source.droppableId
      );
      const destinationPersonalColumnIndex = nextColumns.findIndex(
        (column) => column.title === destination.droppableId
      );

      if (sourcePersonalColumnIndex === -1 || destinationPersonalColumnIndex === -1) {
        return currentColumns;
      }

      const sourcePersonalColumn = nextColumns[sourcePersonalColumnIndex];
      const destinationPersonalColumn = nextColumns[destinationPersonalColumnIndex];
      const [removedTask] = sourcePersonalColumn.tasks.splice(source.index, 1);

      if (!removedTask) {
        return currentColumns;
      }

      destinationPersonalColumn.tasks.splice(personalDestinationIndex, 0, {
        ...removedTask,
        status: destinationPersonalColumn.title,
      });

      return nextColumns;
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <section className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{greeting}, {firstName}</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            Here&apos;s what&apos;s assigned to you across the workspace.
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold ring-1 ring-primary/20">
              <ClockIcon size={12} /> Last synced 20m ago
            </span>
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight">Task Board</h2>
              <div className="h-5 w-[1px] bg-border mx-1" />
              <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-muted rounded-lg text-sm text-muted-foreground transition-colors font-medium">
                <FilterIcon size={14} />
                Filters
              </button>
            </div>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-8 overflow-x-auto pb-10 custom-scrollbar snap-x snap-mandatory pr-4">
              {boardColumns.map((column) => (
                <KanbanColumn
                  key={column.title}
                  {...column}
                  droppableId={column.title}
                  onAddTask={openAddTaskModal}
                  onUpdateTask={(taskId, updates) => {
                    const matchedTask = column.tasks.find((task) => task.id === taskId);
                    handleUpdateTask(taskId, updates, matchedTask?.projectSlug);
                  }}
                />
              ))}
            </div>
          </DragDropContext>
        </section>
      </div>

      <Addtask
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSubmit={handleAddTask}
        statuses={boardColumns.map((column) => column.title)}
        hideAssigneeField
        defaultAssignee={userInitials}
        initialStatus={selectedStatus}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
    </DashboardLayout>
  );
}

export default Home;
