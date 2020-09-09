const firebase = require('firebase/app');

require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyACUQI6Ub4BTlHavE9cbEhOyGTad3H01nY",
    authDomain: "kleva-7918e.firebaseapp.com",
    databaseURL: "https://kleva-7918e.firebaseio.com",
    projectId: "kleva-7918e",
    storageBucket: "kleva-7918e.appspot.com",
    messagingSenderId: "709329434947",
    appId: "1:709329434947:web:44166481f1beac6ef417f6",
    measurementId: "G-JN9T1Z8MNF"
};

// Initialize Firebase
const firebaseAuth = firebase.initializeApp(firebaseConfig);
// firebase.analytics(); // Google Analytics

module.exports = firebaseAuth;
