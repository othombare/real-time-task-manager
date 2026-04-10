const Project = require('../models/projectModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const PROJECT_CODE_LENGTH = 6;
const PROJECT_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const USER_POPULATE_FIELDS = 'name email';

const generateRandomProjectCode = () => {
  let code = '';
  for (let i = 0; i < PROJECT_CODE_LENGTH; i += 1) {
    code += PROJECT_CODE_CHARS.charAt(Math.floor(Math.random() * PROJECT_CODE_CHARS.length));
  }
  return code;
};

const generateUniqueProjectCode = async () => {
  let projectCode;
  let existing;
  do {
    projectCode = generateRandomProjectCode();
    existing = await Project.findOne({ projectCode });
  } while (existing);
  return projectCode;
};

exports.createProject = catchAsync(async (req, res, next) => {
  const { title, description } = req.body;

  if (!title) {
    return next(new AppError('Project title is required.', 400));
  }

  const projectCode = await generateUniqueProjectCode();

  const createdProject = await Project.create({
    title,
    description,
    createdBy: req.user.id,
    projectCode,
    members: [{ user: req.user.id, role: 'admin' }],
  });

  const project = await Project.findById(createdProject._id)
    .populate('createdBy', USER_POPULATE_FIELDS)
    .populate('members.user', USER_POPULATE_FIELDS);

  res.status(201).json({
    status: 'success',
    data: { project },
  });
});

exports.getAllProjects = catchAsync(async (req, res, next) => {
  const projects = await Project.find({
    $or: [
      { createdBy: req.user.id },
      { 'members.user': req.user.id },
    ],
  })
    .populate('createdBy', USER_POPULATE_FIELDS)
    .populate('members.user', USER_POPULATE_FIELDS);

  res.status(200).json({
    status: 'success',
    data: { projects },
  });
});

exports.getProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', USER_POPULATE_FIELDS)
    .populate('members.user', USER_POPULATE_FIELDS);

  if (!project) {
    return next(new AppError('Project not found.', 404));
  }

  const isCreator = project.createdBy._id.toString() === req.user.id;
  const isMember = project.members.some(
    (member) => member.user && member.user._id.toString() === req.user.id
  );

  if (!isCreator && !isMember) {
    return next(new AppError('You do not have permission to view this project.', 403));
  }

  res.status(200).json({
    status: 'success',
    data: { project },
  });
});

exports.updateProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found.', 404));
  }

  const isCreator = project.createdBy.toString() === req.user.id;
  const isAdminMember = project.members.some(
    (member) => member.user && member.user.toString() === req.user.id && member.role === 'admin'
  );

  if (!isCreator && !isAdminMember) {
    return next(new AppError('You do not have permission to update this project.', 403));
  }

  const updates = {};
  if (req.body.title !== undefined) updates.title = req.body.title;
  if (req.body.description !== undefined) updates.description = req.body.description;

  Object.assign(project, updates);
  await project.save();

  const updatedProject = await Project.findById(project._id)
    .populate('createdBy', USER_POPULATE_FIELDS)
    .populate('members.user', USER_POPULATE_FIELDS);

  res.status(200).json({
    status: 'success',
    data: { project: updatedProject },
  });
});

exports.deleteProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found.', 404));
  }

  if (project.createdBy.toString() !== req.user.id) {
    return next(new AppError('Only the project owner can delete this project.', 403));
  }

  await project.deleteOne();

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.joinProject = catchAsync(async (req, res, next) => {
  const { projectCode } = req.body;

  if (!projectCode) {
    return next(new AppError('Project code is required.', 400));
  }

  const normalizedCode = projectCode.toUpperCase();
  const project = await Project.findOne({ projectCode: normalizedCode });

  if (!project) {
    return next(new AppError('Project not found.', 404));
  }

  const isAlreadyMember = project.members.some(
    (member) => member.user && member.user.toString() === req.user.id
  );

  if (isAlreadyMember || project.createdBy.toString() === req.user.id) {
    return next(new AppError('Already a member.', 400));
  }

  project.members.push({ user: req.user.id, role: 'member' });
  await project.save();

  const joinedProject = await Project.findById(project._id)
    .populate('createdBy', USER_POPULATE_FIELDS)
    .populate('members.user', USER_POPULATE_FIELDS);

  res.status(200).json({
    status: 'success',
    data: { project: joinedProject },
  });
});

exports.regenerateProjectCode = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found.', 404));
  }

  if (project.createdBy.toString() !== req.user.id) {
    return next(new AppError('Only the project owner can regenerate the project code.', 403));
  }

  let newCode;
  let existing;
  do {
    newCode = generateRandomProjectCode();
    existing = await Project.findOne({ projectCode: newCode });
  } while (existing || newCode === project.projectCode);

  project.projectCode = newCode;
  await project.save();

  const regeneratedProject = await Project.findById(project._id)
    .populate('createdBy', USER_POPULATE_FIELDS)
    .populate('members.user', USER_POPULATE_FIELDS);

  res.status(200).json({
    status: 'success',
    data: { project: regeneratedProject },
  });
});
