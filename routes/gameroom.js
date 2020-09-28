const express = require('express');

const gameroomController = require('../controllers/gameroom');

const router = express.Router();

router.get('/game-room', gameroomController.getGameroom);

module.exports = router;
