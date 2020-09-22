const express = require('express');
const firebaseAuth = require('../authentication/firebase')

// Import the store controller
const storeController = require('../controllers/store');
// Import the firebase controller
const authController = require('../controllers/auth');

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

router.get('/creator-dashboard', storeController.getCreatorDashboard);

router.get('/student-dashboard', storeController.getStudentDashboard);


router.post('/uploadGames', storeController.postUploadGames);

// router.get('/checkout', storeController.getCheckout);

router.post('/signup', authController.postSignup);

// Route Guarding
firebaseAuth.auth().onAuthStateChanged((user) => {
    if(user) {
        console.log('Signed In');
    } else {
        console.log('Not Signed In');
    }
})

module.exports = router;
