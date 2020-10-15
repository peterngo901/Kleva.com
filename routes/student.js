const express = require('express');

const studentController = require('../controllers/students');

const router = express.Router();

router.get('/student-dashboard', studentController.getStudentDashboard);

router.post('/add-time', studentController.postAddTime);

module.exports = router;
