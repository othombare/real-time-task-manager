import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2Icon,
  ClockIcon,
  AlertCircleIcon,
  LayersIcon,
  FilterIcon,
  PlusIcon,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import Addtask from "../Addtask";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { StatCard } from "./StatCard";
import { KanbanColumn } from "./KanbanColumn";
import { useProjects } from "../Projects/useProjects";

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
    title: "Done",
    color: "bg-emerald-500",
    tasks: [],
  },
];

const getUserInitials = (name) =>
  (name || "OJ")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getGreetingByTime = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
};

function Home() {
  const { profile } = useCurrentUser();
  const { projects } = useProjects();
  const firstName = profile?.name?.split(" ")[0] || "there";
  const userInitials = getUserInitials(profile?.name);
  const greeting = getGreetingByTime();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("To Do");
  const [personalColumns, setPersonalColumns] = useState(dashboardColumns);
  const projectOptions = useMemo(
    () => projects.map((project) => project.title),
    [projects]
  );

  const boardColumns = useMemo(() => {
    const assignedProjectColumns = dashboardColumns.map((column) => ({
      ...column,
      tasks: [],
    }));

    projects.forEach((project) => {
      project.board.forEach((column) => {
        const targetColumn = assignedProjectColumns.find(
          (item) => item.title === column.title
        );

        if (!targetColumn) {
          return;
        }

        const matchingTasks = column.tasks
          .filter((task) => task.assignee.includes(userInitials))
          .map((task) => ({
            ...task,
            projectName: project.title,
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
  }, [personalColumns, projects, userInitials]);

  const taskStats = useMemo(() => {
    const allTasks = boardColumns.flatMap((column) => column.tasks);
    const completedCount = boardColumns.find((column) => column.title === "Done")?.tasks.length || 0;
    const inProgressCount = boardColumns.find((column) => column.title === "In Progress")?.tasks.length || 0;
    const overdueCount = allTasks.filter((task) => {
      const parsedDate = Date.parse(`${task.dueDate}, ${new Date().getFullYear()}`);
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

  const handleAddTask = (newTask) => {
    setPersonalColumns((currentColumns) =>
      currentColumns.map((column) =>
        column.title === newTask.status
          ? {
              ...column,
              tasks: [
                {
                  id: Date.now(),
                  ...newTask,
                  projectName: newTask.projectName || "Workspace",
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

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <section className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{greeting}, {firstName}</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            Here&apos;s what&apos;s assigned to you across the workspace.
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold ring-1 ring-primary/20">
              <ClockIcon size={12} /> Upcoming Sync in 20m
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
            <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAddTaskModal()}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-card border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-all shadow-sm active:scale-95 group"
                >
                <PlusIcon size={16} className="text-primary group-hover:rotate-90 transition-transform" />
                New Task
              </button>
              <div className="h-4 w-[1px] bg-border mx-1" />
              <p className="text-xs text-muted-foreground font-medium hidden sm:block">Last edited: 2 mins ago</p>
            </div>
          </div>

            <div className="flex gap-8 overflow-x-auto pb-10 custom-scrollbar snap-x snap-mandatory pr-4">
              {boardColumns.map((column, idx) => (
                <KanbanColumn
                  key={idx}
                  {...column}
                  onAddTask={openAddTaskModal}
                />
              ))}
            </div>
        </section>
      </div>

      <Addtask
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSubmit={handleAddTask}
        statuses={boardColumns.map((column) => column.title)}
        showProjectField
        projectOptions={projectOptions}
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
