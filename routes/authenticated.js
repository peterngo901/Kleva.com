const express = require('express');

// Dependencies
const { check } = require('express-validator');

// Controllers
const authController = require('../controllers/auth');

const router = express.Router();

// Teacher Authentication
router.get('/teacher-signup', authController.getTeacherSignup);
router.post(
  '/teacher-signup',
  check('username').isEmail(), // Validate that email is an email.
  check('school')
    .not()
    .isEmpty()
    .withMessage('Please enter the name of your school.'), // Validate that school field is not empty, if empty send error message.
  check('password').isLength({ min: 6 }), // Validate that password has minimum length of 6 characters.
  check('confirmPassword').isLength({ min: 6 }), // Validate that confirmPassword matches password.
  authController.postTeacherSignup
);
router.get('/teacher-signin', authController.getTeacherSignin);
router.post('/teacher-signin', authController.postTeacherSignin);

// Creator Authentication
router.get('/creator-signup', authController.getCreatorSignup);
router.post('/creator-signup', authController.postCreatorSignup);
router.get('/creator-signin', authController.getCreatorSignin);
router.post('/creator-signin', authController.postCreatorSignin);

// Student Authentication
router.get('/student-signin', authController.getStudentSignin);
router.post('/student-signin', authController.postStudentSignin);

// Signout
router.post('/sign-out', authController.postSignout);

// User Profile
router.get('/profile', authController.getProfile);

module.exports = router;
