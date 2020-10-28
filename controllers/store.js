// Models
const Game = require('../models/game');

// Paginate the games per page.
const gamesPerPage = 9;

// Return the home page.
exports.getIndex = (req, res, next) => {
  res.locals.user = req.session.sessionType;
  // Cache the home-page for faster-loading.
  res.set('Cache-control', 'public, max-age=86400');
  res.render('home', {
    pageTitle: 'Kleva',
    path: '/',
  });
};

// Return the public facing game gallery with no-specific ACARA descriptions.
exports.getGamesGallery = async (req, res, next) => {
  // Cache the game-gallery for faster-loading.
  res.set('Cache-control', 'public, max-age=86400');
  const page = req.query.page;
  const gameCategory = req.query.gameCategory;
  res.locals.user = req.session.sessionType;
  if (gameCategory === undefined) {
    try {
      var gameBatch = (page - 1) * gamesPerPage;
      const games = await Game.findAndCountAll({
        offset: gameBatch,
        limit: gamesPerPage,
      });
      // Total Games Returned
      const totalGames = games.count;
      const gamesArray = games.rows;
      res.render('gamesgallery', {
        path: '/gamesgallery',
        pageTitle: 'GamesGallery',
        games: gamesArray,
        pageNumber: parseInt(page),
        pageButtons: Math.ceil(totalGames / gamesPerPage),
      });
    } catch (err) {
      // Error fetching games from the database.
      res.status(500).redirect('/');
    }
  } else {
    try {
      // Paginate the loading of games.
      var gameBatch = (page - 1) * gamesPerPage;
      const games = await Game.findAndCountAll({
        where: {
          category: gameCategory,
        },
        offset: gameBatch,
        limit: gamesPerPage,
      });
      // Total Games Returned
      const totalGames = games.count;
      const gamesArray = games.rows;
      res.render('gamesgallery', {
        path: '/gamesgallery',
        pageTitle: 'GamesGallery',
        games: gamesArray,
        pageNumber: parseInt(page),
        pageButtons: Math.ceil(totalGames / gamesPerPage),
      });
    } catch (err) {
      // Error fetching games from the database.
      res.status(500).redirect('/');
    }
  }
};

// Return the about page.
exports.getAbout = (req, res, next) => {
  res.locals.user = req.session.sessionType;
  res.render('about', {
    path: '/about',
    pageTitle: 'About Us',
  });
};
