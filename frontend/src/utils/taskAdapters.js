import { cloneProjectBoard, createProjectSlug, getInitials } from "../Pages/Projects/projectData";

export const apiProjectBoardTemplate = [
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
    title: "In Review",
    color: "bg-amber-500",
    tasks: [],
  },
  {
    title: "Done",
    color: "bg-emerald-500",
    tasks: [],
  },
];

const apiStatusToColumnMap = {
  todo: "To Do",
  "to-do": "To Do",
  "in-progress": "In Progress",
  "in progress": "In Progress",
  "in-review": "In Review",
  "in review": "In Review",
  review: "In Review",
  completed: "Done",
  done: "Done",
};

const columnToApiStatusMap = {
  "To Do": "todo",
  "In Progress": "in-progress",
  "In Review": "in-review",
  Done: "completed",
};

const priorityLabelMap = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const formatAttachmentSize = (value) => {
  const numericSize = Number(value);

  if (!Number.isFinite(numericSize) || numericSize <= 0) {
    return null;
  }

  if (numericSize < 1024) {
    return `${numericSize} B`;
  }

  if (numericSize < 1024 * 1024) {
    return `${(numericSize / 1024).toFixed(1)} KB`;
  }

  return `${(numericSize / (1024 * 1024)).toFixed(1)} MB`;
};

const normalizeAttachmentEntry = (attachment, index = 0) => {
  const fileName =
    attachment?.fileName ||
    attachment?.name ||
    attachment?.originalName ||
    `Attachment ${index + 1}`;

  return {
    id: String(attachment?._id || attachment?.id || `${fileName}-${index}`),
    name: fileName,
    url: attachment?.fileUrl || attachment?.url || null,
    sizeLabel: attachment?.sizeLabel || formatAttachmentSize(attachment?.size),
    uploadedAt: attachment?.uploadedAt || attachment?.createdAt || null,
    uploadedBy: attachment?.uploadedBy?.name || attachment?.uploadedBy || null,
  };
};

const normalizeCommentEntry = (comment, index = 0) => {
  if (typeof comment === "string") {
    return {
      id: `comment-${index}`,
      text: comment,
      userName: null,
      createdAt: null,
    };
  }

  return {
    id: String(comment?._id || comment?.id || `comment-${index}`),
    text: comment?.text || "",
    userName: comment?.user?.name || comment?.userName || null,
    createdAt: comment?.createdAt || null,
  };
};

export const mapApiTaskStatusToColumn = (status) =>
  apiStatusToColumnMap[String(status || "").trim().toLowerCase()] || "To Do";

export const mapColumnToApiTaskStatus = (status) => columnToApiStatusMap[String(status || "").trim()] || "todo";

export const formatTaskDueDate = (value, fallback = "No due date") => {
  if (!value) {
    return fallback;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parsedDate);
};

export const normalizeApiTask = (task, project = null) => {
  const resolvedProject = task?.project && typeof task.project === "object" ? task.project : null;
  const projectTitle = project?.title || resolvedProject?.title || "Workspace";
  const projectSlug =
    project?.slug || createProjectSlug(projectTitle) || `project-${task?._id || task?.id || Date.now()}`;
  const assignedUser =
    task?.assignedTo && typeof task.assignedTo === "object"
      ? task.assignedTo
      : null;
  const assignedUserName = assignedUser?.name || null;
  const attachmentItems = Array.isArray(task?.attachments)
    ? task.attachments.map((attachment, index) => normalizeAttachmentEntry(attachment, index))
    : [];
  const commentItems = Array.isArray(task?.comments)
    ? task.comments.map((comment, index) => normalizeCommentEntry(comment, index)).filter((comment) => Boolean(comment.text))
    : [];
  const normalizedPriority = String(task?.priority || "medium").toLowerCase();

  return {
    ...task,
    id: String(task?._id || task?.id || Date.now()),
    _id: task?._id || task?.id || null,
    title: task?.title || "Untitled Task",
    description: task?.description || "",
    priority: priorityLabelMap[normalizedPriority] || "Medium",
    status: mapApiTaskStatusToColumn(task?.status),
    apiStatus: task?.status || "todo",
    assignee: assignedUserName ? [getInitials(assignedUserName)] : [],
    assigneeNames: assignedUserName ? [assignedUserName] : [],
    assignedToUserId: assignedUser?._id || (typeof task?.assignedTo === "string" ? task.assignedTo : null),
    createdBy: task?.createdBy?.name || project?.owner || "Workspace",
    createdByUserId: task?.createdBy?._id || null,
    dueDate: formatTaskDueDate(task?.dueDate),
    dueDateRaw: task?.dueDate || null,
    comments: commentItems.length,
    commentsList: commentItems.map((comment) => comment.text),
    commentItems,
    attachments: attachmentItems.length,
    attachmentFiles: attachmentItems.map((attachment) => attachment.name).filter(Boolean),
    attachmentItems,
    projectId: project?._id || resolvedProject?._id || task?.project || null,
    projectName: projectTitle,
    projectSlug,
    supportsTaskDetailsEditing: true,
  };
};

export const buildProjectBoardFromTasks = (tasks = []) => {
  const groupedBoard = cloneProjectBoard(apiProjectBoardTemplate, apiProjectBoardTemplate).map((column) => ({
    ...column,
    tasks: [],
  }));

  tasks.forEach((task) => {
    const matchingColumn = groupedBoard.find((column) => column.title === task.status);
    if (matchingColumn) {
      matchingColumn.tasks.push(task);
    }
  });

  return groupedBoard;
};

export const upsertTaskInBoard = (board = apiProjectBoardTemplate, task, options = {}) => {
  const taskId = String(task?.id || task?._id || "");
  const preferredIndex = Number.isInteger(options?.preferredIndex) ? options.preferredIndex : null;
  const preferredColumnTitle = options?.preferredColumnTitle || task.status;
  let existingTaskLocation = null;

  cloneProjectBoard(board, apiProjectBoardTemplate).forEach((column) => {
    const taskIndex = column.tasks.findIndex((existingTask) => String(existingTask.id) === taskId);

    if (taskIndex !== -1) {
      existingTaskLocation = {
        columnTitle: column.title,
        index: taskIndex,
      };
    }
  });

  const nextBoard = cloneProjectBoard(board, apiProjectBoardTemplate).map((column) => ({
    ...column,
    tasks: column.tasks.filter((existingTask) => String(existingTask.id) !== taskId),
  }));
  const destinationColumn = nextBoard.find((column) => column.title === preferredColumnTitle);

  if (!destinationColumn) {
    return nextBoard;
  }

  const boundedPreferredIndex =
    preferredIndex === null
      ? null
      : Math.max(0, Math.min(preferredIndex, destinationColumn.tasks.length));

  if (existingTaskLocation && existingTaskLocation.columnTitle === destinationColumn.title) {
    destinationColumn.tasks.splice(
      boundedPreferredIndex ?? Math.min(existingTaskLocation.index, destinationColumn.tasks.length),
      0,
      task
    );
    return nextBoard;
  }

  if (boundedPreferredIndex !== null) {
    destinationColumn.tasks.splice(boundedPreferredIndex, 0, task);
    return nextBoard;
  }

  destinationColumn.tasks.unshift(task);
  return nextBoard;
};

export const removeTaskFromBoard = (board = apiProjectBoardTemplate, taskId) =>
  cloneProjectBoard(board, apiProjectBoardTemplate).map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => String(task.id) !== String(taskId)),
  }));

export const groupTasksByProject = (tasks = []) =>
  tasks.reduce((taskMap, task) => {
    const projectId =
      task?.project && typeof task.project === "object" ? task.project?._id : task?.project;

    if (!projectId) {
      return taskMap;
    }

    const existingTasks = taskMap.get(String(projectId)) || [];
    taskMap.set(String(projectId), [...existingTasks, task]);
    return taskMap;
  }, new Map());

export const isTaskAssignedToUser = (task, { userId = null, initials = "" } = {}) =>
  Boolean(
    (userId && task?.assignedToUserId && userId === task.assignedToUserId) ||
      (initials && Array.isArray(task?.assignee) && task.assignee.includes(initials))
  );
