const firebaseAuth = require('../authentication/firebase');

exports.postSignup = (req, res, next) => {
    const email = req.body.username
    const password = req.body.password
    firebaseAuth.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
        res.render('creator/creator-dashboard', {
            path: '/creator-dashboard'
        });
        
    }).catch(err => {
        const errorMessage = err.message
        res.render('login', {
            error: errorMessage,
            pageTitle: 'Login'
        })
    }) 
}

exports.postSignin = (req, res, next) => {
    const email = req.body.username
    const password = req.body.password
    firebaseAuth.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
        res.render('creator/creator-dashboard', {
            path: '/creator-dashboard'
        });
    }).catch(err => {
        const errorMessage = err.message
        res.render('login', {
            error: errorMessage,
            pageTitle: 'Login'
        })
    })
}
