const mongoose = require('mongoose');
const Task = require('../models/taskModel');
const Project = require('../models/projectModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const TASK_POPULATE_FIELDS = 'name email photo role about location';

const isProjectMember = (project, userId) => {
  if (!project || !userId) {
    return false;
  }

  return (
    project.createdBy?.toString() === userId ||
    (project.members || []).some(
      (member) => member.user && member.user.toString() === userId
    )
  );
};

const hasProjectAdminAccess = (project, userId) => {
  if (!project || !userId) {
    return false;
  }

  return (
    project.createdBy?.toString() === userId ||
    (project.members || []).some(
      (member) =>
        member.user &&
        member.user.toString() === userId &&
        member.role === 'admin'
    )
  );
};

const populateTaskQuery = (query) =>
  query
    .populate({
      path: 'project',
      select: 'title description projectCode createdBy members',
      populate: [
        {
          path: 'createdBy',
          select: TASK_POPULATE_FIELDS,
        },
        {
          path: 'members.user',
          select: TASK_POPULATE_FIELDS,
        },
      ],
    })
    .populate('assignedTo', TASK_POPULATE_FIELDS)
    .populate('createdBy', TASK_POPULATE_FIELDS)
    .populate('comments.user', TASK_POPULATE_FIELDS)
    .populate('attachments.uploadedBy', TASK_POPULATE_FIELDS);

const ensureProjectExistsAndReadable = async (projectId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new AppError('Invalid project id.', 400);
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  if (!isProjectMember(project, userId)) {
    throw new AppError('You do not have access to this project.', 403);
  }

  return project;
};

exports.createTask = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    project: projectId,
    assignedTo,
    status,
    priority,
    dueDate,
  } = req.body;

  if (!title || !String(title).trim()) {
    return next(new AppError('Task title is required.', 400));
  }

  if (!projectId) {
    return next(new AppError('Project is required.', 400));
  }

  const project = await ensureProjectExistsAndReadable(projectId, req.user.id);

  if (
    assignedTo &&
    !(
      project.createdBy?.toString() === assignedTo ||
      (project.members || []).some(
        (member) => member.user && member.user.toString() === assignedTo
      )
    )
  ) {
    return next(new AppError('Assigned user must belong to the project.', 400));
  }

  const task = await Task.create({
    title: String(title).trim(),
    description,
    project: project._id,
    assignedTo: assignedTo || undefined,
    createdBy: req.user.id,
    status,
    priority,
    dueDate,
  });

  const populatedTask = await populateTaskQuery(Task.findById(task._id));

  res.status(201).json({
    status: 'success',
    data: {
      task: populatedTask,
    },
  });
});

exports.getAllTasks = catchAsync(async (req, res, next) => {
  const { project: projectId, status, priority, assignedTo } = req.query;
  const filter = {};

  if (projectId) {
    await ensureProjectExistsAndReadable(projectId, req.user.id);
    filter.project = projectId;
  } else {
    const accessibleProjects = await Project.find({
      $or: [{ createdBy: req.user.id }, { 'members.user': req.user.id }],
    }).select('_id');

    filter.project = { $in: accessibleProjects.map((project) => project._id) };
  }

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  const tasks = await populateTaskQuery(Task.find(filter).sort({ createdAt: -1 }));

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks,
    },
  });
});

exports.getTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid task id.', 400));
  }

  const task = await populateTaskQuery(Task.findById(id));

  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  const project = await Project.findById(task.project?._id || task.project);

  if (!isProjectMember(project, req.user.id)) {
    return next(new AppError('You do not have access to this task.', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid task id.', 400));
  }

  const existingTask = await Task.findById(id);

  if (!existingTask) {
    return next(new AppError('Task not found.', 404));
  }

  const project = await Project.findById(existingTask.project);

  if (!project || !isProjectMember(project, req.user.id)) {
    return next(new AppError('You do not have access to this task.', 403));
  }

  const canUpdateTask =
    existingTask.createdBy?.toString() === req.user.id ||
    hasProjectAdminAccess(project, req.user.id);

  if (!canUpdateTask) {
    return next(new AppError('Only the task creator or a project admin can update this task.', 403));
  }

  const allowedUpdates = ['title', 'description', 'assignedTo', 'status', 'priority', 'dueDate'];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedUpdates.includes(key))
  );

  if (updates.title !== undefined && !String(updates.title).trim()) {
    return next(new AppError('Task title cannot be empty.', 400));
  }

  if (updates.assignedTo) {
    const assignedUserBelongsToProject =
      project.createdBy?.toString() === updates.assignedTo ||
      (project.members || []).some(
        (member) => member.user && member.user.toString() === updates.assignedTo
      );

    if (!assignedUserBelongsToProject) {
      return next(new AppError('Assigned user must belong to the project.', 400));
    }
  }

  if (updates.assignedTo === null || updates.assignedTo === '') {
    updates.assignedTo = undefined;
  }

  const task = await Task.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  const populatedTask = await populateTaskQuery(Task.findById(task._id));

  res.status(200).json({
    status: 'success',
    data: {
      task: populatedTask,
    },
  });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid task id.', 400));
  }

  const task = await Task.findById(id);

  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  if (task.createdBy?.toString() !== req.user.id) {
    return next(new AppError('Only the task creator can delete this task.', 403));
  }

  await Task.findByIdAndDelete(id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
