const Project = require('../models/projectModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const fs = require('fs/promises');
const path = require('path');

const PROJECT_CODE_LENGTH = 6;
const PROJECT_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const USER_POPULATE_FIELDS = 'name email photo role about location';
const ATTACHMENTS_ROOT = path.join(__dirname, '..', 'uploads', 'projects');

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

const buildAttachmentResponse = (projectId, attachment, req) => {
  const attachmentObject = attachment?.toObject ? attachment.toObject() : attachment;
  const publicFileName = path.basename(attachmentObject.filePath || attachmentObject.fileName || '');

  return {
    ...attachmentObject,
    fileUrl:
      attachmentObject.fileUrl ||
      `${req.protocol}://${req.get('host')}/uploads/projects/${encodeURIComponent(
        projectId.toString()
      )}/${encodeURIComponent(publicFileName)}`,
  };
};

const populateProjectWithAttachments = async (projectId, req) => {
  const project = await Project.findById(projectId)
    .populate('createdBy', USER_POPULATE_FIELDS)
    .populate('members.user', USER_POPULATE_FIELDS)
    .populate('attachments.uploadedBy', USER_POPULATE_FIELDS);

  if (!project) {
    return null;
  }

  const projectObject = project.toObject();
  projectObject.attachments = (project.attachments || []).map((attachment) =>
    buildAttachmentResponse(project._id, attachment, req)
  );

  return projectObject;
};

const hasAdminAccess = (project, userId) => {
  const isCreator = project.createdBy.toString() === userId;
  const isAdminMember = project.members.some(
    (member) => member.user && member.user.toString() === userId && member.role === 'admin'
  );

  return isCreator || isAdminMember;
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

  const project = await populateProjectWithAttachments(createdProject._id, req);

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
    .populate('members.user', USER_POPULATE_FIELDS)
    .populate('attachments.uploadedBy', USER_POPULATE_FIELDS);

  const normalizedProjects = projects.map((project) => {
    const projectObject = project.toObject();
    projectObject.attachments = (project.attachments || []).map((attachment) =>
      buildAttachmentResponse(project._id, attachment, req)
    );
    return projectObject;
  });

  res.status(200).json({
    status: 'success',
    data: { projects: normalizedProjects },
  });
});

exports.getProject = catchAsync(async (req, res, next) => {
  const project = await populateProjectWithAttachments(req.params.id, req);

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

  if (!hasAdminAccess(project, req.user.id)) {
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

  const joinedProject = await populateProjectWithAttachments(project._id, req);

  res.status(200).json({
    status: 'success',
    data: { project: joinedProject },
  });
});

exports.addProjectAttachments = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('Project not found.', 404));
  }

  const isMember = project.members.some(
    (member) => member.user && member.user.toString() === req.user.id
  );

  if (project.createdBy.toString() !== req.user.id && !isMember) {
    return next(new AppError('You do not have permission to add attachments to this project.', 403));
  }

  const attachments = Array.isArray(req.body.attachments) ? req.body.attachments : [];

  if (attachments.length === 0) {
    return next(new AppError('At least one attachment is required.', 400));
  }

  const projectDirectory = path.join(ATTACHMENTS_ROOT, project._id.toString());
  await fs.mkdir(projectDirectory, { recursive: true });

  for (const attachment of attachments) {
    const fileName = String(attachment?.fileName || '').trim();
    const base64Content = String(attachment?.content || '');

    if (!fileName || !base64Content) {
      return next(new AppError('Each attachment must include a file name and content.', 400));
    }

    const safeFileName = path.basename(fileName).replace(/[^\w.\-() ]+/g, '_');
    const storedFileName = `${Date.now()}-${safeFileName}`;
    const absoluteFilePath = path.join(projectDirectory, storedFileName);
    const fileBuffer = Buffer.from(base64Content, 'base64');

    await fs.writeFile(absoluteFilePath, fileBuffer);

    project.attachments.push({
      fileName,
      filePath: absoluteFilePath,
      fileUrl: `${req.protocol}://${req.get('host')}/uploads/projects/${encodeURIComponent(
        project._id.toString()
      )}/${encodeURIComponent(storedFileName)}`,
      mimeType: attachment?.mimeType || 'application/octet-stream',
      size: Number(attachment?.size) || fileBuffer.length,
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
    });
  }

  await project.save();

  const updatedProject = await populateProjectWithAttachments(project._id, req);

  res.status(200).json({
    status: 'success',
    data: { project: updatedProject },
  });
});

exports.removeProjectMember = catchAsync(async (req, res, next) => {
  const { id: projectId, memberId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    return next(new AppError('Project not found.', 404));
  }

  const isCreator = project.createdBy.toString() === req.user.id;
  const actingMember = project.members.find(
    (member) => member.user && member.user.toString() === req.user.id
  );
  const isAdminMember = actingMember?.role === 'admin';

  if (!isCreator && !isAdminMember) {
    return next(new AppError('Only project admins can remove members.', 403));
  }

  if (project.createdBy.toString() === memberId) {
    return next(new AppError('The project owner cannot be removed from the team.', 400));
  }

  const memberToRemove = project.members.find(
    (member) => member.user && member.user.toString() === memberId
  );

  if (!memberToRemove) {
    return next(new AppError('Project member not found.', 404));
  }

  if (memberToRemove.role === 'admin') {
    return next(new AppError('Admins cannot be removed from the team.', 400));
  }

  project.members = project.members.filter(
    (member) => member.user && member.user.toString() !== memberId
  );
  await project.save();

  const updatedProject = await populateProjectWithAttachments(project._id, req);

  res.status(200).json({
    status: 'success',
    data: { project: updatedProject },
  });
});

exports.deleteProjectAttachment = catchAsync(async (req, res, next) => {
  const { id: projectId, attachmentId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    return next(new AppError('Project not found.', 404));
  }

  if (!hasAdminAccess(project, req.user.id)) {
    return next(new AppError('Only project admins can delete attachments.', 403));
  }

  const attachment = project.attachments.id(attachmentId);

  if (!attachment) {
    return next(new AppError('Attachment not found.', 404));
  }

  if (attachment.filePath) {
    try {
      await fs.unlink(attachment.filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  attachment.deleteOne();
  await project.save();

  const updatedProject = await populateProjectWithAttachments(project._id, req);

  res.status(200).json({
    status: 'success',
    data: { project: updatedProject },
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

  const regeneratedProject = await populateProjectWithAttachments(project._id, req);

  res.status(200).json({
    status: 'success',
    data: { project: regeneratedProject },
  });
});
