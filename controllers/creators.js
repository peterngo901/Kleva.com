// Globals
const fs = require('fs');
const path = require('path');

// Dependencies
require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT,
  credentials: {
    client_email: process.env.GCLOUD_CLIENT_EMAIL,
    private_key: process.env.GCLOUD_PRIVATE_KEY,
  },
});
const bucket = storage.bucket(process.env.GCS_BUCKET);
const uuid = require('uuid');
const uuidv1 = uuid.v1;

// Models
const Games = require('../models/game');

// Return the game creator dashboard.
exports.getCreatorDashboard = (req, res, next) => {
  if (req.session.user) {
    const email = req.session.user;
    Games.findAll({
      where: {
        creatorEmail: email,
      },
      attributes: ['title', 'category', 'description'],
    })
      .then(() => {
        // TODO: Retrieve Games to list in cards in creator dashboard.
        res.render('creator/creator-dashboard', {
          path: 'creator-dashboard',
        });
      })
      .catch((err) => {
        res.render('creator/creator-dashboard', {
          path: 'creator-dashboard',
        });
      });
  } else {
    // Session expired or invalid.
    res.status(401).redirect('/creator-signin');
  }
};

// Return the game upload page.
exports.getGameUpload = (req, res, next) => {
  if (req.session.user) {
    const email = req.session.user;
    Games.findAll({
      where: {
        creatorEmail: email,
      },
      attributes: ['title', 'category', 'description'],
    })
      .then(() => {
        res.render('creator/game-upload', {
          path: 'game-upload',
        });
      })
      .catch((err) => {
        res.render('creator/game-upload', {
          path: 'game-upload',
        });
      });
  } else {
    // Session expired or invalid.
    res.status(401).redirect('/creator-signin');
  }
};

exports.postUploadGame = async (req, res, next) => {
  const title = req.body.title;
  const description = req.body.description;
  const category = req.body.category;
  const { subCategories } = req.body;
  var subCategory = [];

  // Reshape game subcategories for storage into the database.
  if (Array.isArray(subCategories) && subCategories.length > 1) {
    subCategories.forEach((subcategory) => subCategory.push(subcategory));
  } else {
    subCategory.push(subCategories);
  }

  // Store game assets in the GCS bucket.
  const newImageName = uuidv1() + '.png'; // Ensure no duplicate namespaces exist for game assets.
  const blob = bucket.file(newImageName);
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  blobStream.on('error', (err) =>
    res.status(500).redirect('/creator-dashboard')
  );
  // Return the next available gameID primary key.
  var { count } = await Games.findAndCountAll({});
  var gameID = parseInt(count) + 2;

  // On completion of game asset upload post the game asset urls and game details to the database.
  blobStream.on('finish', async () => {
    const imageURL = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${blob.name}`;
    // .index html file from Unity Web Games and HTML5 Games. (Placeholder for demonstration purposes)
    const gameHTML = '//v6p9d9t4.ssl.hwcdn.net/html/2655271/index.html';

    await Games.create({
      gameID: gameID,
      title: title,
      category: category,
      subCategory: subCategory,
      description: description,
      gameFileURL: gameHTML,
      gameImageURL: imageURL,
    })
      .then(() => {
        res.status(200).redirect('/creator-dashboard');
      })
      .catch((err) => {
        res.status(500).redirect('/creator-dashboard');
      });
  });

  blobStream.end(req.files['gameImage'][0].buffer);
};
