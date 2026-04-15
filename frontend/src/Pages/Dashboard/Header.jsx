import { useState } from "react";
import {
  BellIcon,
  ChevronDownIcon,
  HelpCircleIcon,
  LogOutIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { logout } from "../../store/authSlice";
import { useAppDispatch } from "../../store/hooks";
import CreateProjectModal from "../Projects/CreateProjectModal";
import { useProjects } from "../Projects/useProjects";
import { getInitials, resolveMemberLabel } from "../Projects/projectData";

export function Header() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { profile } = useCurrentUser();
  const { createProject } = useProjects();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const displayName = profile?.name || "Workspace User";
  const initials = (profile?.name || "WU")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
      // Clear the local auth session before sending the user back to login.
      dispatch(logout());
      alert("Logged out successfully.");
      navigate("/login", { replace: true });
    };

  const handleCreateProject = async (projectData) => {
    const creatorId = getInitials(displayName) || initials;
    const selectedMembers = Array.from(new Set([creatorId, ...(projectData.members || [])]));

    const newProject = await createProject({
      ...projectData,
      owner: displayName,
      admin: displayName,
      stage: "Planning",
      members: selectedMembers,
      memberDirectory: selectedMembers.reduce(
        (directory, memberId) => ({
          ...directory,
          [memberId]: memberId === creatorId ? displayName : resolveMemberLabel(memberId),
        }),
        {}
      ),
    });

    if (newProject?.slug) {
      navigate(`/projects/${newProject.slug}`);
    }
  };

  return (
    <>
      <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10 px-8 flex items-center justify-between transition-all">
        <div className="flex items-center gap-10 flex-1">
          <div className="relative group flex-1 max-w-lg">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search projects, tasks, members..."
              className="w-full bg-muted/40 border border-transparent rounded-xl py-2.5 pl-11 pr-4 text-sm focus:bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary/20 outline-none transition-all placeholder:text-muted-foreground placeholder:font-medium"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-card text-[10px] font-bold text-muted-foreground">Ctrl</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-card text-[10px] font-bold text-muted-foreground">K</kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setIsCreateProjectOpen(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:translate-y-[-1px] transition-all group active:scale-95"
          >
            <PlusIcon size={16} className="group-hover:rotate-90 transition-transform" />
            Create New Project
          </button>

          <div className="flex items-center gap-2 border-l border-border pl-6 ml-2">
            <button
              type="button"
              onClick={() => navigate("/notifications")}
              className="p-2.5 hover:bg-muted rounded-full relative text-muted-foreground hover:text-foreground transition-all group active:scale-90"
            >
              <BellIcon size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-background group-hover:scale-125 transition-transform" />
            </button>

            <button type="button" className="p-2.5 hover:bg-muted rounded-full text-muted-foreground transition-all active:scale-90"
            onClick={handleLogout}>
              <LogOutIcon size={20} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/my-profile")}
            className="flex items-center gap-3.5 pl-4 ml-2 border-l border-border cursor-pointer group select-none"
          >
            <div className="flex flex-col items-end hidden sm:flex">
              <p className="text-sm font-bold leading-none">{displayName}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80 mt-1">Free Plan</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 border-2 border-border p-0.5 group-hover:shadow-md transition-shadow">
              <div className="w-full h-full rounded-lg bg-white flex items-center justify-center font-bold text-primary shadow-inner">{initials}</div>
            </div>
            <ChevronDownIcon size={16} className="text-muted-foreground group-hover:text-foreground transition-colors group-hover:rotate-180 duration-300" />
          </button>
        </div>
      </header>

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSubmit={handleCreateProject}
      />
    </>
  );
}
