import { cloneProjectBoard, getInitials, projectBoardTemplate, resolveMemberLabel } from "../Pages/Projects/projectData";

const COLUMN_STATUS_MAP = {
  "to do": "todo",
  "in progress": "in-progress",
  "in review": "in-review",
  done: "done",
  completed: "done",
};

const API_STATUS_TO_COLUMN = {
  todo: "To Do",
  "in-progress": "In Progress",
  "in-review": "In Review",
  done: "Done",
  completed: "Done",
};

const normalizePriorityLabel = (priority = "medium") => {
  const value = String(priority || "medium").trim().toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatTaskDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

const splitTaskDescription = (description = "") => {
  const rawDescription = String(description || "").trim();
  const notesMarker = "\n\nNotes:";
  const markerIndex = rawDescription.indexOf(notesMarker);

  if (markerIndex === -1) {
    return {
      description: rawDescription,
      notes: "",
    };
  }

  return {
    description: rawDescription.slice(0, markerIndex).trim(),
    notes: rawDescription.slice(markerIndex + notesMarker.length).trim(),
  };
};

const getTaskProject = (task = {}, project = null) =>
  task?.project && typeof task.project === "object" ? task.project : project;

const getAssigneeIdentity = (assignedTo, project = null) => {
  if (!assignedTo) {
    return {
      assignee: [],
      assigneeNames: [],
    };
  }

  const user = assignedTo?.user ?? assignedTo;
  const userId = user?._id || user?.id || assignedTo?._id || assignedTo?.id || assignedTo;
  const directName = user?.name || user?.email || assignedTo?.name || assignedTo?.email;
  const projectMemberProfile =
    Array.isArray(project?.memberProfiles) &&
    project.memberProfiles.find(
      (memberProfile) =>
        String(memberProfile?.userId || memberProfile?.id || "") === String(userId || "")
    );
  const projectMemberName =
    projectMemberProfile?.name ||
    projectMemberProfile?.email ||
    resolveMemberLabel(String(userId || ""), project?.memberDirectory || {});
  const resolvedName = directName || projectMemberName || String(userId || "Member");

  return {
    assignee: [getInitials(resolvedName) || String(userId || "").slice(0, 2).toUpperCase()],
    assigneeNames: [resolvedName],
  };
};

export const mapColumnToApiTaskStatus = (columnTitle = "To Do") =>
  COLUMN_STATUS_MAP[String(columnTitle || "").trim().toLowerCase()] || "todo";

export const mapApiTaskStatusToColumn = (status = "todo") =>
  API_STATUS_TO_COLUMN[String(status || "").trim().toLowerCase()] || "To Do";

export const normalizeApiTask = (task = {}, project = null) => {
  const taskProject = getTaskProject(task, project);
  const { description, notes } = splitTaskDescription(task?.description);
  const assigneeIdentity = getAssigneeIdentity(task?.assignedTo, taskProject);
  const comments = Array.isArray(task?.comments) ? task.comments : [];
  const attachments = Array.isArray(task?.attachments) ? task.attachments : [];
  const creator = task?.createdBy?.name || task?.createdBy?.email || task?.createdBy || "Workspace";
  const creatorId = task?.createdBy?._id || task?.createdBy?.id || task?.createdBy || null;
  const projectId = taskProject?._id || taskProject?.id || task?.project?._id || task?.project?.id || task?.project || null;
  const projectName = taskProject?.title || taskProject?.name || "Workspace";
  const projectSlug = taskProject?.slug || project?.slug || "";
  const dueDateRaw = task?.dueDate || null;

  return {
    ...task,
    id: task?._id?.toString?.() || task?.id?.toString?.() || task?.id || task?._id,
    _id: task?._id?.toString?.() || task?.id?.toString?.() || task?.id || task?._id,
    projectId: projectId ? String(projectId) : "",
    projectName,
    projectSlug,
    title: task?.title || "Untitled Task",
    description,
    notes,
    priority: normalizePriorityLabel(task?.priority),
    status: mapApiTaskStatusToColumn(task?.status),
    apiStatus: String(task?.status || "todo").toLowerCase(),
    assignee: assigneeIdentity.assignee,
    assigneeNames: assigneeIdentity.assigneeNames,
    dueDateRaw,
    dueDate: formatTaskDate(dueDateRaw) || task?.dueDate || "",
    comments: comments.length,
    commentsList: comments.map((comment) => comment?.text).filter(Boolean),
    commentItems: comments,
    attachments: attachments.length,
    attachmentFiles: attachments.map((attachment) => attachment?.fileName).filter(Boolean),
    attachmentItems: attachments,
    createdBy: creator,
    createdByUserId: creatorId ? String(creatorId) : null,
  };
};

export const groupTasksByProject = (tasks = []) => {
  const groupedTasks = new Map();

  tasks.forEach((task) => {
    const projectId = String(task?.projectId || task?.project?._id || task?.project?.id || task?.project || "");

    if (!projectId) {
      return;
    }

    const existingTasks = groupedTasks.get(projectId) || [];
    groupedTasks.set(projectId, [...existingTasks, task]);
  });

  return groupedTasks;
};

export const removeTaskFromBoard = (board = projectBoardTemplate, taskId) =>
  cloneProjectBoard(board).map((column) => ({
    ...column,
    tasks: (column.tasks || []).filter(
      (task) => String(task?.id || task?._id || "") !== String(taskId || "")
    ),
  }));

export const upsertTaskInBoard = (board = projectBoardTemplate, task, options = {}) => {
  const normalizedBoard = removeTaskFromBoard(board, task?.id || task?._id);
  const targetColumnTitle =
    options.preferredColumnTitle || task?.status || task?.columnTitle || "To Do";
  const targetColumnIndex = normalizedBoard.findIndex((column) => column.title === targetColumnTitle);
  const nextBoard = normalizedBoard.map((column) => ({
    ...column,
    tasks: [...(column.tasks || [])],
  }));
  const targetIndex = targetColumnIndex === -1 ? 0 : targetColumnIndex;
  const targetColumn = nextBoard[targetIndex];

  if (!targetColumn) {
    return nextBoard;
  }

  targetColumn.tasks = [task, ...targetColumn.tasks];
  return nextBoard;
};

export const buildProjectBoardFromTasks = (tasks = [], project = null) => {
  const orderedTasks = [...tasks].sort((left, right) => {
    const leftTime = new Date(left?.createdAt || 0).getTime();
    const rightTime = new Date(right?.createdAt || 0).getTime();
    return leftTime - rightTime;
  });

  return orderedTasks.reduce((board, task) => {
    const normalizedTask = normalizeApiTask(task, project);
    return upsertTaskInBoard(board, normalizedTask, {
      preferredColumnTitle: normalizedTask.status,
    });
  }, cloneProjectBoard(projectBoardTemplate));
};
