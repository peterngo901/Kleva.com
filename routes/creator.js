const express = require('express');

// Controller
const creatorsController = require('../controllers/creators');

// Dependencies
const Multer = require('multer');
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const router = express.Router();

// Creator Routes
router.get('/', creatorsController.getCreatorDashboard);
router.get('/game-upload', creatorsController.getGameUpload);
router.post(
  '/game-upload',
  multer.fields([
    { name: 'gameFile', maxCount: 1 },
    { name: 'gameImage', maxCount: 3 },
  ]),
  creatorsController.postUploadGame
);

module.exports = router;
