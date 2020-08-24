const Game = require('../models/game');

exports.getIndex = (req, res, next) => {
    Game.fetchAll(games => {
        res.render('home', {
            games: games,
            pageTitle: 'Kleva',
            path: '/'
        });
    });
};

exports.getGames = (req, res, next) => {
    Game.fetchAll(games => {
        res.render('store/games', {
            games: games,
            pageTitle: 'All Games',
            path: '/games'
        });
    });
};

exports.getGame = (req, res, next) => {
   const gameID = req.params.gameID; 
   Game.retrieveByID(gameID, game => {
       res.render('store/game-details', {
           game: game,
           pageTitle: game.title,
           path: '/games'
       })
   })
}

exports.getLogin = (req, res, next) => {
    res.render('login', {
        path: '/login',
        pageTitle: 'Login'
    });
};

exports.getAbout = (req, res, next) => {
    res.render('about', {
        path: '/about',
        pageTitle: 'About Us'
    });
};

exports.postCart = (req, res, next) => {
    const gameID = req.body.gameIdentity;
    Game.retrieveByID(gameID, game => {
        res.render('/cart');
    })
}

exports.getCart = (req, res, next) => {
    
}