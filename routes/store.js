const express = require('express');

// Controllers
const storeController = require('../controllers/store');
const gameController = require('../controllers/games');

const router = express.Router();

router.get('/', storeController.getIndex);

router.get('/gamesgallery', storeController.getGamesGallery);

router.get('/about', storeController.getAbout);

router.get('/gamepage/:gameID', gameController.getGamepageGameID);

module.exports = router;
