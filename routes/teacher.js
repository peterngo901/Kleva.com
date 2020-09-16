const express = require('express');

// Controllers
const classroomController = require('../controllers/classrooms');

////////////////////////////////////////////////////////////////////
const router = express.Router();

router.get('/teacher-dashboard', classroomController.getTeacherDashboard);

router.post('/add-classroom', classroomController.postAddClassroom);

router.get('/teacher-students', classroomController.getTeacherStudents);

module.exports = router;