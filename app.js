const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
require('dotenv').config();

// Server-side cookies for login persistence.
const session = require('express-session');

// 3rd Party Middlewares
const bodyParser = require('body-parser');

// Routes
const storeRoutes = require('./routes/store');
const authenticatedRoutes = require('./routes/authenticated');
const teacherRoutes = require('./routes/teacher');
const creatorRoutes = require('./routes/creator');
const studentRoutes = require('./routes/student');
const gameroomRoutes = require('./routes/gameroom');
// Not for Production
// const aiRoutes = require('./routes/ai');

// Controllers
const notFoundController = require('./controllers/404');

// Sequelize ORM for PostgreSQL
const sequelize = require('./data/database');

// Models (Tables in Database)
const Teacher = require('./models/teacher');
const Classroom = require('./models/classroom');
const ClassroomStats = require('./models/classroomStats');
const Creator = require('./models/creator');
const Game = require('./models/game');
const Student = require('./models/student');
const Session = require('./models/session');
const Schedules = require('./models/gameSchedules');

// Session Storage on PostgreSQL Database with Sequelize ORM
var SequelizeStore = require('connect-session-sequelize')(session.Store);

///////////////////////////////////////////////////////////////////////////

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server); // Websockets Supported

app.set('socketio', io);
//////////////////////////////////////////////////////////////////////////

// Sessions

// Use the Session Model For Session Storage
var myStore = new SequelizeStore({
  db: sequelize,
  table: 'Session',
});

// Create a new session for each new visitor on the website.
app.use(
  session({
    secret: 'kleva user session',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1 * 1 * 60 * 60 * 1000, // 1 Hour
      httpOnly: false,
    },
    store: myStore,
    proxy: true,
  })
);

////////////////////////////////////////////////////////////////////////////

// Front End Framework
app.set('view engine', 'ejs'); // EJS
app.set('views', 'views'); // Views in the Views Folder

// //Serve bootstrap Statically
app.use(
  '',
  express.static(path.join(__dirname, '/node_modules/bootstrap/dist'))
);

// //Serve jquery Statically
app.use('', express.static(path.join(__dirname, '/node_modules/jquery/dist')));

// Serve CSS Statically
app.use(express.static(path.join(__dirname, 'public')));

///////////////////////////////////////////////////////////////////////////

// Useful Extra Tools

app.use(bodyParser.urlencoded({ extended: false })); // Read request bodies

//////////////////////////////////////////////////////////////////////////

// Routing

app.use(storeRoutes); // Mount the store routes on the app.
app.use(teacherRoutes); // Mount the teacher routes on the app.
app.use(authenticatedRoutes); // Mount the authenticated routes on the app.
app.use('/creator-dashboard', creatorRoutes);
app.use(studentRoutes);
app.use(gameroomRoutes);
// Not for Production
//app.use(aiRoutes);

////////////////////////////////////////////////////////////////////////////

// 404 Page for Invalid HTTP Paths
app.use(notFoundController.get404);

////////////////////////////////////////////////////////////////////////////

// Database Relations

// Each Game belongs to a Creator.
// Game.belongsTo(Creator, {
//   constraints: true,
//   onDelete: 'CASCADE',
// });

// Each Creator has many Games.
// Creator.hasMany(Game);

// Each Classroom belongs to a Teacher.
Classroom.belongsTo(Teacher, {
  constraints: true,
  onDelete: 'CASCADE',
});

// Each Teacher has many Classrooms.
Teacher.hasMany(Classroom);

// Each Student belongs to a Classroom.
Student.belongsTo(Classroom, {
  constraints: true,
  onDelete: 'CASCADE',
});

// Each Classroom has many Students.
Classroom.hasMany(Student);

// Each Classroom has many Classroom Statistics.
Classroom.hasMany(ClassroomStats, { foreignKey: 'classroomClassCode' });

// Each Game has many Classroom Statistics.
Game.hasMany(ClassroomStats, { foreignKey: 'gameID' });

// Each ClassroomStats row belongs to a Classroom.
ClassroomStats.belongsTo(Classroom, {
  foreignKey: 'classroomClassCode',
  constraints: true,
  onDelete: 'CASCADE',
});

// Each ClassroomStats row belongs to a Game.
ClassroomStats.belongsTo(Game, {
  foreignKey: 'gameID',
  constraints: true,
  onDelete: 'CASCADE',
});

// Each Schedule row belongs to a Classroom.
Schedules.belongsTo(Classroom, {
  foreignKey: 'classroomClassCode',
  constraints: true,
  onDelete: 'CASCADE',
});

////////////////////////////////////////////////////////////////////////////

// Synchronise the tables before listening.
sequelize
  .sync({ force: false })
  .then((result) => {
    server.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });
