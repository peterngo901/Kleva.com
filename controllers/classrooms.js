const Classroom = require('../models/classroom');
const ClassroomStats = require('../models/classroomStats');
const Games = require('../models/game');
const { v4: uuidv4 } = require('uuid');

const Teacher = require('../models/teacher');
const generate = require('nanoid-generate');
const dictionary = require('nanoid-dictionary');

const gamesPerPage = 3;

exports.getTeacherDashboard = (req, res, next) => {
  if (req.session.user) {
    const email = req.session.user;
    // Also Search the Classroom Table with matching teacherID.
    Classroom.findAll({
      where: {
        teacherID: email,
      },
      attributes: ['classCode', 'yearLevel', 'title', 'subject'],
    })
      .then((classrooms) => {
        console.log(classrooms);
        Teacher.findOne({ where: { email: email } })
          .then((teacher) => {
            req.session.userName = teacher.firstName; //Set name in session
            res.render('teacher/teacher-dashboard', {
              path: '/teacher-dashboard',
              name: teacher.firstName,
              classrooms: classrooms,
            });
          })
          .catch((err) => res.redirect('/teacher-signin'));
      })
      .catch((err) => {
        res.redirect('/');
      });
  } else {
    res.redirect('/');
  }
};

exports.postAddClassroom = (req, res, next) => {
  const className = req.body.className;
  const yearLevel = req.body.yearLevel;
  const subject = req.body.subject;
  // Easy to Remember Single Classcode Signon for High Schoolers
  const classCode = generate.english(8);

  Classroom.create({
    teacherID: req.session.user,
    classCode: classCode,
    subject: subject,
    yearLevel: yearLevel,
    title: className,
    teacherEmail: req.session.user,
  })
    .catch((err) => {
      console.log(err);
      res.redirect('/');
    })
    .then(() => {
      res.redirect('/teacher-dashboard');
    });
};

exports.getTeacherStudents = (req, res, next) => {
  if (req.session.user) {
    const email = req.session.user;
    // First find the teacherID from the teacher email on the Teacher Table.
    // Return all students from the Student Table with the matching teacherID.
    res.render('teacher/teacher-students', {
      path: '/teacher-students',
    });
  } else {
    res.redirect('/');
  }
};

exports.getClassroom = (req, res, next) => {
  if (req.session.user) {
    const classCode = req.params.classroomCode;
    Classroom.findOne({ classCode: classCode }).then((classRoom) => {
      ClassroomStats.findAll({
      where: {
        classroomClassCode: classCode,
      },
      include: Games
      })
      .catch((err) => {
      console.log(err);
      res.sendStatus(500);
      })
      .then((games) => {
        res.render('teacher/teacher-classroom', {
          classRoom: classRoom,
          games: games,
          name: req.session.userName,
          path: '/teacher-dashboard',
        });
      });
    });
  } else {
    res.redirect('/');
  }
};

exports.postDeleteClassroom = (req, res, next) => {
  if (req.session.user) {
    const classCode = req.body.classCode;
    Classroom.destroy({
      where: {
        classCode: classCode,
      },
    }).then(() => {
      res.redirect('/teacher-dashboard');
    });
  } else {
    res.redirect('/');
  }
};

// Load the question bank from the database.
exports.postCreateQuestions = (req, res, next) => {
  const { topic } = req.body;
  const { classCode } = req.body;
  req.session.classCode = classCode;
  // TODO: Create a Question Bank Model and Table.
  res.render('teacher/gameStaging', {
    questions: {},
    path: '/teacher-dashboard',
    name: ' ',
    classCode: classCode,
  });
};

exports.getTeacherGameStorepage = (req, res, next) => {
  const page = req.query.page;
  console.log('PAGE  = '+page)
  if (req.session.user) {
    const classCode = req.params.classroomCode;
    // Skip games based on page.
    var gameBatch = (page - 1) * gamesPerPage;
    console.log('GameBATCH = '+gameBatch)
    Games.findAndCountAll({
        offset: gameBatch,
        limit: gamesPerPage,
    }).then((games) => {
      console.log('games.length = '+games.length)
      const totalGames = games.count;
      const gamesArray = games.rows;
      Classroom.findOne({ classCode: classCode }).then((classRoom) => {
        res.render('teacher/teacher-game-storepage', {
          classRoom: classRoom,
          games: gamesArray,
          pageNumber: page,
          pageButtons: Math.ceil(totalGames / gamesPerPage),
          name: req.session.userName,
          path: '/teacher-classroom',
        });
      });
    })
    Games.findAll().then((lames) => {
    console.log('Whats in lames = '+lames)
    });
  } else {
    res.redirect('/');
  }
};

exports.postAddGame = (req, res, next) => {
  const gameID = req.body.gameID;
  const classCode = req.body.classCode;
  const time = new Date().getTime();

  ClassroomStats.create({
    AverageStudentActivity: 0,
    gameID: gameID,
    createdAt: time,
    updatedAt: time,
    classroomClassCode: classCode
  })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    })
    .then(() => {
      res.sendStatus(200);;
    });
};


exports.getUserProfile = (req, res, next) => {
    res.render('/user-profile', { //name of page
    pageTitle: 'Profile',
    path: '/user-profile',
  });
};

