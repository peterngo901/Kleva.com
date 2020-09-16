const express = require('express');

// Form Validation
const { check } = require('express-validator')

// Controllers
const authController = require('../controllers/auth');

// Models
const Teacher = require('../models/teacher');

///////////////////////////////////////////////////////////
const router = express.Router();

// Teacher Authentication
router.get('/teacher-signup', authController.getTeacherSignup);
router.post('/teacher-signup', 
            check('username').isEmail(), // Validate that email is an email.
            check('school').not().isEmpty().withMessage('Please enter the name of your school.'), // Validate that school field is not empty, if empty send error message.
            check('password').isLength({ min: 6 }), // Validate that password has minimum length of 6 characters.
            check('confirmPassword').isLength({ min: 6 }), // Validate that confirmPassword matches password.
            authController.postTeacherSignup); 
router.get('/teacher-signin', authController.getTeacherSignin);
router.post('/teacher-signin', authController.postTeacherSignin);

// Creator Authentication


// Student Authentication


// Session (Firebase)
router.post('/sessionLogin', authController.postSessionLogin);

module.exports = router;