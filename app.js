const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

// Routes
const storeRoutes = require('./routes/store');
const authenticatedRoutes = require('./routes/authenticated');

// Controllers
const notFoundController = require('./controllers/404');

// Database
// const db = require('./data/database');

//db.execute('// SQL Queries Go Here.'); 

const port = process.env.PORT || 3000;

const app = express();

// EJS Templating Engine
app.set('view engine', 'ejs');
// Views in the Views Folder
app.set('views', 'views');

// Serve CSS Statically
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser
app.use(bodyParser.urlencoded({ extended: false}));

// Routing
app.use(storeRoutes);
app.use('/logged_in', authenticatedRoutes);



// 404 Page
app.use(notFoundController.get404);

app.listen(port);
