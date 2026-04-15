const express= require('express');
const fs= require('fs');
const router= express.Router();
const userController= require('../controllers/userController');
const authController= require('../controllers/authController');



router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router
  .route('/me')
  .get(authController.protect, userController.getMe)
  .patch(authController.protect, userController.updateMe);

router.route('/').get(authController.protect,userController.getAllUsers).post(userController.createUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports= router;
