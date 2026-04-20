export const projectBoardTemplate = [
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

export const memberNameMap = {
  OJ: "Onkar J.",
  AK: "Aarav K.",
  SK: "Sakshi K.",
  AN: "Anika N.",
  RJ: "Riya J.",
  VK: "Vivek K.",
  MK: "Meera K.",
};

export const getInitials = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const createProjectSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const generateJoinCode = (title = "") => {
  const prefix = createProjectSlug(title).replace(/-/g, "").slice(0, 4).toUpperCase() || "PROJ";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
};

export const buildMemberDirectory = (members = []) =>
  members.reduce((directory, member) => {
    directory[member] = memberNameMap[member] || member;
    return directory;
  }, {});

export const resolveMemberLabel = (memberId, memberDirectory = {}) =>
  memberDirectory[memberId] || memberNameMap[memberId] || memberId;

const normalizeComparableValue = (value = "") => String(value || "").trim().toLowerCase();
const normalizeMemberEntryId = (member) => {
  if (!member) {
    return "";
  }

  if (typeof member === "string") {
    return member.trim();
  }

  if (typeof member === "object") {
    if (typeof member.user === "string") {
      return member.user.trim();
    }

    if (member.user && typeof member.user === "object") {
      return String(member.user?._id || member.user?.id || "").trim();
    }

    return String(member._id || member.id || "").trim();
  }

  return "";
};

export const hasProjectAccess = (project, userId, displayName) => {
  if (!project) {
    return false;
  }

  const normalizedUserId = String(userId || "").trim();
  const normalizedName = normalizeComparableValue(displayName);
  const normalizedOwner = normalizeComparableValue(project.owner);
  const normalizedAdmin = normalizeComparableValue(project.admin);
  const displayInitials = getInitials(displayName || "");
  const projectMemberIds = Array.isArray(project.members)
    ? project.members.map((member) => normalizeMemberEntryId(member)).filter(Boolean)
    : [];
  const memberProfileIds = Array.isArray(project.memberProfiles)
    ? project.memberProfiles
        .map((memberProfile) =>
          String(memberProfile?.userId || memberProfile?._id || memberProfile?.id || "").trim()
        )
        .filter(Boolean)
    : [];

  return (
    Boolean(
      normalizedUserId &&
        (projectMemberIds.includes(normalizedUserId) || memberProfileIds.includes(normalizedUserId))
    ) ||
    Boolean(displayInitials && projectMemberIds.includes(displayInitials)) ||
    Boolean(normalizedName && normalizedName === normalizedOwner) ||
    Boolean(normalizedName && normalizedName === normalizedAdmin)
  );
};

export const seedProjects = [
  {
    id: 1,
    slug: "taskvue-web-app",
    title: "TaskVue Web App",
    description: "Frontend dashboard build with auth, profile, and multi-page navigation.",
    status: "On Track",
    stage: "Sprint 3",
    owner: "Onkar",
    admin: "Onkar",
    joinCode: "TASK-A1B2",
    members: ["OJ", "AK", "SK"],
    memberDirectory: buildMemberDirectory(["OJ", "AK", "SK"]),
    board: [
      {
        title: "To Do",
        color: "bg-slate-400/50",
        tasks: [
          {
            id: 101,
            title: "Refine auth error messaging across login and register screens",
            priority: "High",
            assignee: ["OJ", "AK"],
            dueDate: "Apr 6",
            comments: 3,
            commentsList: [],
            attachments: 1,
            attachmentFiles: [],
          },
          {
            id: 102,
            title: "Connect profile page sections to the active session details",
            priority: "Medium",
            assignee: ["SK"],
            dueDate: "Apr 8",
            comments: 1,
            commentsList: [],
            attachments: 0,
            attachmentFiles: [],
          },
        ],
      },
      {
        title: "In Progress",
        color: "bg-primary",
        tasks: [
          {
            id: 103,
            title: "Build project navigation and page-level routing for workspace modules",
            priority: "High",
            assignee: ["OJ", "SK"],
            dueDate: "Apr 5",
            comments: 5,
            commentsList: [],
            attachments: 2,
            attachmentFiles: [],
          },
        ],
      },
      {
        title: "In Review",
        color: "bg-amber-500",
        tasks: [
          {
            id: 105,
            title: "Validate reusable UI component styling across task flows",
            priority: "High",
            assignee: ["OJ", "SK"],
            dueDate: "Apr 9",
            comments: 2,
            commentsList: [],
            attachments: 1,
            attachmentFiles: [],
          },
        ],
      },
      {
        title: "Done",
        color: "bg-emerald-500",
        tasks: [
          {
            id: 104,
            title: "Set up dashboard shell with sidebar and header interactions",
            priority: "Low",
            assignee: ["AK"],
            dueDate: "Apr 2",
            comments: 2,
            commentsList: [],
            attachments: 1,
            attachmentFiles: [],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    slug: "client-onboarding-revamp",
    title: "Client Onboarding Revamp",
    description: "Improve conversion, simplify forms, and reduce drop-off during setup.",
    status: "Planning",
    stage: "Discovery",
    owner: "Anika",
    admin: "Anika",
    joinCode: "CLIE-C3D4",
    members: ["AN", "RJ", "VK"],
    memberDirectory: buildMemberDirectory(["AN", "RJ", "VK"]),
    board: [
      {
        title: "To Do",
        color: "bg-slate-400/50",
        tasks: [
          {
            id: 201,
            title: "Map every step in the current onboarding experience",
            priority: "High",
            assignee: ["AN"],
            dueDate: "Apr 9",
            comments: 4,
            commentsList: [],
            attachments: 0,
            attachmentFiles: [],
          },
          {
            id: 202,
            title: "Collect the top drop-off reasons from support and sales notes",
            priority: "Medium",
            assignee: ["RJ"],
            dueDate: "Apr 10",
            comments: 2,
            commentsList: [],
            attachments: 0,
            attachmentFiles: [],
          },
        ],
      },
      {
        title: "In Progress",
        color: "bg-primary",
        tasks: [
          {
            id: 203,
            title: "Draft a lower-friction onboarding flow with fewer required fields",
            priority: "High",
            assignee: ["VK", "AN"],
            dueDate: "Apr 7",
            comments: 6,
            commentsList: [],
            attachments: 3,
            attachmentFiles: [],
          },
        ],
      },
      {
        title: "In Review",
        color: "bg-amber-500",
        tasks: [
          {
            id: 205,
            title: "Review onboarding copy and form simplification proposals",
            priority: "Medium",
            assignee: ["AN", "RJ"],
            dueDate: "Apr 8",
            comments: 3,
            commentsList: [],
            attachments: 1,
            attachmentFiles: [],
          },
        ],
      },
      {
        title: "Done",
        color: "bg-emerald-500",
        tasks: [
          {
            id: 204,
            title: "Align success metrics for the redesign with the growth team",
            priority: "Low",
            assignee: ["RJ"],
            dueDate: "Apr 3",
            comments: 1,
            commentsList: [],
            attachments: 0,
            attachmentFiles: [],
          },
        ],
      },
    ],
  },
  {
    id: 3,
    slug: "analytics-module",
    title: "Analytics Module",
    description: "Prepare charts and trend reporting views for stakeholder review.",
    status: "In Progress",
    stage: "Build",
    owner: "Sakshi",
    admin: "Sakshi",
    joinCode: "ANLY-E5F6",
    members: ["SK", "MK", "OJ"],
    memberDirectory: buildMemberDirectory(["SK", "MK", "OJ"]),
    board: [
      {
        title: "To Do",
        color: "bg-slate-400/50",
        tasks: [
          {
            id: 301,
            title: "Add export-ready chart summaries for weekly reporting",
            priority: "Medium",
            assignee: ["MK"],
            dueDate: "Apr 11",
            comments: 0,
            commentsList: [],
            attachments: 1,
            attachmentFiles: [],
          },
        ],
      },
      {
        title: "In Progress",
        color: "bg-primary",
        tasks: [
          {
            id: 302,
            title: "Design trend cards for stakeholder snapshots and executive reviews",
            priority: "High",
            assignee: ["SK", "OJ"],
            dueDate: "Apr 6",
            comments: 7,
            commentsList: [],
            attachments: 2,
            attachmentFiles: [],
          },
          {
            id: 303,
            title: "Prepare mock data feeds for dashboard chart states",
            priority: "Medium",
            assignee: ["OJ"],
            dueDate: "Apr 8",
            comments: 2,
            commentsList: [],
            attachments: 1,
            attachmentFiles: [],
          },
        ],
      },
      {
        title: "In Review",
        color: "bg-amber-500",
        tasks: [
          {
            id: 305,
            title: "Review trend cards and executive reporting layout with stakeholders",
            priority: "High",
            assignee: ["SK"],
            dueDate: "Apr 10",
            comments: 4,
            commentsList: [],
            attachments: 2,
            attachmentFiles: [],
          },
        ],
      },
      {
        title: "Done",
        color: "bg-emerald-500",
        tasks: [
          {
            id: 304,
            title: "Finalize analytics page section hierarchy and spacing rhythm",
            priority: "Low",
            assignee: ["SK"],
            dueDate: "Apr 1",
            comments: 3,
            commentsList: [],
            attachments: 0,
            attachmentFiles: [],
          },
        ],
      },
    ],
  },
];

export const cloneProjectBoard = (
  board = projectBoardTemplate,
  template = projectBoardTemplate
) => {
  const boardMap = new Map(
    (board || []).map((column) => [
      column.title,
      {
        ...column,
        tasks: (column.tasks || []).map((task) => ({
          ...task,
          assignee: [...(task.assignee || [])],
          assigneeNames: [...(task.assigneeNames || [])],
          commentsList: [...(task.commentsList || [])],
          attachmentFiles: [...(task.attachmentFiles || [])],
        })),
      },
    ])
  );

  const boardTemplate = Array.isArray(template) && template.length > 0 ? template : projectBoardTemplate;

  return boardTemplate.map((templateColumn) => {
    const existingColumn = boardMap.get(templateColumn.title);

    return {
      ...templateColumn,
      ...(existingColumn || {}),
      title: templateColumn.title,
      color: templateColumn.color,
      tasks: existingColumn?.tasks || [],
    };
  });
};

export const cloneProjects = (projects = seedProjects) =>
  projects.map((project) => ({
    ...project,
    members: [...project.members],
    memberDirectory: { ...(project.memberDirectory || buildMemberDirectory(project.members)) },
    board: cloneProjectBoard(project.board),
  }));
