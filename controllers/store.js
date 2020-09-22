const Game = require('../models/game');


exports.getIndex = (req, res, next) => {
    // Game.listAll().then(games => {      
        res.render('home', {
            
            pageTitle: 'Kleva',
            path: '/'
        });
    // }).catch(err => console.log(err))
};

exports.getGames = (req, res, next) => {
    // Game.listAll().then().catch();
        res.render('store/games', {
            games: games,
            pageTitle: 'All Games',
            path: '/games'
        });
    
};

exports.getGame = (req, res, next) => {
   const gameID = req.params.gameID; 
//    Game.retrieveByID(gameID, game => {
       res.render('store/game-details', {
           game: game,
           pageTitle: game.title,
           path: '/games'
       })
   
}

exports.getGamesGallery = (req, res, next) => {
    res.render('gamesgallery', {
        path: '/gamesgallery',
        pageTitle: 'GamesGallery'
    });
};

exports.getHome = (req, res, next) => {
    res.render('home', {
        path: '/home',
        pageTitle: 'Home'
    });
};

//placeholder route for bridge builder game
exports.getGamepage = (req, res, next) => {
    res.render('gamepage', {
        path: '/gamepage',
        pageTitle: 'Home'
    });
};

exports.getLogin = (req, res, next) => {
    res.render('login', {
        error: '',
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

exports.getCreatorDashboard = (req, res, next) => {
    res.render('creator/creator-dashboard', {
        path: '/creator-dashboard',
        pageTitle: 'Dashboard'
    })
}

exports.postUploadGames = (req, res, next) => {
    
    const gameToUpload = {
        title: req.body.title,
        description: req.body.description,
    }
    const upload = new Game;
    upload.create(gameToUpload);
    res.redirect('/creator-dashboard');
}
