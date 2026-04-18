const express = require('express');
const taskController = require('../controllers/taskController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.route('/').post(taskController.createTask).get(taskController.getAllTasks);
router.route('/:id/comments').post(taskController.addTaskComment);
router.route('/:id/attachments').post(taskController.addTaskAttachments);
router
  .route('/:id')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
