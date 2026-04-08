import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  buildMemberDirectory,
  cloneProjectBoard,
  cloneProjects,
  createProjectSlug,
  generateJoinCode,
  getInitials,
  projectBoardTemplate,
  seedProjects,
} from "./projectData";

const STORAGE_KEY = "taskvue-projects";

const ProjectsContext = createContext({
  projects: [],
  createProject: () => null,
  getProjectBySlug: () => null,
  joinProjectByCode: () => ({ success: false }),
  addProjectMember: () => ({ success: false }),
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

  const createProject = useCallback(
    ({
      title,
      description,
      stage,
      owner,
      admin,
      members,
      memberDirectory = {},
      joinCode,
      attachments = 0,
      attachmentFiles = [],
    }) => {
    const baseSlug = createProjectSlug(title) || `project-${Date.now()}`;
    let candidateSlug = baseSlug;
    let suffix = 1;

    while (projects.some((project) => project.slug === candidateSlug)) {
      suffix += 1;
      candidateSlug = `${baseSlug}-${suffix}`;
    }

    const uniqueMembers = Array.from(new Set(members || []));
    const newProject = {
      id: Date.now(),
      slug: candidateSlug,
      title,
      description,
      status: "Planning",
      stage: stage || "Planning",
      owner: owner || "Workspace",
      admin: admin || owner || "Workspace",
      joinCode: joinCode || generateJoinCode(title),
      members: uniqueMembers,
      memberDirectory: Object.keys(memberDirectory).length > 0 ? memberDirectory : buildMemberDirectory(uniqueMembers),
      attachments,
      attachmentFiles,
      board: cloneProjectBoard(projectBoardTemplate),
    };

    setProjects((currentProjects) => [newProject, ...currentProjects]);
    return newProject;
    },
    [projects]
  );

  const addProjectMember = useCallback((projectSlug, memberName) => {
    const trimmedName = memberName.trim();

    if (!trimmedName) {
      return { success: false, error: "Enter a member name first." };
    }

    const memberId = getInitials(trimmedName);

    if (!memberId) {
      return { success: false, error: "Unable to create initials for that member." };
    }

    let result = { success: false, error: "Project not found." };

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.slug !== projectSlug) {
          return project;
        }

        if (project.members.includes(memberId)) {
          result = { success: false, error: `${trimmedName} is already in this project.` };
          return project;
        }

        result = { success: true, memberId, memberName: trimmedName };
        return {
          ...project,
          members: [...project.members, memberId],
          memberDirectory: {
            ...(project.memberDirectory || {}),
            [memberId]: trimmedName,
          },
        };
      })
    );

    return result;
  }, []);

  const joinProjectByCode = useCallback((code, memberName) => {
    const normalizedCode = code.trim().toUpperCase();
    const trimmedName = memberName.trim();
    const memberId = getInitials(trimmedName);

    if (!normalizedCode) {
      return { success: false, error: "Enter a project code first." };
    }

    if (!trimmedName || !memberId) {
      return { success: false, error: "A valid user name is required to join a project." };
    }

    let joinedProject = null;
    let error = "We couldn't find a project for that code.";

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if ((project.joinCode || "").toUpperCase() !== normalizedCode) {
          return project;
        }

        joinedProject = project;
        error = "";

        if (project.members.includes(memberId)) {
          return {
            ...project,
            memberDirectory: {
              ...(project.memberDirectory || {}),
              [memberId]: project.memberDirectory?.[memberId] || trimmedName,
            },
          };
        }

        return {
          ...project,
          members: [...project.members, memberId],
          memberDirectory: {
            ...(project.memberDirectory || {}),
            [memberId]: trimmedName,
          },
        };
      })
    );

    if (!joinedProject) {
      return { success: false, error };
    }

    return { success: true, projectSlug: joinedProject.slug, projectTitle: joinedProject.title };
  }, []);

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
              board: (() => {
                const currentStatus = project.board.find((column) =>
                  column.tasks.some((task) => task.id === taskId)
                )?.title;
                const nextStatus = updates.status || currentStatus;

                if (!currentStatus) {
                  return project.board;
                }

                let taskToUpdate = null;

                const columnsWithoutTask = project.board.map((column) => ({
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
                  return project.board;
                }

                return columnsWithoutTask.map((column) =>
                  column.title === nextStatus
                    ? {
                        ...column,
                        tasks: [taskToUpdate, ...column.tasks],
                      }
                    : column
                );
              })(),
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
      joinProjectByCode,
      addProjectMember,
      updateProjectBoard,
      updateProjectTask,
    }),
    [addProjectMember, createProject, joinProjectByCode, projects, updateProjectBoard, updateProjectTask]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}
