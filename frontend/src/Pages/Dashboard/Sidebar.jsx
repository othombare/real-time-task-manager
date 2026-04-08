import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3Icon,
  BriefcaseBusinessIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  SettingsIcon,
  ClipboardList
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useProjects } from "../Projects/useProjects";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getInitials, hasProjectAccess } from "../Projects/projectData";

const navItems = [
  { icon: LayoutDashboardIcon, label: "Dashboard", id: "dashboard", path: "/dashboard" },
 
  { icon: BriefcaseBusinessIcon, label: "Projects", id: "projects", path: "/projects" },
  { icon: BarChart3Icon, label: "Analytics", id: "analytics", path: "/analytics" },
  {icon:ClipboardList,label:"Personal To Do",id:"personal-todo",path:"/personal-todo"},
  { icon: MessageSquareIcon, label: "Message", id: "message", path: "/message", badge: 2 },
  { icon: SettingsIcon, label: "Settings", id: "settings", path: "/settings" },
  
];

export function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { profile } = useCurrentUser();
  const displayName = profile?.name || "Workspace User";
  const visibleProjects = projects.filter((project) =>
    hasProjectAccess(project, getInitials(displayName), displayName)
  );

  return (
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 260 }}
        className={cn(
          "min-h-dvh bg-card border-r border-border sticky top-0 flex flex-col transition-colors z-20 shadow-xl",
          collapsed ? "overflow-visible" : "overflow-hidden"
        )}
      >
      <div className="p-6 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.button
              type="button"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2.5"
              onClick={() => navigate("/dashboard")}
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                TV
              </div>
              <span className="font-bold text-xl tracking-tight">TaskVue</span>
            </motion.button>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-2 hover:bg-muted rounded-lg text-muted-foreground transition-all duration-300",
            collapsed ? "mx-auto ring-2 ring-primary/10" : ""
          )}
        >
          {collapsed ? <ChevronRightIcon size={18} /> : <ChevronLeftIcon size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-4">
        {navItems.map((item) => {
          // Route-driven active state keeps the sidebar in sync across all pages.
          const isProjectsItem = item.id === "projects";
          const isActive = item.path
            ? isProjectsItem
              ? location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
              : location.pathname === item.path
            : false;

          return (
            <div key={item.id} className="space-y-1">
              <motion.button
                type="button"
                onClick={() => item.path && navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl cursor-pointer group relative text-left",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <item.icon
                  size={20}
                  className={cn(
                    "group-hover:scale-110 transition-transform",
                    isActive ? "text-primary-foreground" : "text-primary group-hover:text-primary"
                  )}
                />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium text-sm whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {item.badge && !collapsed && (
                  <span
                    className={cn(
                      "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                      isActive ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {item.badge && collapsed && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary border-2 border-card" />
                )}
              </motion.button>

              {isProjectsItem && !collapsed && (
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-6 space-y-1 overflow-hidden border-l border-border/80 pl-4"
                    >
                      {visibleProjects.map((project) => {
                        const isProjectActive = location.pathname === `/projects/${project.slug}`;

                        return (
                          <button
                            key={project.slug}
                            type="button"
                            onClick={() => navigate(`/projects/${project.slug}`)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition",
                              isProjectActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                            <span className="truncate">{project.title}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </nav>
    </motion.aside>
  );
}
