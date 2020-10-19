// Models
const Creator = require('../models/creator');
const Games = require('../models/game');

const fs = require('fs');
const path = require('path');

// env
require('dotenv').config();

// Google Cloud Storage
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT,
  credentials: {
    client_email: process.env.GCLOUD_CLIENT_EMAIL,
    private_key: process.env.GCLOUD_PRIVATE_KEY,
  },
});
const bucket = storage.bucket(process.env.GCS_BUCKET);

// Unique File Names
const uuid = require('uuid');
const uuidv1 = uuid.v1;

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
    res.redirect('/');
  }
};

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
    res.redirect('/');
  }
};

exports.postUploadGame = async (req, res, next) => {
  const title = req.body.title;
  const description = req.body.description;
  const category = req.body.category;
  const { subCategories } = req.body;
  var subCategory = [];

  if (Array.isArray(subCategories) && subCategories.length > 1) {
    subCategories.forEach((subcategory) => subCategory.push(subcategory));
  } else {
    subCategory.push(subCategories);
  }

  // Store Files on Firebase Storage + gameID
  const newImageName = uuidv1() + '.png';
  const blob = bucket.file(newImageName); // Store the image in the bucket with the uuid name.
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  blobStream.on('error', (err) => console.log(err));
  var { count } = await Games.findAndCountAll({});

  var gameID = parseInt(count) + 2;

  blobStream.on('finish', async () => {
    const imageURL = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${blob.name}`;
    // .index html file from Unity Web Games and HTML5 Games.
    const gameHTML = '//v6p9d9t4.ssl.hwcdn.net/html/2655271/index.html';

    console.log(subCategory);
    await Games.create({
      gameID: gameID,
      title: title,
      category: category,
      subCategory: subCategory,
      description: description,
      gameFileURL: gameHTML,
      gameImageURL: imageURL,
    }).then(() => {
      //console.log('Success')
      res.redirect('/creator-dashboard');
    });
  });

  blobStream.end(req.files['gameImage'][0].buffer);

  // Retrieve path url to images

  // Store fields and gameImage url path and gameFile url path to Firebase

  // Games.create({
  //     title: fields.title,
  //     category: fields.category,
  //     description: fields.description,
  //     gameFile: files.gameFile,
  //     gameImage: files.gameImage
  // })
  //console.log(res.json({ fields, files }));
};
