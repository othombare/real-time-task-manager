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

const kanbanData = [
  {
    title: "To Do",
    color: "bg-slate-400/50",
    tasks: [
      { id: 1, title: "Design system research and initial mockup design", priority: "High", assignee: ["OJ", "AK"], dueDate: "Apr 5", comments: 3, attachments: 2 },
      { id: 2, title: "Weekly client sync and presentation preparation", priority: "Medium", assignee: ["OJ"], dueDate: "Apr 4", comments: 1 },
      { id: 3, title: "Fix production bugs reported by QA team last night", priority: "High", assignee: ["MK"], dueDate: "Apr 3" },
    ],
  },
  {
    title: "In Progress",
    color: "bg-primary",
    tasks: [
      { id: 4, title: "Develop core API endpoints for task management", priority: "High", assignee: ["AK", "SK"], dueDate: "Apr 6", comments: 8, attachments: 5 },
      { id: 5, title: "Refactor sidebar component for better accessibility", priority: "Medium", assignee: ["OJ"], dueDate: "Apr 8" },
    ],
  },
  {
    title: "Review",
    color: "bg-amber-400",
    tasks: [
      { id: 6, title: "Landing page SEO optimization and performance audit", priority: "Low", assignee: ["MK"], dueDate: "Apr 10", attachments: 1 },
      { id: 7, title: "Integration with Stripe for payment processing", priority: "High", assignee: ["SK"], dueDate: "Apr 12", comments: 12 },
    ],
  },
  {
    title: "Done",
    color: "bg-emerald-500",
    tasks: [
      { id: 8, title: "Setup CI/CD pipeline using Github Actions", priority: "Medium", assignee: ["AK"], dueDate: "Mar 30", comments: 2 },
      { id: 9, title: "Initial project scoping and feasibility study", priority: "Low", assignee: ["OJ", "SK"], dueDate: "Mar 28" },
      { id: 10, title: "Define sprint goals and initial product backlog", priority: "High", assignee: ["OJ"], dueDate: "Mar 25", attachments: 3 },
    ],
  },
];

const getGreetingByTime = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
};

function Home() {
  const { profile } = useCurrentUser();
  const firstName = profile?.name?.split(" ")[0] || "there";
  const greeting = getGreetingByTime();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [boardColumns, setBoardColumns] = useState(kanbanData);

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
    setBoardColumns((currentColumns) =>
      currentColumns.map((column) =>
        column.title === newTask.status
          ? {
              ...column,
              tasks: [
                {
                  id: Date.now(),
                  ...newTask,
                },
                ...column.tasks,
              ],
            }
          : column
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <section className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{greeting}, {firstName}</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            Here&apos;s what&apos;s happening today in your workspace.
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
                onClick={() => setIsAddTaskOpen(true)}
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
              <KanbanColumn key={idx} {...column} />
            ))}
          </div>
        </section>
      </div>

      <Addtask
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSubmit={handleAddTask}
        statuses={boardColumns.map((column) => column.title)}
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
