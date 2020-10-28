// Dependencies
const Chance = require('chance');

// Models
const QuestionBank = require('../models/questionBank');

const users = [];
var gameRoomIdentifiers = [];

// Return the student gameroom and appropriate websocket game actions.
exports.getGameroom = async (req, res, next) => {
  if (req.session.user && req.session.sessionType === 'student') {
    let socket_id = [];
    const io = req.app.get('socketio');

    // On every connection the gameroom.
    io.on('connection', (socket) => {
      socket_id.push(socket.id);

      // Removes any socket id duplications when client refreshes.
      if (socket_id[0] === socket.id) {
        io.removeAllListeners('connection');
      }
      // Add the user.
      const student = addUser({
        id: socket.id,
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        room: req.session.classCode,
      });

      // Check the number of students in the game room.
      var room = io.sockets.adapter.rooms[`${req.session.classCode}`];

      // Student will join the waiting room with unique name = classCode.
      socket.join(`${req.session.classCode}`);

      // Return all the student details in the specified gameroom.
      const studentUsersInTheRoom = getUsersInRoom(`${req.session.classCode}`);

      // Emit the gameroom identifier and students in the given gamerooms to the students.
      io.to(`${req.session.classCode}`).emit('anonStudents', {
        room: student.room,
        students: studentUsersInTheRoom,
      });

      // Emit the gameroom identifier and students in the given gamerooms to the teacher.
      socket.broadcast
        .to(`${req.session.classCode}`)
        .emit('anonTeacherRoomStudents', {
          room: student.room,
          students: studentUsersInTheRoom,
        });

      // Broadcast to every student in the same room, another student has joined.
      socket.broadcast
        .to(`${req.session.classCode}`)
        .emit('message', 'A new student has joined the room!');

      // Listen for incoming doodle data emitted from the all connected students.
      socket.on('mouse', (data) => {
        // Share the drawing data with every student in the room.
        socket.broadcast.to(`${req.session.classCode}`).emit('mousedata', data);
      });

      // Teacher has begun the game.
      socket.on('beginQuestions', () => {
        socket.broadcast.to(`${req.session.classCode}`).emit('displayQOne');
      });

      // Once the student disconnects from the game room.
      socket.on('disconnect', async () => {
        // remove the student based upon their unique auto assigned socket id.
        removeUser(socket.id);
        // remove student's socket uid.
        var removeSocketID = await socket_id.indexOf(socket.id);
        await socket_id.splice(removeSocketID, 1);
        // update the students remaining in the room.
        io.emit('leaver', {
          room: student.room,
          students: users,
        });
        // update the teacher with the remaining students in the room.
        io.emit('teacherLeaver', {
          room: student.room,
          students: users,
        });
      });
    });
    res.render('gameroom', {
      pageTitle: 'Kleva',
      path: '/game-room',
      name: 'Student',
    });
  } else {
    // Websocket instances failure.
    res.status(500).redirect('/quick-join');
  }
};

// Return the teacher master gameroom and appropriate websocket game actions.
exports.getTeacherGameroom = (req, res, next) => {
  let teacher_socket_id = [];
  const io = req.app.get('socketio');

  // on every teacher connection to the game room.
  io.on('connection', (socket) => {
    teacher_socket_id.push(socket.id);
    // Removes any socket id duplications when client refreshes.
    if (teacher_socket_id[0] === socket.id) {
      // remove the connection listener for any subsequent
      // connections with the same ID to prevent duplication.
      io.removeAllListeners('connection');
    }

    // on every teacher disconnection from the game room.
    socket.on('disconnect', () => {
      // remove the uid socket.
      var removeTeacherSocketID = teacher_socket_id.indexOf(socket.id);
      teacher_socket_id.splice(removeTeacherSocketID, 1);
    });

    // Teacher will join the gameroom with their classroom's unique SSO (single-signon).
    socket.join(`${req.session.classCode}`);

    // Teacher has begun the game via the Begin Game Button.
    socket.on('beginGame', async () => {
      try {
        // Retrieve the newest questions created by teacher.
        const questions = await QuestionBank.findAll({
          raw: true,
          limit: 1,
          where: {
            classCode: req.session.classCode,
          },
          order: [['createdAt', 'DESC']],
        });
        const questionOne = questions[0].questions[0];
        const questionTwo = questions[0].questions[1];
        const doodleGameRoomName = `${req.session.classCode}`;
        const uniqueGameRoomID = 1;
        var realUsers = [];
        var uniquePenColorTracker = [];
        // Retrieve all students currently in the gameroom.
        const usersInTheRoom = getUsersInRoom(`${req.session.classCode}`);
        // Assign every student a unique pen-color and retrieve their real name.
        usersInTheRoom.forEach((stud) => {
          realUsers.push(stud.realName);
          uniquePenColorTracker.push(stud.id);
        });
        // Emit to the student gameroom the doodle questions and the anonymouse animal display names,
        // e.g. Kleva Dolphin.
        socket.broadcast.to(`${req.session.classCode}`).emit('begin', {
          questionOne,
          questionTwo,
          doodleGameRoomName,
          uniqueGameRoomID,
          realUsers,
          uniquePenColorTracker,
        });
        // Emit to the teacher's gameroom client the doodle questions and the student's real names,
        // and pen colors.
        io.to(`${req.session.classCode}`).emit('teacherMasterView', {
          questionOne,
          questionTwo,
          doodleGameRoomName,
          uniqueGameRoomID,
          realUsers,
          uniquePenColorTracker,
        });
      } catch (err) {
        // Websocket instances failure.
        res.status(500).redirect('/game-staging-area');
      }
    });

    // Notify all students that a teacher has joined their gameroom.
    socket.broadcast
      .to(`${req.session.classCode}`)
      .emit('message', 'A teacher has joined the room!');

    socket.on('join');
  });
  res.render('teacher-gameroom', {
    pageTitle: 'Kleva',
    path: '/teacher-gameroom',
    name: '',
    classCode: req.session.classCode,
  });
};

var gameroomQs;
exports.postTeacherGameroom = async (req, res, next) => {
  gameroomQs = [];
  console.log(req.body.doodleOne);
  console.log(req.body.doodleTwo);
  console.log(req.body.doodleOnePreprend);
  console.log(req.body.doodleTwoPreprend);

  const email = req.session.user;
  const classCode = req.session.classCode;
  // Preprocess all teacher created questions.
  const {
    doodleOne,
    doodleTwo,
    doodleOnePreprend,
    doodleTwoPreprend,
  } = req.body;
  var gameroomQOne = 'Doodle ' + doodleOnePreprend + ' ' + doodleOne;
  var gameroomQTwo = 'Doodle ' + doodleTwoPreprend + ' ' + doodleTwo;
  gameroomQs.push(gameroomQOne, gameroomQTwo);

  try {
    // Store the questions in the question bank.
    await QuestionBank.create({
      teacherEmail: email,
      classCode: classCode,
      questions: gameroomQs,
    });
    res.status(200).redirect(`/teacher/game-room`);
  } catch {
    // Database/Server failure.
    res.status(500).redirect(`/teacher-dashboard`);
  }
};

exports.postGameQuestion = (req, res, next) => {
  // Broadcast drawing question to all students in the room.
  const io = req.app.get('socketio');

  io.on('connection', (socket) => {
    socket.on('sendQuestion', (message, callback) => {
      socket.broadcast.emit('Draw the structure of Hydrogen.');
      callback('Question was sent to students.');
    });
  });
};

// Add User to Tracking List
const addUser = ({ id, firstName, lastName, room }) => {
  // Clean the student's first and last name.
  firstName = firstName.trim().toLowerCase();
  lastName = lastName.trim().toLowerCase();
  const realName = firstName + ' ' + lastName;
  // Assign an random animal name to render in student view. Teacher will see real student names.
  const chance = new Chance();
  const anonName = chance.animal();
  const displayName = 'Kleva ' + anonName;
  // Assign the uniqueGameRoomID based on given room capacity.
  var numberOfMatchingStudents = 1;
  users.forEach((studentUser) => {
    if (studentUser.room === room) {
      numberOfMatchingStudents += 1;
    }
  });
  // 6 Students Per Room
  const uniqueGameRoomID = Math.ceil(numberOfMatchingStudents / 6);
  // Define all the student properties.
  const user = { id, realName, displayName, penColor, room, uniqueGameRoomID };
  // Store the student.
  users.push(user);
  return users;
};

// Remove Student from the List
const removeUser = (id) => {
  const indexOfStudent = users.findIndex(
    (studentTracking) => studentTracking.id === id
  );

  if (indexOfStudent !== -1) {
    return users.splice(indexOfStudent, 1)[0];
  }
};

// Return all the Users in the Gameroom.
const getUsersInRoom = (room) => {
  return users.filter((user) => {
    return user.room === room;
  });
};
