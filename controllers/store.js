const Game = require('../models/game');

// Limit the number of games returned on a single page.
const gamesPerPage = 9;

exports.getIndex = (req, res, next) => {
  res.locals.user = req.session.sessionType;
  //res.set('Cache-control', 'public, max-age=86400');
  res.render('home', {
    pageTitle: 'Kleva',
    path: '/',
  });
};

exports.getGames = (req, res, next) => {
  res.render('store/games', {
    pageTitle: 'All Games',
    path: '/games',
  });
};

exports.getGame = (req, res, next) => {
  res.locals.user = req.session.sessionType;
  res.render('store/game-details', {
    pageTitle: game.title,
    path: '/games',
  });
};

// Public Game Gallery with no specific recommendation ML algorithm.
exports.getGamesGallery = async (req, res, next) => {
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
      res.redirect('/');
    }
  } else {
    try {
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
      res.redirect('/');
    }
  }
};

exports.getHome = (req, res, next) => {
  res.locals.user = req.session.sessionType;
  res.render('home', {
    path: '/home',
    pageTitle: 'Home',
  });
};

//placeholder route for bridge builder game
exports.getGamepage = (req, res, next) => {
  res.locals.user = req.session.sessionType;
  res.render('gamepage', {
    path: '/gamepage',
    pageTitle: 'Home',
  });
};

exports.getLogin = (req, res, next) => {
  res.locals.user = req.session.sessionType;
  res.render('login', {
    error: '',
    path: '/login',
    pageTitle: 'Login',
  });
};

exports.getAbout = (req, res, next) => {
  res.locals.user = req.session.sessionType;
  res.render('about', {
    path: '/about',
    pageTitle: 'About Us',
  });
};

exports.postCart = (req, res, next) => {
  res.render('/cart');
};

exports.getCart = (req, res, next) => {
  res.render('/cart');
};

exports.postUploadGames = (req, res, next) => {
  res.redirect('/creator-dashboard');
};
