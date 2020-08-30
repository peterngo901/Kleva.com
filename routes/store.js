const express = require('express');

// Import the store controller
const storeController = require('../controllers/store');

const router = express.Router();

router.get('/', storeController.getIndex);

router.get('/games', storeController.getGames);

router.get('/games/:gameID', storeController.getGame);

router.get('/login', storeController.getLogin);

router.get('/about', storeController.getAbout);

router.get('/cart', storeController.getCart);

router.post('/cart', storeController.postCart);

// router.get('/checkout', storeController.getCheckout);

module.exports = router;