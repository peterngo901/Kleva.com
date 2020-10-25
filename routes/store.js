const express = require('express');

// Import the store controller
const storeController = require('../controllers/store');
// Import the firebase controller
const authController = require('../controllers/auth');
const gameController = require('../controllers/games');

const router = express.Router();

router.get('/', storeController.getIndex);

router.get('/gamesgallery', storeController.getGamesGallery);

router.get('/games', storeController.getGames);

router.get('/games/:gameID', storeController.getGame);

router.get('/login', storeController.getLogin);

router.get('/about', storeController.getAbout);

router.get('/Home', storeController.getHome);

//placeholder route for bridgebuilder game
router.get('/gamepage', storeController.getGamepage);

router.get('/cart', storeController.getCart);

router.post('/cart', storeController.postCart);

router.post('/uploadGames', storeController.postUploadGames);

router.get('/gamepage/:gameID', gameController.getGamepageGameID);

module.exports = router;
