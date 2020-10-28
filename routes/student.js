const express = require('express');

// Controllers
const studentController = require('../controllers/students');

const router = express.Router();

// Student Routes
router.get('/student-dashboard', studentController.getStudentDashboard);

router.post('/add-time', studentController.postAddTime);

module.exports = router;
