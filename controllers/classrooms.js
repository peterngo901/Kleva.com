const Classroom = require('../models/classroom');
const Curriculum = require('../models/curriculum');
const AcaraTerms = require('../models/acara');
const AcaraRelations = require('../models/acaraRelations');
const ClassroomStats = require('../models/classroomStats');
const Schedules = require('../models/gameSchedules');
const Games = require('../models/game');
const { v4: uuidv4 } = require('uuid');

const { Op } = require('sequelize');

const Teacher = require('../models/teacher');
const generate = require('nanoid-generate');
const dictionary = require('nanoid-dictionary');

const gamesPerPage = 3;

exports.getTeacherDashboard = async (req, res, next) => {
  if (req.session.user) {
    req.session.classRoom = 'none';
    const email = req.session.user;
    // Also Search the Classroom Table with matching teacherID.
    await Classroom.findAll({
      where: {
        teacherID: email,
      },
      attributes: ['classCode', 'yearLevel', 'title', 'subject'],
    })
      .then((classrooms) => {
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
  const classCode = generate.english(6);

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

exports.getTeacherStudents = async (req, res, next) => {
  if (req.session.user) {
    const email = req.session.user;
    try {
      const classrooms = await Classroom.findAll({
        where: {
          teacherID: email,
        },
        attributes: ['classCode', 'yearLevel', 'title', 'subject'],
      });

      // Return all the classroom classcodes.
      var classcodeTracker = [];
      for (let i = 0; i < classrooms.length; i++) {
        classcodeTracker.push(classrooms[i].classCode);
      }

      try {
        const gamesStatisticsAndDetails = await ClassroomStats.findAll({
          where: {
            classroomClassCode: { [Op.like]: { [Op.any]: classcodeTracker } },
          },
          include: [
            {
              model: Games,
            },
          ],
        });
        res.render('teacher/teacher-students', {
          path: '/teacher-students',
          classrooms: classrooms,
          games: gamesStatisticsAndDetails,
        });
      } catch (err) {
        console.log(err);
      }

      // try {
      //   var classroomGameDetailTracker = [];
      //   classrooms.forEach(async (classroom) => {
      //     // Return all the games and statistics for the given classCode.
      //     const gameDetails = await ClassroomStats.findAll({
      //       where: {
      //         classroomClassCode: classroom.classCode,
      //       },
      //       attributes: ['gameID', 'AverageStudentActivity'],
      //     });
      //     console.log(gameDetails);
      //     console.log(classroomGameDetailTracker);
      //     return classroomGameDetailTracker.concat(gameDetails.dataValues);
      //   });

      //   res.render('teacher/teacher-students', {
      //     path: '/teacher-students',
      //     classrooms: classrooms,
      //   });
      // } catch (err) {
      //   res.redirect('/teacher-dashboard');
      // }

      // try {
      //   // If more than one classroom is returned.

      //   classrooms.forEach((classroom) => {
      //     const classroomGames = ClassroomStats.findAll({
      //       where: {
      //         classroomClassCode: classroom.classCode,
      //       },
      //       attributes: ['gameID', 'AverageStudentActivity'],
      //     });
      //     classroomGames.map(() => classroom.classCode,dataValues);
      //   });
      //   try {
      //     // Do an full join to retrieve matching ACARA codes and game titles.
      //     classroomTracker.map(async (classroomGame) => {
      //       const classroomGameDetails = await Games.findAll({
      //         where: {
      //           gameID: classroomGame.gameID,
      //         },
      //         attributes: ['title', 'category'],
      //       });
      //       classroomGameDetailTracker.push(classroomGameDetails);
      //       console.log(classroomGameDetails);
      //     });
      //     const croomTracker = classroomTracker;
      //     const croomDetailTracker = classroomGameDetailTracker;
      //     res.render('teacher/teacher-students', {
      //       path: '/teacher-students',
      //       classrooms: classrooms,
      //       classroomTracker: cd,
      //       classroomDetails: croomDetailTracker,
      //     });
      //   } catch (err) {
      //     res.redirect('/teacher-dashboard');
      //   }
      // } catch (err) {
      //   res.redirect('/teacher-dashboard');
      // }
    } catch (err) {
      res.redirect('/');
    }
  } else {
    res.redirect('/');
  }
};

exports.getClassroom = (req, res, next) => {
  if (req.session.user) {
    const classCode = req.params.classroomCode;
    Classroom.findOne({ where: { classCode: classCode } }).then((classRoom) => {
      req.session.classRoom = classRoom;
      Schedules.findAll({
        where: { classCode: classCode },
      }).then((schedules) => {
        ClassroomStats.findAll({
          where: {
            classroomClassCode: classCode,
          },
          include: Games,
        })
          .catch((err) => {
            console.log(err);
            res.sendStatus(500);
          })
          .then((games) => {
            res.render('teacher/teacher-classroom', {
              classRoom: req.session.classRoom,
              games: games,
              schedules: schedules,
              name: req.session.userName,
              path: '/teacher-dashboard',
            });
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
  if (req.session.user) {
    const classCode = req.session.classRoom.classCode;
    // Skip games based on page.
    var gameBatch = (page - 1) * gamesPerPage;
    console.log('Classroomcode  = ' + classCode);
    Games.findAndCountAll({
      offset: gameBatch,
      limit: gamesPerPage,
    }).then((games) => {
      const totalGames = games.count;
      const gamesArray = games.rows;
      Classroom.findOne({ where: { classCode: classCode } }).then(
        (classRoom) => {
          res.render('teacher/teacher-game-storepage', {
            classRoom: classRoom,
            games: gamesArray,
            pageNumber: parseInt(page),
            pageButtons: Math.ceil(totalGames / gamesPerPage),
            name: req.session.userName,
            path: '/teacher-classroom',
          });
        }
      );
    });
  } else {
    res.redirect('/');
  }
};

exports.getTeacherGameStorepageSchedule = (req, res, next) => {
  const page = req.query.page;
  req.session.scheduleGames = req.session.scheduleGames || [];
  if (req.session.user) {
    const classCode = req.session.classRoom.classCode;
    // Skip games based on page.
    var gameBatch = (page - 1) * gamesPerPage;
    console.log(req.session);
    Games.findAndCountAll({
      offset: gameBatch,
      limit: gamesPerPage,
    }).then((games) => {
      const totalGames = games.count;
      const gamesArray = games.rows;
      Classroom.findOne({ where: { classCode: classCode } }).then(
        (classRoom) => {
          res.render('teacher/teacher-game-schedule', {
            classRoom: classRoom,
            games: gamesArray,
            pageNumber: parseInt(page),
            pageButtons: Math.ceil(totalGames / gamesPerPage),
            name: req.session.userName,
            path: '/teacher-schedule',
          });
        }
      );
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
    classroomClassCode: classCode,
  })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    })
    .then(() => {
      res.sendStatus(200);
    });
};

exports.postAddGameSchedule = (req, res, next) => {
  const gameID = req.body.gameID;
  var cart = req.session.scheduleGames || [];
  if (!cart.includes(gameID)) {
    cart.push(req.body.gameID);
  }
  console.log('cart contains: ' + req.session.scheduleGames);
  res.redirect('/');
};

exports.postGameScheduleUpload = (req, res, next) => {
  const code = req.session.classRoom.classCode;
  if (req.session.scheduleGames.length > 0) {
    //if games exist
    Schedules.create({
      classCode: code,
      gameList: req.session.scheduleGames,
      date: req.body.date,
    })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      })
      .then(() => {
        req.session.scheduleGames = [];
        res.redirect('/classRoom/' + code);
      });
  } else {
    res.redirect('/teacher-dashboard');
  }
};

exports.getUserProfile = (req, res, next) => {
  res.render('/user-profile', {
    //name of page
    pageTitle: 'Profile',
    path: '/user-profile',
  });
};

exports.getTeacherSchedule = (req, res, next) => {
  if (req.session.scheduleGames) {
    const scheduleGames = req.session.scheduleGames;
    const classCode = req.params.classroomCode;
    Games.findAll({ where: { gameID: scheduleGames } })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      })
      .then((games) => {
        res.render('teacher/teacher-schedule', {
          pageTitle: 'Schedule',
          name: req.session.userName,
          classRoom: req.session.classRoom,
          path: '/teacher-schedule',
          games: games,
          scheduleGames: scheduleGames,
        });
      });
  } else {
    res.render('teacher/teacher-schedule', {
      pageTitle: 'Schedule',
      name: req.session.userName,
      classRoom: req.session.classRoom,
      path: '/teacher-schedule',
      games: {},
      scheduleGames: [],
    });
  }
};

// env
require('dotenv').config();

var admin = require('firebase-admin');
var serviceAccount = require('../firebase/kleva-7918e-firebase-adminsdk-14tp5-703b1cef16.json');
const realTime = admin.initializeApp({
  // credentials: {
  //   project_id: process.env.FIREBASE_PROJECT_ID,
  //   private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  //   client_email: process.env.FIREBASE_CLIENT_EMAIL,
  //   private_key: process.env.FIREBASE_PRIVATE_KEY,
  //   client_id: process.env.FIREBASE_CLIENT_ID,
  //   auth_uri: process.env.FIREBASE_AUTH_URI,
  //   token_uri: process.env.FIREBASE_TOKEN_URI,
  //   auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  //   client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  // },
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://kleva-7918e.firebaseio.com',
});

exports.getDrawingHistory = async (req, res, next) => {
  try {
    // Return all the classroom codes from Realtime Database.
    var db = realTime.database();
    //var ref = db.ref(`${classroomCode}`);
    var classroomHierachy = db.ref();
    classroomHierachy.on(
      'value',
      async (snapshot) => {
        var doodles = snapshot.val();
        var classroomsWithDoodles = Object.keys(doodles);
        console.log(classroomsWithDoodles);
        try {
          // Return all the classroom codes belonging to the teacher and that contain doodles.
          const classroomCodes = await Classroom.findAll({
            where: {
              teacherID: req.session.user,
              classCode: {
                [Op.like]: { [Op.any]: classroomsWithDoodles },
              },
            },
            attributes: ['classCode', 'title'],
          });
          var classroomDoodleHistory = [];
          if (classroomCodes) {
            classroomCodes.forEach((crCode) => {
              var dateHierachy = db.ref(`${crCode.classCode}`);
              dateHierachy.on('value', async (snapshot) => {
                classroomDoodleHistory.push(
                  `${crCode.classCode}`,
                  snapshot.val()
                );
              });
            });
            console.log(classroomDoodleHistory);
            res.render('teacher/drawing-history', {
              path: '/drawing-history',
              classrooms: classroomCodes,
              classroomDoodles: classroomDoodleHistory,
            });
          }
        } catch (err) {
          res.redirect('/teacher-dashboard');
        }
      },
      (err) => {
        console.log(err);
      }
    );
  } catch (err) {
    console.log(err);
  }
};
