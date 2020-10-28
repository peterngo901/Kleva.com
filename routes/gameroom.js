const express = require('express');

// Controllers
const gameroomController = require('../controllers/gameroom');
const questionController = require('../controllers/questions');
const authController = require('../controllers/auth');

const router = express.Router();

// Gameroom Routes
router.get('/quick-join', authController.getStudentGameSignin);

router.post('/quick-join', authController.postStudentGameSignin);

router.get('/game-room', gameroomController.getGameroom);

router.get('/teacher/game-room', gameroomController.getTeacherGameroom);

router.post('/teacher/game-room', gameroomController.postTeacherGameroom);

// Classroom Modal Post Request to Database for ACARA Curriculum
router.post('/game-staging-area', questionController.postYearLevelSubstrand);

module.exports = router;
