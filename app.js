const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

// Routes
const storeRoutes = require('./routes/store');
const authenticatedRoutes = require('./routes/authenticated');

// Controllers
const notFoundController = require('./controllers/404');


const port = process.env.PORT || 3000;

const app = express();

// EJS Templating Engine
app.set('view engine', 'ejs');
// Views in the Views Folder
app.set('views', 'views');

// //Serve bootstrap Statically
app.use( express.static(__dirname + '/node_modules/bootstrap/dist'));

// //Serve jquery Statically
app.use( express.static(__dirname + '/node_modules/jquery/dist'));

// Serve CSS Statically
app.use(express.static(path.join(__dirname, 'public')));

// By default req.body does not parse the incoming request body. We must use a body parser.
app.use(bodyParser.urlencoded({ extended: false}));

// Mount the router on the app
app.use(storeRoutes);
// Mount the router on the app and add /logged_in before all paths.
app.use('/logged_in', authenticatedRoutes);



// 404 Page
app.use(notFoundController.get404);

app.listen(port);
