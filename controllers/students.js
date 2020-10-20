const Students = require('../models/student');
const ClassroomStats = require('../models/classroomStats');
const Games = require('../models/game');
const { Op } = require('sequelize');

exports.getStudentDashboard = async (req, res, next) => {
  const name = req.session.name;
  const classCode = req.session.classCode;
  try {
    // Left Join Games Table
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
    res.status(502).redirect('/student-signin');
  }
};

exports.postAddTime = async (req, res, next) => {
  const time = req.body.time;
  const gameID = req.body.gameID;
  const classCode = req.session.classCode;
  const firstName = req.session.firstName;
  const lastName = req.session.lastName;

  try {
    await ClassroomStats.increment('AverageStudentActivity', {
      by: parseInt(time),
      where: { [Op.and]: { gameID: gameID, classroomClassCode: classCode } },
    });
    await ClassroomStats.increment('studentVisits', {
      where: { gameID: gameID, classroomClassCode: classCode },
    });
  } catch (err) {
    res.redirect('/student-dashboard');
  }
};
