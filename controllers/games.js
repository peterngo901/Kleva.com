const Game = require('../models/game');

exports.getUploadGames = (req, res, next) => {
    res.render('creator/game_submission', {
        pageTtitle: 'Submission Page',
        path: '/creators/upload'
    });
}

exports.postUploadGames = (req, res, next) => {
    const game = new Game(req.title, req.price, req.description);
    game.upload();
    res.render('home');
}

exports.getGames = (req, res, next) => {
    const games = Game.fetchAll((games) => {
        res.render('home', {games: games })
    });
}

// Detail page for games.
exports.getGame = (req, res, next) => {
    const gameID = req.params.gameID // gameID is from the dynamic route
}