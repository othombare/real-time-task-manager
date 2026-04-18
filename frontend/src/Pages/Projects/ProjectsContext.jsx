import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildMemberDirectory,
  cloneProjectBoard,
  cloneProjects,
  createProjectSlug,
  generateJoinCode,
  getInitials,
  hasProjectAccess,
  projectBoardTemplate,
  seedProjects,
} from "./projectData";
import {
  addProjectAttachments as addProjectAttachmentsApi,
  createProject as createProjectApi,
  deleteProjectAttachment as deleteProjectAttachmentApi,
  deleteProject as deleteProjectApi,
  getProjects as getProjectsApi,
  joinProject as joinProjectApi,
  removeProjectMember as removeProjectMemberApi,
} from "../../utils/projectApi";
import {
  addTaskAttachments as addTaskAttachmentsApi,
  addTaskComment as addTaskCommentApi,
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  getTasks as getTasksApi,
} from "../../utils/taskApi";
import {
  buildProjectBoardFromTasks,
  buildTaskCreatePayload,
  buildTaskUpdatePayload,
  getTaskSortOrderBetween,
  groupTasksByProject,
  mapColumnToApiTaskStatus,
  normalizeApiTask,
  removeTaskFromBoard,
  upsertTaskInBoard,
} from "../../utils/taskAdapters";
import { useAppSelector } from "../../store/hooks";

const STORAGE_KEY = "taskvue-projects:v2";

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

const getProjectRoomId = (project) => String(project?._id || project?.id || "").trim();

const normalizeComparableValue = (value = "") => String(value).trim().toLowerCase();
const normalizeProjectCode = (value = "") => String(value).trim().toUpperCase();

const normalizeAttachmentEntry = (attachment, index = 0) => {
  if (typeof attachment === "string") {
    const trimmedName = attachment.trim();

    return {
      id: `${trimmedName || "attachment"}-${index}`,
      name: trimmedName || `Attachment ${index + 1}`,
      sizeLabel: null,
      uploadedAt: null,
      uploadedBy: null,
      url: null,
    };
  }

  const fileName =
    attachment?.fileName ||
    attachment?.name ||
    attachment?.originalName ||
    attachment?.title ||
    `Attachment ${index + 1}`;

  return {
    id: String(
      attachment?._id ||
        attachment?.id ||
        attachment?.key ||
        `${fileName}-${index}`
    ),
    name: fileName,
    sizeLabel: attachment?.sizeLabel || attachment?.size || null,
    uploadedAt: attachment?.createdAt || attachment?.uploadedAt || null,
    uploadedBy:
      attachment?.uploadedBy?.name ||
      attachment?.uploadedBy ||
      attachment?.createdBy?.name ||
      attachment?.createdBy ||
      null,
    url: attachment?.url || attachment?.fileUrl || null,
  };
};

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

const normalizeProject = (project, currentUser = null, rawTasks = []) => {
  const title = project?.title || project?.name || "Untitled Project";
  const slug = project?.slug || createProjectSlug(title) || `project-${Date.now()}`;
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
  const attachmentItems = Array.isArray(project?.attachments)
    ? project.attachments.map((attachment, index) => normalizeAttachmentEntry(attachment, index))
    : (project?.attachmentItems || project?.attachmentFiles || []).map((attachment, index) =>
        normalizeAttachmentEntry(attachment, index)
      );
  const resolvedAttachmentItems =
    attachmentItems.length > 0
      ? attachmentItems
      : Array.from({ length: attachments }, (_, index) =>
          normalizeAttachmentEntry(`Attachment ${index + 1}`, index)
        );
  const attachmentFiles = resolvedAttachmentItems
    .map((attachment) => attachment.name)
    .filter(Boolean);
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
  const normalizedTasks = rawTasks.map((task) =>
    normalizeApiTask(task, {
      ...project,
      title,
      slug: project?.slug || createProjectSlug(title) || `project-${Date.now()}`,
      owner: project?.owner || project?.createdBy?.name || "Workspace",
    })
  );
  const board =
    rawTasks.length > 0 || !Array.isArray(project?.board)
      ? buildProjectBoardFromTasks(normalizedTasks)
      : cloneProjectBoard(project?.board).map((column) => ({
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
    slug,
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
    attachmentItems: resolvedAttachmentItems,
    attachmentFiles,
    board,
  };
};

const mergeProjectsWithStoredState = (incomingProjects, currentUser = null, tasksByProject = new Map()) => {
const mergeProjectsWithStoredState = (incomingProjects, currentUser = null, tasksByProject = new Map()) => {
  const storedProjects = readStoredProjects();
  const storedProjectMap = new Map(
    storedProjects.map((project) => [buildProjectKey(project), normalizeProject(project, currentUser)])
  );

  return incomingProjects.map((project) => {
    const normalizedProject = normalizeProject(
      project,
      currentUser,
      tasksByProject.get(String(project?._id || project?.id || "")) || []
    );
    const storedProject = storedProjectMap.get(buildProjectKey(normalizedProject));

    if (!storedProject) {
      return normalizedProject;
    }

    const storedBoard = cloneProjectBoard(storedProject.board || normalizedProject.board);

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
      attachments: normalizedProject.attachments ?? storedProject.attachments,
      attachmentItems:
        Array.isArray(normalizedProject.attachmentItems)
          ? normalizedProject.attachmentItems
          : storedProject.attachmentItems,
       attachmentFiles:
         Array.isArray(normalizedProject.attachmentFiles) && normalizedProject.attachmentFiles.length > 0
           ? normalizedProject.attachmentFiles
           : storedProject.attachmentFiles,
       board: cloneProjectBoard(normalizedProject.board || storedProject.board),
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

const mergeProjectIntoState = (currentProjects, nextProject) =>
  currentProjects.map((project) =>
    project._id === nextProject._id || project.id === nextProject.id
      ? {
          ...project,
          ...nextProject,
          board: cloneProjectBoard(project.board || nextProject.board),
        }
      : project
  );

const extractProjectsPayload = (response) =>
  Array.isArray(response?.data?.data?.projects)
    ? response.data.data.projects
    : Array.isArray(response?.data?.data)
      ? response.data.data
      : Array.isArray(response?.data)
        ? response.data
        : [];

const extractTasksPayload = (response) =>
  Array.isArray(response?.data?.data?.tasks)
    ? response.data.data.tasks
    : Array.isArray(response?.data?.data)
      ? response.data.data
      : Array.isArray(response?.data)
        ? response.data
        : [];

const extractTaskPayload = (response) =>
  response?.data?.data?.task || response?.data?.task || response?.data || null;

const matchesProjectIdentifier = (project, projectIdentifier) => {
  const targetIdentifier = String(projectIdentifier || "").trim();

  if (!targetIdentifier) {
    return false;
  }

  return [project?._id, project?.id, project?.slug, project?.projectCode, project?.joinCode].some(
    (value) => String(value || "").trim() === targetIdentifier
  );
};

const syncTaskBoardForProject = (currentProjects, projectIdentifier, task, options = {}) =>
  currentProjects.map((project) => {
    if (!matchesProjectIdentifier(project, projectIdentifier)) {
      return project;
    }

    return {
      ...project,
      board: options.remove
        ? removeTaskFromBoard(project.board, task?.id || task?._id)
        : upsertTaskInBoard(project.board, task, options),
    };
  });

const serializeFilesForUpload = async (files = []) => {
  const normalizedFiles = Array.from(files).filter(Boolean);

  return Promise.all(
    normalizedFiles.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            const result = String(reader.result || "");
            const [, base64Content = ""] = result.split(",");

            resolve({
              fileName: file.name,
              content: base64Content,
              mimeType: file.type || "application/octet-stream",
              size: file.size,
            });
          };

          reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
          reader.readAsDataURL(file);
        })
    )
  );
};

const canDeleteTask = (task, actor) => {
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
  lastSyncedAt: null,
  createProject: () => null,
  addProject: () => null,
  removeProject: () => null,
  fetchProjects: () => {},
  getProjectBySlug: () => null,
  joinProjectByCode: () => ({ success: false }),
  addProjectMember: () => ({ success: false }),
  removeProjectMember: () => ({ success: false }),
  addProjectAttachments: () => ({ success: false }),
  createProjectTask: () => ({ success: false }),
  addProjectTaskComment: () => ({ success: false }),
  addProjectTaskAttachments: () => ({ success: false }),
  createProjectTask: () => ({ success: false }),
  addProjectTaskComment: () => ({ success: false }),
  addProjectTaskAttachments: () => ({ success: false }),
  updateProjectBoard: () => {},
  updateProjectTask: () => {},
  deleteProjectTask: () => ({ success: false }),
  deleteProjectAttachment: () => ({ success: false }),
});

export { ProjectsContext };

export function ProjectsProvider({ children }) {
  const authInitialized = useAppSelector((state) => state.auth.initialized);
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentToken = useAppSelector((state) => state.auth.token);
  const [projects, setProjects] = useState(() => readStoredProjects());
  const projectsRef = useRef(projects);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const fetchProjects = useCallback(async () => {
    if (!authInitialized || !currentUser) {
      return;
    }

    try {
      const [projectsResponse, tasksResponse] = await Promise.all([
        getProjectsApi(),
        getTasksApi().catch((error) => {
          console.error("Error fetching tasks", error);
          return null;
        }),
      ]);

      const nextProjects = Array.isArray(projectsResponse?.data?.data?.projects)
        ? projectsResponse.data.data.projects
        : Array.isArray(projectsResponse?.data?.data)
          ? projectsResponse.data.data
          : Array.isArray(projectsResponse?.data)
            ? projectsResponse.data
            : [];
      const nextTasks = Array.isArray(tasksResponse?.data?.data?.tasks)
        ? tasksResponse.data.data.tasks
        : Array.isArray(tasksResponse?.data?.data)
          ? tasksResponse.data.data
          : Array.isArray(tasksResponse?.data)
            ? tasksResponse.data
            : [];
      const tasksByProject = groupTasksByProject(nextTasks);

      setProjects(mergeProjectsWithStoredState(nextProjects, currentUser, tasksByProject));
    } catch (error) {
      if (error?.response?.status === 401) {
        return;
      }

      console.error("Error fetching projects", error);
      if (projectsRef.current.length === 0) {
        setProjects(cloneProjects(seedProjects));
      }
    }
  }, [authInitialized, currentUser]);

  useEffect(() => {
    if (!authInitialized || !currentUser) {
      return;
    }

    const userKey = [
      currentUser?._id || currentUser?.email || currentUser?.name || "anonymous",
      currentToken || "no-token",
    ].join(":");

    if (INITIAL_PROJECT_FETCH_KEYS.has(userKey)) {
      return;
    }

    INITIAL_PROJECT_FETCH_KEYS.add(userKey);
    fetchProjects();
  }, [authInitialized, currentUser, fetchProjects]);

  useEffect(() => {
    if (!authInitialized || !currentUser) {
      return undefined;
    }

    const syncProjects = () => {
      fetchProjects();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncProjects();
      }
    };
    const refreshInterval = window.setInterval(syncProjects, 15000);

    window.addEventListener("focus", syncProjects);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", syncProjects);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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
      attachmentItems = [],
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
        const persistedProject = normalizeProject(
          {
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
            attachmentItems:
              attachmentItems.length > 0
                ? attachmentItems
                : attachmentFiles.map((fileName, index) => normalizeAttachmentEntry(fileName, index)),
            attachmentFiles,
            board: cloneProjectBoard(projectBoardTemplate),
          },
          currentUser
        );
          },
          currentUser
        );

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

  const removeProjectMember = useCallback(async (projectId, memberId) => {
    try {
      const response = await removeProjectMemberApi(projectId, memberId);
      const backendProject =
        response?.data?.data?.project ||
        response?.data?.project ||
        response?.data;
      const updatedProject = normalizeProject(backendProject, currentUser);

      setProjects((currentProjects) => mergeProjectIntoState(currentProjects, updatedProject));

      return { success: true, project: updatedProject };
    } catch (error) {
      console.error("Error removing project member", error);
      return {
        success: false,
        error: error.message || "Unable to remove project member.",
      };
    }
  }, [currentUser]);

  const addProjectAttachments = useCallback(async (projectId, files = []) => {
    const normalizedFiles = Array.from(files).filter(Boolean);

    if (normalizedFiles.length === 0) {
      return { success: false, error: "Select at least one attachment first." };
    }

    try {
      const attachments = await serializeFilesForUpload(normalizedFiles);
      const response = await addProjectAttachmentsApi(projectId, attachments);
      const backendProject =
        response?.data?.data?.project ||
        response?.data?.project ||
        response?.data;
      const updatedProject = normalizeProject(backendProject, currentUser);

      setProjects((currentProjects) => mergeProjectIntoState(currentProjects, updatedProject));

      return { success: true, project: updatedProject, attachments };
    } catch (error) {
      console.error("Error adding project attachments", error);
      return {
        success: false,
        error: error.message || "Unable to add project attachments.",
      };
    }
  }, [currentUser]);

  const createProjectTask = useCallback(
    async (projectSlug, taskData) => {
      const project = projects.find((currentProject) => currentProject.slug === projectSlug);

      if (!project?._id) {
        return { success: false, error: "Project not found." };
      }

      try {
        const response = await createTaskApi(buildTaskCreatePayload(taskData, project._id));
        const backendTask = extractTaskPayload(response);

        if (!backendTask) {
          return { success: false, error: "Unable to create task." };
        }

        const normalizedTask = normalizeApiTask(backendTask, project);

        setProjects((currentProjects) =>
          currentProjects.map((currentProject) =>
            currentProject.slug === projectSlug
              ? {
                  ...currentProject,
                  board: upsertTaskInBoard(currentProject.board, normalizedTask),
                }
              : currentProject
          )
        );

        return { success: true, task: normalizedTask };
      } catch (error) {
        console.error("Error creating project task", error);
        return {
          success: false,
          error: error.message || "Unable to create task.",
        };
      }
    },
    [currentUser, projects]
  );

  const addProjectTaskComment = useCallback(
    async (projectSlug, taskId, text) => {
      const project = projects.find((currentProject) => currentProject.slug === projectSlug);

      if (!project) {
        return { success: false, error: "Project not found." };
      }

      const trimmedText = String(text || "").trim();

      if (!trimmedText) {
        return { success: false, error: "Comment text is required." };
      }

      try {
        const response = await addTaskCommentApi(taskId, trimmedText);
        const backendTask = extractTaskPayload(response);

        if (!backendTask) {
          return { success: false, error: "Task not found." };
        }

        const normalizedTask = normalizeApiTask(backendTask, project);

        setProjects((currentProjects) =>
          currentProjects.map((currentProject) =>
            currentProject.slug === projectSlug
              ? {
                  ...currentProject,
                  board: upsertTaskInBoard(currentProject.board, normalizedTask),
                }
              : currentProject
          )
        );

        return { success: true, task: normalizedTask };
      } catch (error) {
        console.error("Error adding task comment", error);
        return {
          success: false,
          error: error.message || "Unable to add comment.",
        };
      }
    },
    [projects]
  );

  const addProjectTaskAttachments = useCallback(
    async (projectSlug, taskId, files = []) => {
      const project = projects.find((currentProject) => currentProject.slug === projectSlug);

      if (!project) {
        return { success: false, error: "Project not found." };
      }

      const normalizedFiles = Array.from(files).filter(Boolean);

      if (normalizedFiles.length === 0) {
        return { success: false, error: "Select at least one attachment first." };
      }

      try {
        const attachments = await serializeFilesForUpload(normalizedFiles);
        const response = await addTaskAttachmentsApi(taskId, attachments);
        const backendTask = extractTaskPayload(response);

        if (!backendTask) {
          return { success: false, error: "Task not found." };
        }

        const normalizedTask = normalizeApiTask(backendTask, project);

        setProjects((currentProjects) =>
          currentProjects.map((currentProject) =>
            currentProject.slug === projectSlug
              ? {
                  ...currentProject,
                  board: upsertTaskInBoard(currentProject.board, normalizedTask),
                }
              : currentProject
          )
        );

        return { success: true, task: normalizedTask, attachments };
      } catch (error) {
        console.error("Error adding task attachments", error);
        return {
          success: false,
          error: error.message || "Unable to add task attachments.",
        };
      }
    },
    [projects]
  );

  const joinProjectByCode = useCallback((code) => {
    const normalizedCode = normalizeProjectCode(code);

    if (!normalizedCode) {
      return Promise.resolve({ success: false, error: "Enter a project code first." });
    }

    const existingProject = projects.find(
      (project) =>
        normalizeProjectCode(project?.joinCode) === normalizedCode ||
        normalizeProjectCode(project?.projectCode) === normalizedCode
    );

    if (existingProject) {
      return Promise.resolve({
        success: true,
        projectSlug: existingProject.slug,
        projectTitle: existingProject.title,
      });
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

        fetchProjects();

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
  }, [currentUser, projects]);

  const updateProjectBoard = useCallback((projectSlug, updater) => {
    let wasUpdated = false;
    let errorMessage = "Project not found.";

    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.slug !== projectSlug) {
          return project;
        }

        const nextBoard = updater(cloneProjectBoard(project.board));

        if (nextBoard === null) {
          errorMessage = "Unable to update the task board.";
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

  const updateProjectTask = useCallback(
    async (projectSlug, taskId, updates, options = {}) => {
      const project = projects.find((currentProject) => currentProject.slug === projectSlug);

      if (!project) {
        return { success: false, error: "Project not found." };
      }

      const currentTask = project.board.find((column) =>
        column.tasks.some((task) => String(task.id) === String(taskId))
      )?.tasks.find((task) => String(task.id) === String(taskId));

      if (!currentTask) {
        return { success: false, error: "Task not found." };
      }

      const payload = buildTaskUpdatePayload(updates);

      if (Object.keys(payload).length === 0) {
        return { success: true, task: currentTask };
      }

      const optimisticTask = {
        ...currentTask,
        ...updates,
        status: updates.status || currentTask.status,
      };
      const previousBoard = cloneProjectBoard(project.board);

      setProjects((currentProjects) =>
        currentProjects.map((currentProject) =>
          currentProject.slug === projectSlug
            ? {
                ...currentProject,
                board: upsertTaskInBoard(currentProject.board, optimisticTask, options),
              }
            : currentProject
        )
      );

      try {
        const response = await updateTaskApi(taskId, payload);
        const backendTask = extractTaskPayload(response);

        if (!backendTask) {
          setProjects((currentProjects) =>
            currentProjects.map((currentProject) =>
              currentProject.slug === projectSlug
                ? {
                    ...currentProject,
                    board: cloneProjectBoard(previousBoard),
                  }
                : currentProject
            )
          );

          return { success: false, error: "Task not found." };
        }

        const normalizedTask = normalizeApiTask(backendTask, project);

        setProjects((currentProjects) =>
          currentProjects.map((currentProject) =>
            currentProject.slug === projectSlug
              ? {
                  ...currentProject,
                  board: upsertTaskInBoard(currentProject.board, normalizedTask, options),
                }
              : currentProject
          )
        );

        return { success: true, task: normalizedTask };
      } catch (error) {
        setProjects((currentProjects) =>
          currentProjects.map((currentProject) =>
            currentProject.slug === projectSlug
              ? {
                  ...currentProject,
                  board: cloneProjectBoard(previousBoard),
                }
              : currentProject
          )
        );

        console.error("Error updating task", error);
        return {
          success: false,
          error: error.message || "Unable to update task.",
        };
      }
    },
    [projects]
  );

  const deleteProjectTask = useCallback(
    async (projectSlug, taskId, actor = null) => {
      const project = projects.find((currentProject) => currentProject.slug === projectSlug);

      if (!project) {
        return { success: false, error: "Project not found." };
      }

      const currentTask = project.board.find((column) =>
        column.tasks.some((task) => String(task.id) === String(taskId))
      )?.tasks.find((task) => String(task.id) === String(taskId));

      if (!currentTask) {
        return { success: false, error: "Task not found." };
      }

      if (!canDeleteTask(currentTask, actor)) {
        return {
          success: false,
          error: "Only the person who added this task can delete it.",
        };
      }

      try {
        await deleteTaskApi(taskId);

        setProjects((currentProjects) =>
          currentProjects.map((currentProject) =>
            currentProject.slug === projectSlug
              ? {
                  ...currentProject,
                  board: removeTaskFromBoard(currentProject.board, taskId),
                }
              : currentProject
          )
        );

        return { success: true };
      } catch (error) {
        console.error("Error deleting task", error);
        return {
          success: false,
          error: error.message || "Unable to delete task.",
        };
      }
    },
    [projects]
  );

  const deleteProjectAttachment = useCallback(async (projectId, attachmentId) => {
    try {
      const response = await deleteProjectAttachmentApi(projectId, attachmentId);
      const backendProject =
        response?.data?.data?.project ||
        response?.data?.project ||
        response?.data;
      const updatedProject = normalizeProject(backendProject, currentUser);

      setProjects((currentProjects) => mergeProjectIntoState(currentProjects, updatedProject));

      return { success: true, project: updatedProject };
    } catch (error) {
      console.error("Error deleting project attachment", error);
      return {
        success: false,
        error: error.message || "Unable to delete project attachment.",
      };
    }
  }, [currentUser]);

  const value = useMemo(
    () => ({
      projects,
      lastSyncedAt,
      createProject,
      addProject,
      removeProject,
      fetchProjects,
      getProjectBySlug: (slug) => projects.find((project) => project.slug === slug),
      joinProjectByCode,
      addProjectMember,
      removeProjectMember,
      addProjectAttachments,
      createProjectTask,
      addProjectTaskComment,
      addProjectTaskAttachments,
      createProjectTask,
      addProjectTaskComment,
      addProjectTaskAttachments,
      updateProjectBoard,
      updateProjectTask,
      deleteProjectTask,
      deleteProjectAttachment,
    }),
    [
      addProject,
      addProjectMember,
      createProject,
      fetchProjects,
      joinProjectByCode,
      projects,
      lastSyncedAt,
      removeProject,
      removeProjectMember,
      addProjectAttachments,
      createProjectTask,
      addProjectTaskComment,
      addProjectTaskAttachments,
      createProjectTask,
      addProjectTaskComment,
      addProjectTaskAttachments,
      updateProjectBoard,
      updateProjectTask,
      deleteProjectTask,
      deleteProjectAttachment,
    ]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}
