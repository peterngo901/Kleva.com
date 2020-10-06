const express = require('express');

const gameroomController = require('../controllers/gameroom');

const router = express.Router();

router.get('/game-room', gameroomController.getGameroom);

router.get('/teacher/game-room', gameroomController.getTeacherGameroom);

router.post('/teacher/game-room', gameroomController.postTeacherGameroom);

module.exports = router;
