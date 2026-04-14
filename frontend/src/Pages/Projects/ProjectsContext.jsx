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
import { useAppSelector } from "../../store/hooks";

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

// const normalizeComparableValue = (value = "") => String(value).trim().toLowerCase();

const getMemberIdentity = (member) => {
  const user = member?.user ?? member;

  if (typeof user === "string") {
    const label = user;
    return {
      id: getInitials(label) || label.slice(0, 2).toUpperCase(),
      label,
    };
  }

  const label = user?.name || user?.email || member?.name || member?.email || null;

  if (!label) {
    return null;
  }

  return {
    id: getInitials(label) || String(user?._id || "MB").slice(0, 2).toUpperCase(),
    label,
  };
};

const EMPTY_MEMBER_VALUE_SET = new Set([
  "",
  "Location not added",
  "No email available",
]);

const isGeneratedMemberBio = (bio = "") =>
  bio.includes("contributes to") &&
  bio.includes("helps move work across planning, delivery, and review.");

const pickMemberValue = (...values) =>
  values.find((value) => value !== undefined && value !== null) ?? null;

const pickPreferredMemberField = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      !(typeof value === "string" && EMPTY_MEMBER_VALUE_SET.has(value.trim()))
  ) ??
  values.find((value) => value !== undefined && value !== null) ??
  null;

const normalizeMemberProfile = (memberProfile = {}, projectTitle = "this project") => {
  const fallbackName = memberProfile.name || memberProfile.label || "Project Member";

  return {
    id: memberProfile.id,
    userId: pickMemberValue(memberProfile.userId, memberProfile._id),
    name: fallbackName,
    email: pickPreferredMemberField(memberProfile.email, "No email available"),
    role: pickPreferredMemberField(memberProfile.role, "Project Member"),
    location: pickPreferredMemberField(memberProfile.location, "Location not added"),
    about: pickPreferredMemberField(
      memberProfile.about,
      memberProfile.bio,
      `${fallbackName} contributes to ${projectTitle} and helps move work across planning, delivery, and review.`
    ),
    photo: pickMemberValue(memberProfile.photo, memberProfile.avatar),
    memberRole: pickPreferredMemberField(memberProfile.memberRole, "member"),
  };
};

const mergeMemberProfileEntry = (baseProfile, incomingProfile, projectTitle) => {
  const normalizedBase = normalizeMemberProfile(baseProfile, projectTitle);
  const normalizedIncoming = normalizeMemberProfile(incomingProfile, projectTitle);

  return {
    ...normalizedBase,
    ...normalizedIncoming,
    id: normalizedIncoming.id || normalizedBase.id,
    userId: pickPreferredMemberField(normalizedIncoming.userId, normalizedBase.userId),
    name: pickPreferredMemberField(normalizedIncoming.name, normalizedBase.name),
    email: pickPreferredMemberField(normalizedIncoming.email, normalizedBase.email),
    role: pickPreferredMemberField(normalizedIncoming.role, normalizedBase.role),
    location: pickPreferredMemberField(normalizedIncoming.location, normalizedBase.location),
    about:
      pickPreferredMemberField(
        isGeneratedMemberBio(normalizedIncoming.about) ? null : normalizedIncoming.about,
        isGeneratedMemberBio(normalizedBase.about) ? null : normalizedBase.about
      ) ||
      normalizedIncoming.about ||
      normalizedBase.about,
    photo: pickPreferredMemberField(normalizedIncoming.photo, normalizedBase.photo),
    memberRole: pickPreferredMemberField(normalizedIncoming.memberRole, normalizedBase.memberRole),
  };
};

const mergeMemberProfiles = (storedProfiles = [], incomingProfiles = [], projectTitle) => {
  const mergedProfiles = new Map();

  storedProfiles.forEach((profile) => {
    const normalized = normalizeMemberProfile(profile, projectTitle);
    if (normalized.id) {
      mergedProfiles.set(normalized.id, normalized);
    }
  });

  incomingProfiles.forEach((profile) => {
    const normalized = normalizeMemberProfile(profile, projectTitle);
    if (!normalized.id) {
      return;
    }

    const existingProfile = mergedProfiles.get(normalized.id);
    mergedProfiles.set(
      normalized.id,
      existingProfile
        ? mergeMemberProfileEntry(existingProfile, normalized, projectTitle)
        : normalized
    );
  });

  return Array.from(mergedProfiles.values());
};

const getMemberProfileLookupKeys = (memberProfile = {}) => {
  const keys = [
    memberProfile.id,
    memberProfile.userId,
    memberProfile.email && normalizeComparableValue(memberProfile.email),
    memberProfile.name && normalizeComparableValue(memberProfile.name),
  ].filter(Boolean);

  return Array.from(new Set(keys));
};

const filterMemberProfilesToProjectMembers = (memberProfiles = [], incomingProfiles = []) => {
  if (incomingProfiles.length === 0) {
    return [];
  }

  const allowedKeys = new Set(
    incomingProfiles.flatMap((profile) => getMemberProfileLookupKeys(profile))
  );

  return memberProfiles.filter((profile) =>
    getMemberProfileLookupKeys(profile).some((key) => allowedKeys.has(key))
  );
};

const syncCurrentUserMemberProfiles = (memberProfiles = [], currentUser, projectTitle) => {
  if (!currentUser) {
    return memberProfiles;
  }

  return memberProfiles.map((memberProfile) => {
    const matchesCurrentUser =
      (memberProfile.userId && currentUser._id && memberProfile.userId === currentUser._id) ||
      (memberProfile.email && currentUser.email && memberProfile.email === currentUser.email) ||
      (memberProfile.name && currentUser.name && memberProfile.name === currentUser.name);

    if (!matchesCurrentUser) {
      return memberProfile;
    }

    return mergeMemberProfileEntry(
      memberProfile,
      {
        ...currentUser,
        userId: currentUser._id,
        photo: currentUser.photo,
      },
      projectTitle
    );
  });
};

const normalizeProject = (project, currentUser = null) => {
  const title = project?.title || project?.name || "Untitled Project";
  const memberEntries = Array.isArray(project?.members)
    ? project.members
        .map(getMemberIdentity)
        .filter((member) => Boolean(member?.id && member?.label))
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
  const incomingMemberProfiles = Array.isArray(project?.members)
    ? project.members.map((member) => {
        const user = member?.user ?? member;
        const memberIdentity = getMemberIdentity(member);

        return {
          id: memberIdentity.id,
          userId: user?._id || null,
          name: user?.name || memberIdentity.label,
          email: user?.email || `${memberIdentity.id.toLowerCase()}@taskvue.app`,
          role: user?.role || (member?.role === "admin" ? "Admin" : "Project Member"),
          location: user?.location || "Location not added",
          about:
            user?.about ||
            `${user?.name || memberIdentity.label} contributes to ${title} and helps move work across planning, delivery, and review.`,
          memberRole: member?.role || "member",
        };
      })
    : Array.isArray(project?.memberProfiles)
      ? project.memberProfiles
      : [];
  const memberProfiles = syncCurrentUserMemberProfiles(
    filterMemberProfilesToProjectMembers(
      mergeMemberProfiles(project?.memberProfiles || [], incomingMemberProfiles, title),
      incomingMemberProfiles
    ),
    currentUser,
    title
  );
  const board = cloneProjectBoard(project?.board).map((column) => ({
    ...column,
    tasks: (column.tasks || []).map((task) => ({
      ...task,
      status: task.status || column.title,
      createdBy: task.createdBy || project?.createdBy?.name || project?.owner || "Workspace",
      createdByUserId: task.createdByUserId || task?.createdBy?._id || null,
    })),
  }));

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
    memberProfiles,
    memberDirectory:
      Object.keys(project?.memberDirectory || {}).length > 0
        ? project.memberDirectory
        : Object.keys(memberDirectory).length > 0
          ? memberDirectory
          : buildMemberDirectory(members),
    attachments,
    attachmentFiles,
    board,
  };
};

const mergeProjectsWithStoredState = (incomingProjects, currentUser = null) => {
  const storedProjects = readStoredProjects();
  const storedProjectMap = new Map(
    storedProjects.map((project) => [buildProjectKey(project), normalizeProject(project, currentUser)])
  );

  return incomingProjects.map((project) => {
    const normalizedProject = normalizeProject(project, currentUser);
    const storedProject = storedProjectMap.get(buildProjectKey(normalizedProject));

    if (!storedProject) {
      return normalizedProject;
    }

    return {
      ...normalizedProject,
      status: storedProject.status || normalizedProject.status,
      stage: storedProject.stage || normalizedProject.stage,
      memberProfiles: syncCurrentUserMemberProfiles(
        filterMemberProfilesToProjectMembers(
          mergeMemberProfiles(
            storedProject.memberProfiles,
            normalizedProject.memberProfiles,
            normalizedProject.title
          ),
          normalizedProject.memberProfiles
        ),
        currentUser,
        normalizedProject.title
      ),
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

const INVALID_PROJECT_CODE_MESSAGE = "No project with this ID exists, please try again.";
const INVALID_PROJECT_CODE_PATTERNS = [
  "not found",
  "invalid",
  "join project",
  "project code",
  "unable to join",
  "user belonging to this token does no longer exist",
  "token does no longer exist",
];

const normalizeComparableValue = (value = "") => String(value || "").trim().toLowerCase();

const canManageTask = (task, actor) => {
  if (!task || !actor) {
    return false;
  }

  if (actor.userId && task.createdByUserId && actor.userId === task.createdByUserId) {
    return true;
  }

  return (
    Boolean(actor.name) &&
    normalizeComparableValue(actor.name) === normalizeComparableValue(task.createdBy)
  );
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
  deleteProjectTask: () => ({ success: false }),
});

export { ProjectsContext };

export function ProjectsProvider({ children }) {
  const authInitialized = useAppSelector((state) => state.auth.initialized);
  const currentUser = useAppSelector((state) => state.auth.user);
  const [projects, setProjects] = useState(() => readStoredProjects());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const fetchProjects = useCallback(async () => {
    if (!authInitialized || !currentUser) {
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

      setProjects(mergeProjectsWithStoredState(nextProjects, currentUser));
    } catch (error) {
      if (error?.response?.status === 401) {
        return;
      }

      console.error("Error fetching projects", error);
      if (projects.length === 0) {
        setProjects(cloneProjects(seedProjects));
      }
    }
  }, [authInitialized, currentUser, projects.length]);

  useEffect(() => {
    if (!authInitialized || !currentUser) {
      return;
    }

    fetchProjects();
  }, [authInitialized, currentUser, fetchProjects]);

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
          }, currentUser);

        setProjects((currentProjects) => [persistedProject, ...currentProjects]);

        return persistedProject;
      } catch (error) {
        console.error("Error creating project", error);
        return null;
      }
    },
    [currentUser, projects]
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
      return { success: true };
    } catch (error) {
      console.error("Error deleting project", error);
      return {
        success: false,
        error: error.message || "Unable to delete project.",
      };
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

  const joinProjectByCode = useCallback((code) => {
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
         }, currentUser);

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
        error:
          error?.response?.status === 404 ||
          INVALID_PROJECT_CODE_PATTERNS.some((pattern) =>
            String(error?.message || "").toLowerCase().includes(pattern)
          )
            ? INVALID_PROJECT_CODE_MESSAGE
            : error?.message || INVALID_PROJECT_CODE_MESSAGE,
      }));
  }, [currentUser]);

  const updateProjectBoard = useCallback((projectSlug, updater, actor = null) => {
    let wasUpdated = false;
    let errorMessage = "Project not found.";

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.slug !== projectSlug) {
          return project;
        }

        const nextBoard = updater(cloneProjectBoard(project.board), {
          canManageTask: (task) => canManageTask(task, actor),
        });

        if (nextBoard === null) {
          errorMessage = "Only the person who added this task can update or delete it.";
          return project;
        }

        wasUpdated = true;
        return {
          ...project,
          board: nextBoard,
        };
      })
    );

    return wasUpdated
      ? { success: true }
      : { success: false, error: errorMessage };
  }, []);

  const updateProjectTask = useCallback((projectSlug, taskId, updates, actor = null) => {
    let result = { success: false, error: "Project not found." };

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.slug !== projectSlug) {
          return project;
        }

        const currentStatus = project.board.find((column) =>
          column.tasks.some((task) => task.id === taskId)
        )?.title;
        const nextStatus = updates.status || currentStatus;

        if (!currentStatus) {
          result = { success: false, error: "Task not found." };
          return project;
        }

        let taskToUpdate = null;
        let blockedUpdate = false;

        const columnsWithoutTask = project.board.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => {
            if (task.id !== taskId) {
              return true;
            }

            if (!canManageTask(task, actor)) {
              blockedUpdate = true;
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

        if (blockedUpdate) {
          result = {
            success: false,
            error: "Only the person who added this task can update or delete it.",
          };
          return project;
        }

        if (!taskToUpdate) {
          result = { success: false, error: "Task not found." };
          return project;
        }

        result = { success: true };
        return {
          ...project,
          board: columnsWithoutTask.map((column) =>
            column.title === nextStatus
              ? {
                  ...column,
                  tasks: [taskToUpdate, ...column.tasks],
                }
              : column
          ),
        };
      })
    );

    return result;
  }, []);

  const deleteProjectTask = useCallback((projectSlug, taskId, actor = null) => {
    let result = { success: false, error: "Project not found." };

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.slug !== projectSlug) {
          return project;
        }

        let taskFound = false;
        let taskDeleted = false;
        let blockedDelete = false;

        const nextBoard = project.board.map((column) => ({
          ...column,
          tasks: column.tasks.filter((task) => {
            if (task.id !== taskId) {
              return true;
            }

            taskFound = true;

            if (!canManageTask(task, actor)) {
              blockedDelete = true;
              return true;
            }

            taskDeleted = true;
            return false;
          }),
        }));

        if (blockedDelete) {
          result = {
            success: false,
            error: "Only the person who added this task can update or delete it.",
          };
          return project;
        }

        if (!taskFound) {
          result = { success: false, error: "Task not found." };
          return project;
        }

        result = taskDeleted ? { success: true } : { success: false, error: "Task not found." };
        return taskDeleted
          ? {
              ...project,
              board: nextBoard,
            }
          : project;
      })
    );

    return result;
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
      deleteProjectTask,
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
      deleteProjectTask,
    ]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}
