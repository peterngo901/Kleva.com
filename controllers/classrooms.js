// Models
const Classroom = require('../models/classroom');
const ClassroomStats = require('../models/classroomStats');
const Games = require('../models/game');
const Schedules = require('../models/gameSchedules');
const Teacher = require('../models/teacher');

// Dependencies
require('dotenv').config();
const { Op } = require('sequelize');
var admin = require('firebase-admin');
var serviceAccount = require('../firebase/kleva-7918e-firebase-adminsdk-14tp5-703b1cef16.json');
const realTime = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://kleva-7918e.firebaseio.com',
});
const generate = require('nanoid-generate');

// Return the teacher, their classrooms and school.
exports.getTeacherDashboard = async (req, res, next) => {
  // Check the session store for the session id.
  if (req.session.user) {
    req.session.classRoom = 'none';
    const email = req.session.user;
    const school = req.session.school;
    // Search the Classroom Table with matching teacherID.
    await Classroom.findAll({
      where: {
        teacherID: email,
      },
      attributes: ['classCode', 'yearLevel', 'title', 'subject'],
    })
      .then((classrooms) => {
        // Return the teacher using the primary key email.
        Teacher.findOne({ where: { email: email } })
          .then((teacher) => {
            // Return all other teachers belonging to the same school.
            Teacher.findAll({
              where: { school: school, email: { [Op.not]: email } },
            }).then((otherTeachers) => {
              req.session.classrooms1 = classrooms;
              req.session.userName = teacher.firstName; //Set name in session
              res.render('teacher/teacher-dashboard', {
                path: '/teacher-dashboard',
                name: teacher.firstName,
                classrooms: classrooms,
                school: school,
                otherTeachers: otherTeachers,
              });
            });
          })
          .catch((err) => {
            res.status(500).redirect('/teacher-signin');
          });
      })
      .catch((err) => {
        res.status(500).redirect('/teacher-signin');
      });
  } else {
    // Session invalid or expired.
    res.status(401).redirect('/teacher-signin');
  }
};

//Replaced games in a classroom with games list from another school teacher
exports.postReplaceGames = (req, res, next) => {
  if (req.session.user) {
    const targetClass = req.body.classCode;
    const fromClass = req.body.thisClass;
    ClassroomStats.destroy({ where: { classroomClassCode: targetClass } }).then(
      () => {
        ClassroomStats.findAll({
          where: { classroomClassCode: fromClass },
          attributes: ['gameID'],
        }).then((games) => {
          const data = [];
          for (game of games) {
            data.push({ gameID: game.gameID, classroomClassCode: targetClass });
          }
          ClassroomStats.bulkCreate(data);
          res.redirect('/teacher-dashboard');
        });
      }
    );
  } else {
    // Session invalid or expired.
    res.status(401).redirect('/teacher-signin');
  }
};

// Create a new classroom with a unique 6 letter single-signon-code.
exports.postAddClassroom = (req, res, next) => {
  if (req.session.user) {
    const className = req.body.className;
    const yearLevel = req.body.yearLevel;
    const subject = req.body.subject;
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
        res.status(500).redirect('/teacher-dashboard');
      })
      .then(() => {
        res.status(200).redirect('/teacher-dashboard');
      });
  } else {
    // Session invalid or expired.
    res.status(401).redirect('/teacher-signin');
  }
};

//Returns the gametime statistics for the Statistics view
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
      // Track all classroom codes belonging to teacher.
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
        res.render('teacher/teacher-students', {
          path: '/teacher-students',
          classrooms: '',
          games: '',
        });
      }
    } catch (err) {
      // Server failure.
      res.status(500).redirect('/teacher-dashboard');
    }
  } else {
    // Session invalid or expired.
    res.status(401).redirect('/teacher-signin');
  }
};

//Returns the classroom with gameslist and schedule data
exports.getClassroom = (req, res, next) => {
  if (req.session.user) {
    const classCode = req.params.classroomCode;
    Classroom.findOne({ where: { classCode: classCode } }).then((classRoom) => {
      req.session.classRoom = classRoom;
      Schedules.findAll({
        where: { classCode: classCode },
      }).then((schedules) => {
        const scheduleGameData = new Set();
        for (schedule of schedules) {
          for (game of schedule.gameList) {
            scheduleGameData.add(game);
          }
        }
        const arrayGames = Array.from(scheduleGameData);
        Games.findAll({
          where: { gameID: arrayGames },
        }).then((gamesInSchedule) => {
          ClassroomStats.findAll({
            where: {
              classroomClassCode: classCode,
            },
            include: Games,
          })
            .catch((err) => {
              res.sendStatus(500);
            })
            .then((games) => {
              res.render('teacher/teacher-classroom', {
                classRoom: req.session.classRoom,
                games: games,
                schedules: schedules,
                name: req.session.userName,
                path: '/teacher-dashboard',
                gamesInSchedule: gamesInSchedule,
              });
            });
        });
      });
    });
  } else {
    // Session invalid or expired.
    res.status(401).redirect('/teacher-signin');
  }
};

//Deletes a classroom
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
    // Session invalid or expired.
    res.status(401).redirect('/teacher-signin');
  }
};

// Load the question bank from the database.
exports.postCreateQuestions = (req, res, next) => {
  const { topic } = req.body;
  const { classCode } = req.body;
  req.session.classCode = classCode;
  res.render('teacher/gameStaging', {
    questions: {},
    path: '/teacher-dashboard',
    name: ' ',
    classCode: classCode,
  });
};

const gamesPerPage = 6;

//Returns a game storepage for scheduling upcoming games lists
exports.getTeacherGameStorepage = (req, res, next) => {
  const page = req.query.page;
  if (req.session.user) {
    const classCode = req.session.classRoom.classCode;
    // Skip games based on page.
    var gameBatch = (page - 1) * gamesPerPage;

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
    // Session invalid or expired.
    res.status(401).redirect('/teacher-signin');
  }
};

// Return the recommended games for the given teacher.
exports.getTeacherRecommendationGames = async (req, res) => {
  const recommendationType = req.query.recommendation;
  const categoryRecommendation = req.query.category;
  var filteredCategoryRecommendation =
    categoryRecommendation.charAt(0).toUpperCase() +
    categoryRecommendation.slice(1);
  if (filteredCategoryRecommendation === 'Mathematics') {
    filteredCategoryRecommendation =
      filteredCategoryRecommendation.split('e')[0] + 's';
  }
  if (req.session.user) {
    try {
      // Retrieve all the recommended games based on category.
      if (recommendationType === 'all') {
        const allGames = await Games.findAll({
          raw: true,
          where: {
            category: filteredCategoryRecommendation,
          },
        });
        res.render('teacher/teacher-recommendation', {
          games: allGames,
          classRoom: req.session.classRoom.classCode,
          gameHierachy: '',
          name: '',
          path: '',
          subject: filteredCategoryRecommendation,
          recommendation: 'all',
        });
      } // Retrieve all the recommended games based on student popularity.
      else if (recommendationType === 'student') {
        const popularStudentGames = await Games.findAll({
          raw: true,
        });
        res.render('teacher/teacher-recommendation', {
          games: popularStudentGames,
          classRoom: req.session.classRoom.classCode,
          gameHierachy: '',
          name: '',
          path: '',
          subject: '',
          recommendation: 'students',
        });
      } // Retrieve all the recommended games based on teacher recommendation.
      else if (recommendationType === 'teacher') {
        const teacherRecommendedGames = await Schedules.findAll({
          attributes: ['gameList'],
          raw: true,
        });

        var gameListHolder = [];
        // Push every teacher's game in their list into an array.
        for (var ipl = 0; ipl < teacherRecommendedGames.length; ipl++) {
          gameListHolder = gameListHolder.concat(
            teacherRecommendedGames[ipl].gameList
          );
        }
        // Count the popularity of each game among teachers based on their addition to classrooms.
        var occurrences = {};
        for (var ijl = 0; ijl < gameListHolder.length; ijl++) {
          occurrences[gameListHolder[ijl]] =
            (occurrences[gameListHolder[ijl]] || 0) + 1;
        }

        // Return all the unique games that have been added by teachers.
        var gamesAddedByTeachers = Object.keys(occurrences);
        try {
          const uniqueTeacherGames = await Games.findAll({
            raw: true,
            where: {
              gameID: {
                [Op.like]: { [Op.any]: gamesAddedByTeachers },
              },
              category: filteredCategoryRecommendation,
            },
          });
          res.render('teacher/teacher-recommendation', {
            games: uniqueTeacherGames,
            classRoom: req.session.classRoom.classCode,
            gameHierachy: occurrences,
            name: '',
            path: '',
            subject: filteredCategoryRecommendation,
            recommendation: 'teachers',
          });
        } catch (err) {
          // Database failure.
          res.status(500).redirect('/teacher-dashboard');
        }
      }
    } catch (err) {
      // Database failure.
      res.status(500).redirect('/teacher-dashboard');
    }
  } else {
    // Session invalid or expired.
    res.status(401).redirect('/teacher-signin');
  }
};

// Return the teacher's scheduled games.
exports.getTeacherGameStorepageSchedule = (req, res, next) => {
  const page = req.query.page;
  req.session.scheduleGames = req.session.scheduleGames || [];
  if (req.session.user) {
    const classCode = req.session.classRoom.classCode;
    // Skip games based on page.
    var gameBatch = (page - 1) * gamesPerPage;

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
    // Session invalid or expired.
    res.status(401).redirect('/teacher-signin');
  }
};

//Adds a game to a teachers classroom
exports.postAddGame = async (req, res, next) => {
  const gameID = req.body.gameID;
  const classCode = req.body.classCode;
  const time = new Date().getTime();

  try {
    const addedGameToClassroom = await ClassroomStats.create({
      AverageStudentActivity: 0,
      gameID: gameID,
      createdAt: time,
      updatedAt: time,
      classroomClassCode: classCode,
    });
    res.sendStatus(200);
  } catch (err) {
    res
      .status(500)
      .send({ message: 'Sorry but the game has already been added!' });
  }
};

// Post the game to the teacher's in memory cart.
exports.postAddGameSchedule = (req, res, next) => {
  const gameID = req.body.gameID;
  var cart = req.session.scheduleGames || [];
  if (!cart.includes(gameID)) {
    cart.push(req.body.gameID);
  }
  res.redirect('/');
};

//Posts a game schedule for a classroom
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

//Returns the classroom information of teacher selected from the school
exports.getOtherTeacherInfo = (req, res, next) => {
  if (req.session.user) {
    const otherTeacher = req.params.otherTeacherID;
    const teacherName = req.params.teacherName;

    //Get the teachers classrooms
    Classroom.findOne({
      where: { teacherID: otherTeacher },
    })
      .then((classroom) => {
        ClassroomStats.findAll({
          where: { classroomClassCode: classroom.classCode },
          include: Games,
        })
          .then((games) => {
            res.render('teacher/otherTeachers', {
              pageTitle: 'otherTeacher',
              name: req.session.userName,
              classRoom: req.session.classRoom,
              otherTeacher: otherTeacher,
              teacherName: teacherName,
              classrooms1: req.session.classrooms1,
              path: '/otherTeachers',
              classroom: classroom,
              games: games,
            });
          })
          .catch((err) => {
            res.redirect('/teacher-dashboard');
          });
      })
      .catch((err) => {
        res.redirect('/teacher-dashboard');
      });
  } else {
    res.redirect('/teacher-signin');
  }
};

//Posts games array helper method
exports.postGamesWithArray = (req, res, next) => {
  res.redirect('/');
};

//Returns a users profile
exports.getUserProfile = (req, res, next) => {
  res.render('/user-profile', {
    pageTitle: 'Profile',
    path: '/user-profile',
  });
};

//Gets a teachers schedule selection page
exports.getTeacherSchedule = (req, res, next) => {
  if (req.session.scheduleGames) {
    const scheduleGames = req.session.scheduleGames;
    const classCode = req.params.classroomCode;
    Games.findAll({ where: { gameID: scheduleGames } })
      .catch((err) => {
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

// Return the doodle history for a given teacher and their classrooms.
exports.getDrawingHistory = async (req, res, next) => {
  if (req.session.user) {
    try {
      // Return all the classroom codes with doodles.
      var db = realTime.database();
      var classroomHierachy = db.ref();
      classroomHierachy.on(
        'value',
        async (snapshot) => {
          var doodles = snapshot.val();
          var classroomsWithDoodles = Object.keys(doodles);

          try {
            // Return all the classroom codes belonging to the teacher.
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

              res.render('teacher/drawing-history', {
                path: '/drawing-history',
                classrooms: classroomCodes,
                classroomDoodles: classroomDoodleHistory,
              });
            }
          } catch (err) {
            res.status(500).redirect('/teacher-dashboard');
          }
        },
        (err) => {
          res.status(500).redirect('/teacher-dashboard');
        }
      );
    } catch (err) {
      res.status(500).redirect('/teacher-dashboard');
    }
  } else {
    // Session invalid or expired.
    res.status(401).redirect('/teacher-signin');
  }
};
