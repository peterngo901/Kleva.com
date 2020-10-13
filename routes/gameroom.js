const express = require('express');

const gameroomController = require('../controllers/gameroom');
const questionController = require('../controllers/questions');

const router = express.Router();

router.get('/game-room', gameroomController.getGameroom);

router.get('/teacher/game-room', gameroomController.getTeacherGameroom);

router.post('/teacher/game-room', gameroomController.postTeacherGameroom);

// Classroom Modal Post Request to Database for ACARA Curriculum
router.post('/game-staging-area', questionController.postYearLevelSubstrand);

module.exports = router;
