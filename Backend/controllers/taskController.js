const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');
const Task = require('../models/taskModel');
const Project = require('../models/projectModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const TASK_POPULATE_FIELDS = 'name email photo role about location';
const TASK_ATTACHMENTS_ROOT = path.join(__dirname, '..', 'uploads', 'tasks');

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

const ensureTaskExistsAndReadable = async (taskId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new AppError('Invalid task id.', 400);
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  const project = await Project.findById(task.project);

  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  if (!isProjectMember(project, userId)) {
    throw new AppError('You do not have access to this task.', 403);
  }

  return { task, project };
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
    sortOrder,
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
    status: status || 'todo',
    sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : Date.now(),
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

  const allowedUpdates = ['title', 'description', 'assignedTo', 'status', 'priority', 'dueDate', 'sortOrder'];
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

  if (updates.status !== undefined && updates.sortOrder === undefined) {
    updates.sortOrder = Date.now();
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

exports.addTaskComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const text = String(req.body?.text || '').trim();

  if (!text) {
    return next(new AppError('Comment text is required.', 400));
  }

  const { task } = await ensureTaskExistsAndReadable(id, req.user.id);

  task.comments.push({
    user: req.user.id,
    text,
    createdAt: new Date(),
  });

  await task.save();

  const populatedTask = await populateTaskQuery(Task.findById(task._id));

  res.status(200).json({
    status: 'success',
    data: {
      task: populatedTask,
    },
  });
});

exports.addTaskAttachments = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const attachments = Array.isArray(req.body.attachments) ? req.body.attachments : [];

  if (attachments.length === 0) {
    return next(new AppError('At least one attachment is required.', 400));
  }

  const { task } = await ensureTaskExistsAndReadable(id, req.user.id);
  const taskDirectory = path.join(TASK_ATTACHMENTS_ROOT, task._id.toString());

  await fs.mkdir(taskDirectory, { recursive: true });

  for (const attachment of attachments) {
    const fileName = String(attachment?.fileName || '').trim();
    const base64Content = String(attachment?.content || '');

    if (!fileName || !base64Content) {
      return next(new AppError('Each attachment must include a file name and content.', 400));
    }

    const safeFileName = path.basename(fileName).replace(/[^\w.\-() ]+/g, '_');
    const storedFileName = `${Date.now()}-${safeFileName}`;
    const absoluteFilePath = path.join(taskDirectory, storedFileName);
    const fileBuffer = Buffer.from(base64Content, 'base64');

    await fs.writeFile(absoluteFilePath, fileBuffer);

    task.attachments.push({
      fileName,
      filePath: absoluteFilePath,
      fileUrl: `${req.protocol}://${req.get('host')}/uploads/tasks/${encodeURIComponent(
        task._id.toString()
      )}/${encodeURIComponent(storedFileName)}`,
      mimeType: attachment?.mimeType || 'application/octet-stream',
      size: Number(attachment?.size) || fileBuffer.length,
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
    });
  }

  await task.save();

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

  await fs.rm(path.join(TASK_ATTACHMENTS_ROOT, task._id.toString()), {
    recursive: true,
    force: true,
  });
  await Task.findByIdAndDelete(id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
