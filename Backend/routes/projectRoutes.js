const express = require('express');
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.route('/').post(projectController.createProject).get(projectController.getAllProjects);
router.route('/join').post(projectController.joinProject);
router.route('/:id').get(projectController.getProject).patch(projectController.updateProject).delete(projectController.deleteProject);
router.post('/:id/attachments', projectController.addProjectAttachments);
router.delete('/:id/attachments/:attachmentId', projectController.deleteProjectAttachment);
router.delete('/:id/members/:memberId', projectController.removeProjectMember);
router.patch('/:id/regenerate-code', projectController.regenerateProjectCode);

module.exports = router;
