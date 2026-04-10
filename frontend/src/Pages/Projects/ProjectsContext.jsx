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
import {
  createProject as createProjectApi,
  deleteProject as deleteProjectApi,
  getProjects as getProjectsApi,
  joinProject as joinProjectApi,
} from "../../utils/projectApi";
import { getAuthToken } from "../../api/axios";

const STORAGE_KEY = "taskvue-projects";

const readStoredProjects = () => {
  try {
    const storedProjects = localStorage.getItem(STORAGE_KEY);
    if (!storedProjects) {
      return [];
    }

    const parsedProjects = JSON.parse(storedProjects);
    return Array.isArray(parsedProjects) ? cloneProjects(parsedProjects) : [];
  } catch {
    return [];
  }
};

const buildProjectKey = (project) =>
  String(project?._id || project?.id || project?.projectCode || project?.joinCode || project?.slug || "");

const getMemberIdentity = (member) => {
  const user = member?.user ?? member;

  if (typeof user === "string") {
    const label = user;
    return {
      id: getInitials(label) || label.slice(0, 2).toUpperCase(),
      label,
    };
  }

  const label = user?.name || user?.email || user?._id || "Member";

  return {
    id: getInitials(label) || String(user?._id || "MB").slice(0, 2).toUpperCase(),
    label,
  };
};

const normalizeProject = (project) => {
  const title = project?.title || project?.name || "Untitled Project";
  const memberEntries = Array.isArray(project?.members)
    ? project.members
        .map(getMemberIdentity)
        .filter((member) => Boolean(member.id))
    : [];
  const members = memberEntries.map((member) => member.id);
  const memberDirectory = memberEntries.reduce(
    (directory, member) => ({
      ...directory,
      [member.id]: member.label,
    }),
    {}
  );
  const attachments = Array.isArray(project?.attachments)
    ? project.attachments.length
    : Number(project?.attachments) || 0;
  const attachmentFiles = Array.isArray(project?.attachments)
    ? project.attachments
        .map((attachment) => attachment?.fileName || attachment?.name)
        .filter(Boolean)
    : project?.attachmentFiles || [];

  return {
    ...project,
    id: project?.id || project?._id || Date.now(),
    _id: project?._id || project?.id,
    name: project?.name || title,
    title,
    slug: project?.slug || createProjectSlug(title) || `project-${Date.now()}`,
    description: project?.description || "",
    status: project?.status || "Planning",
    stage: project?.stage || "Planning",
    owner: project?.owner || project?.createdBy?.name || "Workspace",
    admin: project?.admin || project?.createdBy?.name || project?.owner || "Workspace",
    joinCode: project?.joinCode || project?.projectCode || generateJoinCode(title),
    projectCode: project?.projectCode || project?.joinCode || generateJoinCode(title),
    members,
    memberDirectory:
      Object.keys(project?.memberDirectory || {}).length > 0
        ? project.memberDirectory
        : Object.keys(memberDirectory).length > 0
          ? memberDirectory
          : buildMemberDirectory(members),
    attachments,
    attachmentFiles,
    board: cloneProjectBoard(project?.board),
  };
};

const mergeProjectsWithStoredState = (incomingProjects) => {
  const storedProjects = readStoredProjects();
  const storedProjectMap = new Map(
    storedProjects.map((project) => [buildProjectKey(project), normalizeProject(project)])
  );

  return incomingProjects.map((project) => {
    const normalizedProject = normalizeProject(project);
    const storedProject = storedProjectMap.get(buildProjectKey(normalizedProject));

    if (!storedProject) {
      return normalizedProject;
    }

    return {
      ...normalizedProject,
      status: storedProject.status || normalizedProject.status,
      stage: storedProject.stage || normalizedProject.stage,
      memberDirectory:
        Object.keys(storedProject.memberDirectory || {}).length > 0
          ? storedProject.memberDirectory
          : normalizedProject.memberDirectory,
      attachments: storedProject.attachments ?? normalizedProject.attachments,
      attachmentFiles: storedProject.attachmentFiles || normalizedProject.attachmentFiles,
      board: cloneProjectBoard(storedProject.board || normalizedProject.board),
    };
  });
};

const ProjectsContext = createContext({
  projects: [],
  createProject: () => null,
  addProject: () => null,
  removeProject: () => null,
  fetchProjects: () => {},
  getProjectBySlug: () => null,
  joinProjectByCode: () => ({ success: false }),
  addProjectMember: () => ({ success: false }),
  updateProjectBoard: () => {},
  updateProjectTask: () => {},
});

export { ProjectsContext };

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState(() => readStoredProjects());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const fetchProjects = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      return;
    }

    try {
      const response = await getProjectsApi();
      const nextProjects = Array.isArray(response?.data?.data?.projects)
        ? response.data.data.projects
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : [];

      setProjects(mergeProjectsWithStoredState(nextProjects));
    } catch (error) {
      console.error("Error fetching projects", error);
      if (projects.length === 0) {
        setProjects(cloneProjects(seedProjects));
      }
    }
  }, [projects.length]);

  useEffect(() => {
    if (!getAuthToken()) {
      return;
    }

    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(
    async ({
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

      try {
        const response = await createProjectApi({ title, description });
        const backendProject =
          response?.data?.data?.project ||
          response?.data?.project ||
          response?.data;
        const persistedProject = normalizeProject({
          ...backendProject,
          slug: candidateSlug,
          status: "Planning",
          stage: stage || "Planning",
          owner: owner || backendProject?.createdBy?.name || "Workspace",
          admin: admin || backendProject?.createdBy?.name || owner || "Workspace",
          joinCode: backendProject?.projectCode || joinCode || generateJoinCode(title),
          projectCode: backendProject?.projectCode || joinCode || generateJoinCode(title),
          members: backendProject?.members || uniqueMembers,
          memberDirectory:
            Object.keys(memberDirectory).length > 0
              ? memberDirectory
              : buildMemberDirectory(uniqueMembers),
          attachments,
          attachmentFiles,
          board: cloneProjectBoard(projectBoardTemplate),
        });

        setProjects((currentProjects) => [persistedProject, ...currentProjects]);

        return persistedProject;
      } catch (error) {
        console.error("Error creating project", error);
        return null;
      }
    },
    [projects]
  );

  const addProject = useCallback((projectData) => createProject(projectData), [createProject]);

  const removeProject = useCallback(async (projectId) => {
    try {
      await deleteProjectApi(projectId);
      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) => project._id !== projectId && project.id !== projectId && project.slug !== projectId
        )
      );
    } catch (error) {
      console.error("Error deleting project", error);
    }
  }, []);

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

    if (!normalizedCode) {
      return Promise.resolve({ success: false, error: "Enter a project code first." });
    }

    return joinProjectApi(normalizedCode)
      .then((response) => {
        const backendProject =
          response?.data?.data?.project ||
          response?.data?.project ||
          response?.data;
        const joinedProject = normalizeProject({
          ...backendProject,
          joinCode: backendProject?.projectCode,
          projectCode: backendProject?.projectCode,
        });

        setProjects((currentProjects) => {
          const exists = currentProjects.some(
            (project) => project._id === joinedProject._id || project.slug === joinedProject.slug
          );

          if (exists) {
            return currentProjects.map((project) =>
              project._id === joinedProject._id || project.slug === joinedProject.slug
                ? {
                    ...project,
                    ...joinedProject,
                    board: cloneProjectBoard(project.board || joinedProject.board),
                  }
                : project
            );
          }

          return [joinedProject, ...currentProjects];
        });

        return {
          success: true,
          projectSlug: joinedProject.slug,
          projectTitle: joinedProject.title,
        };
      })
      .catch((error) => ({
        success: false,
        error: error.message || "We couldn't find a project for that code.",
      }));
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
      addProject,
      removeProject,
      fetchProjects,
      getProjectBySlug: (slug) => projects.find((project) => project.slug === slug),
      joinProjectByCode,
      addProjectMember,
      updateProjectBoard,
      updateProjectTask,
    }),
    [
      addProject,
      addProjectMember,
      createProject,
      fetchProjects,
      joinProjectByCode,
      projects,
      removeProject,
      updateProjectBoard,
      updateProjectTask,
    ]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}
