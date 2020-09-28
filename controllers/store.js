const Game = require('../models/game');

exports.getIndex = (req, res, next) => {
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
  res.render('store/game-details', {
    pageTitle: game.title,
    path: '/games',
  });
};

exports.getGamesGallery = (req, res, next) => {
  res.render('gamesgallery', {
    path: '/gamesgallery',
    pageTitle: 'GamesGallery',
  });
};

exports.getHome = (req, res, next) => {
  res.render('home', {
    path: '/home',
    pageTitle: 'Home',
  });
};

//placeholder route for bridge builder game
exports.getGamepage = (req, res, next) => {
  res.render('gamepage', {
    path: '/gamepage',
    pageTitle: 'Home',
  });
};

exports.getLogin = (req, res, next) => {
  res.render('login', {
    error: '',
    path: '/login',
    pageTitle: 'Login',
  });
};

exports.getAbout = (req, res, next) => {
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
