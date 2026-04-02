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
    title: "Done",
    color: "bg-emerald-500",
    tasks: [],
  },
];

export const seedProjects = [
  {
    id: 1,
    slug: "taskvue-web-app",
    title: "TaskVue Web App",
    description: "Frontend dashboard build with auth, profile, and multi-page navigation.",
    status: "On Track",
    stage: "Sprint 3",
    owner: "Onkar",
    members: ["OJ", "AK", "SK"],
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
            attachments: 1,
          },
          {
            id: 102,
            title: "Connect profile page sections to the active session details",
            priority: "Medium",
            assignee: ["SK"],
            dueDate: "Apr 8",
            comments: 1,
            attachments: 0,
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
            attachments: 2,
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
            attachments: 1,
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
    members: ["AN", "RJ", "VK"],
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
            attachments: 0,
          },
          {
            id: 202,
            title: "Collect the top drop-off reasons from support and sales notes",
            priority: "Medium",
            assignee: ["RJ"],
            dueDate: "Apr 10",
            comments: 2,
            attachments: 0,
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
            attachments: 3,
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
            attachments: 0,
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
    members: ["SK", "MK", "OJ"],
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
            attachments: 1,
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
            attachments: 2,
          },
          {
            id: 303,
            title: "Prepare mock data feeds for dashboard chart states",
            priority: "Medium",
            assignee: ["OJ"],
            dueDate: "Apr 8",
            comments: 2,
            attachments: 1,
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
            attachments: 0,
          },
        ],
      },
    ],
  },
];

export const cloneProjectBoard = (board = projectBoardTemplate) =>
  board.map((column) => ({
    ...column,
    tasks: [...column.tasks],
  }));

export const cloneProjects = (projects = seedProjects) =>
  projects.map((project) => ({
    ...project,
    members: [...project.members],
    board: cloneProjectBoard(project.board),
  }));

export const createProjectSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
