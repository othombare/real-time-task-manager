import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { cloneProjectBoard, cloneProjects, createProjectSlug, projectBoardTemplate, seedProjects } from "./projectData";

const STORAGE_KEY = "taskvue-projects";

const ProjectsContext = createContext({
  projects: [],
  createProject: () => null,
  getProjectBySlug: () => null,
  updateProjectBoard: () => {},
  updateProjectTask: () => {},
});

export { ProjectsContext };

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    try {
      const storedProjects = localStorage.getItem(STORAGE_KEY);

      if (!storedProjects) {
        return cloneProjects(seedProjects);
      }

      const parsedProjects = JSON.parse(storedProjects);
      return Array.isArray(parsedProjects) ? cloneProjects(parsedProjects) : cloneProjects(seedProjects);
    } catch {
      return cloneProjects(seedProjects);
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const createProject = useCallback(({ title, description, stage, owner, members, attachments = 0, attachmentFiles = [] }) => {
    const baseSlug = createProjectSlug(title) || `project-${Date.now()}`;
    let candidateSlug = baseSlug;
    let suffix = 1;

    while (projects.some((project) => project.slug === candidateSlug)) {
      suffix += 1;
      candidateSlug = `${baseSlug}-${suffix}`;
    }

    const newProject = {
      id: Date.now(),
      slug: candidateSlug,
      title,
      description,
      status: "Planning",
      stage: stage || "Planning",
      owner: owner || "Workspace",
      members,
      attachments,
      attachmentFiles,
      board: cloneProjectBoard(projectBoardTemplate),
    };

    setProjects((currentProjects) => [newProject, ...currentProjects]);
    return newProject;
  }, [projects]);

  const updateProjectBoard = useCallback((projectSlug, updater) => {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.slug === projectSlug
          ? {
              ...project,
              board: updater(cloneProjectBoard(project.board)),
            }
          : project
      )
    );
  }, []);

  const updateProjectTask = useCallback((projectSlug, taskId, updates) => {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.slug === projectSlug
          ? {
              ...project,
              board: project.board.map((column) => ({
                ...column,
                tasks: column.tasks.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        ...updates,
                      }
                    : task
                ),
              })),
            }
          : project
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      projects,
      createProject,
      getProjectBySlug: (slug) => projects.find((project) => project.slug === slug),
      updateProjectBoard,
      updateProjectTask,
    }),
    [createProject, projects, updateProjectBoard, updateProjectTask]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}
