// Models
const ClassroomStats = require('../models/classroomStats');
const Games = require('../models/game');

// Dependencies
const { Op } = require('sequelize');

// Return the student's dashboard.
exports.getStudentDashboard = async (req, res, next) => {
  const name = req.session.name;
  const classCode = req.session.classCode;
  if (req.session.user) {
    try {
      // Perform a left join of the game table with the classroom statistics table.
      // Return all the games belonging to the student.
      const classroomGames = await Games.findAll({
        include: [
          {
            model: ClassroomStats,
            where: { classroomClassCode: classCode },
            required: true,
          },
        ],
      });
      res.render('student/student-dashboard', {
        games: classroomGames,
        name: name,
        path: '/student-dashboard',
      });
    } catch (err) {
      // Database/System failure.
      res.status(500).redirect('/student-signin');
    }
  } else {
    // Session invalid or expired.
    res.status(401).redirect('/student-signin');
  }
};

// Add the student's engagement statistics to the database.
exports.postAddTime = async (req, res, next) => {
  const time = req.body.time;
  const gameID = req.body.gameID;
  const classCode = req.session.classCode;

  try {
    // Add the student's engagement time with the game to the database.
    await ClassroomStats.increment('AverageStudentActivity', {
      by: parseInt(time),
      where: { [Op.and]: { gameID: gameID, classroomClassCode: classCode } },
    });
    // Add the student's visit to the game to the database.
    await ClassroomStats.increment('studentVisits', {
      where: { gameID: gameID, classroomClassCode: classCode },
    });
  } catch (err) {
    // Datbase/System failure.
    res.status(500).redirect('/student-dashboard');
  }
};
