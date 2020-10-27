const QuestionBank = require('../models/questionBank');
const Chance = require('chance');

const users = [];

exports.getGameroom = async (req, res, next) => {
  if (req.session.user && req.session.sessionType === 'student') {
    let socket_id = [];
    const io = req.app.get('socketio');

    io.on('connection', (socket) => {
      // Removes any socket id duplications when client refreshes.
      socket_id.push(socket.id);
      if (socket_id[0] === socket.id) {
        // remove the connection listener for any subsequent
        // connections with the same ID
        io.removeAllListeners('connection');
      }
      // Add the user to the global users variable.
      const student = addUser({
        id: socket.id,
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        room: req.session.classCode,
      });
      //console.log(student);
      // Student will join the waiting room with unique name = classCode.
      socket.join(`${req.session.classCode}`);
      // Render Students in the List.
      io.to(`${req.session.classCode}`).emit('anonStudents', {
        room: student.room,
        students: users,
      });
      io.to(`${req.session.classCode}`).emit('anonTeacherRoomStudents', {
        room: student.room,
        students: users,
      });
      // Check how many students are in the waiting room to assign breakout rooms.
      var room = io.sockets.adapter.rooms[`${req.session.classCode}`];
      console.log(room.length);
      // Broadcast to every student in the waiting room, another student has joined.
      socket.broadcast
        .to(`${req.session.classCode}`)
        .emit('message', 'A new student has joined the room!');
      console.log('Connected to the game-room');
      // Store the mouse drawing history for later review.
      var line_history = [];
      // Listen for the 'mouse' emit from the client.
      socket.on('mouse', (data) => {
        for (var i in data) {
          line_history.push(data[i]);
        }
        // Share the drawing data with every student in the room.
        socket.broadcast.to(`${req.session.classCode}`).emit('mousedata', data);
      });
      // Timer has reached 0.
      socket.on('beginQuestions', () => {
        socket.broadcast.to(`${req.session.classCode}`).emit('displayQOne');
      });
      socket.on('disconnect', () => {
        removeUser(socket.id);
        io.emit('leaver', {
          room: student.room,
          students: users,
        });
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
    // TODO: Render student-signin with validation error.
    res.status(500).redirect('/quick-join');
  }
};

exports.getTeacherGameroom = (req, res, next) => {
  // Teacher will emit drawing game question to all students.
  let teacher_socket_id = [];
  const io = req.app.get('socketio');

  io.on('connection', (socket) => {
    // Removes any socket id duplications when client refreshes.
    teacher_socket_id.push(teacher_socket_id);
    if (teacher_socket_id[0] === teacher_socket_id) {
      // remove the connection listener for any subsequent
      // connections with the same ID
      io.removeAllListeners('connection');
    }

    // Teacher will join the waiting room with unique name = classCode.
    socket.join(`${req.session.classCode}`, () => {
      io.to(`${req.session.classCode}`).emit('studentsList', {
        students: users,
      });
    });

    // Teacher has begun the game via the Begin Game Button.
    socket.on('beginGame', async () => {
      try {
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
        // users.forEach((stud) => {
        //   realUsers.push(stud.realName);
        // })
        const usersInTheRoom = getUsersInRoom(`${req.session.classCode}`);
        usersInTheRoom.forEach((stud) => {
          realUsers.push(stud.realName);
          uniquePenColorTracker.push(stud.id);
        });
        console.log(usersInTheRoom);
        console.log(uniquePenColorTracker);
        console.log(realUsers);
        socket.broadcast.to(`${req.session.classCode}`).emit('begin', {
          questionOne,
          questionTwo,
          doodleGameRoomName,
          uniqueGameRoomID,
          realUsers,
          uniquePenColorTracker,
        });
        io.to(`${req.session.classCode}`).emit('teacherMasterView', {
          questionOne,
          questionTwo,
          doodleGameRoomName,
          uniqueGameRoomID,
          realUsers,
          uniquePenColorTracker,
        });
      } catch (err) {
        res.redirect('/game-staging-area');
      }
    });

    // // Render Students in the List.
    // io.to(`${req.session.classCode}`).emit('studentsList', {
    //   students: users,
    // });
    // Broadcast to everyone in the waiting room, another student has joined.
    socket.broadcast
      .to(`${req.session.classCode}`)
      .emit('message', 'A teacher has joined the room!');

    socket.on('join', () => {});
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
  // TODO: Add Questions to the Question Bank.
  const {
    doodleOne,
    doodleTwo,
    doodleOnePreprend,
    doodleTwoPreprend,
  } = req.body;
  var gameroomQOne = 'Doodle ' + doodleOnePreprend + ' ' + doodleOne;
  var gameroomQTwo = 'Doodle ' + doodleTwoPreprend + ' ' + doodleTwo;
  gameroomQs.push(gameroomQOne, gameroomQTwo);
  console.log(gameroomQs);

  try {
    await QuestionBank.create({
      teacherEmail: email,
      classCode: classCode,
      questions: gameroomQs,
    });
    res.redirect(`/teacher/game-room`);
  } catch {
    res.redirect(`/teacher-dashboard`);
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

// AI Doodle Prediction - Feed Doodle to the Classifier on GCP.
// Return the Probability - If it passes 80% threshold, assign a tick.
// Classification labels scraped from ACARA scotTerm SparQL Endpoint.
// Students create training images by doodling.
// Teachers label the images by assigning yes or no classification.

// Add User to Tracking List
const addUser = ({ id, firstName, lastName, room }) => {
  // id parameter: unique id provided by socket.io
  // Clean the first and last name.
  firstName = firstName.trim().toLowerCase();
  lastName = lastName.trim().toLowerCase();
  const realName = firstName + ' ' + lastName;

  // Assign an random animal name to render in student view. Teacher will see real student names.
  const chance = new Chance();
  const anonName = chance.animal();
  const displayName = 'Kleva ' + anonName;

  // Assign the student one of three pen colors. (Color Blind sensitive colors.)
  const greenPen = 'rgb(26,255,26)';
  const purplePen = 'rgb(75,0,146)';
  const bluePen = 'rgb(0,90,181)';

  const penColor = greenPen;

  var numberOfMatchingStudents = 1;
  // Assign the uniqueGameRoomID
  // 1. Check all the users in a specific room.
  users.forEach((studentUser) => {
    if (studentUser.room === room) {
      numberOfMatchingStudents += 1;
    }
  });
  // 3 Students Per Room
  const uniqueGameRoomID = Math.ceil(numberOfMatchingStudents / 3);

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
