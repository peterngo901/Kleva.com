// Use Realtime Database? ()

exports.getGameroom = (req, res, next) => {
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

    //const roomCode = req.session.user; // Subscribe the socket to the classroom code name.
    //const fullName = req.session.name; // Retrieve the student's real name.
    // Assign the student an anonymous animal name.
    // Assign the student a pen color.
    //socket.join(roomCode); // Student is now in the correct room.
    socket.broadcast.emit('hello'); // Send question to all students in game room except for teacher.
    console.log('Connected to the game-room');
  });

  res.render('gameroom', {
    pageTitle: 'Kleva',
    path: '/game-room',
    name: 'Student',
  });
};

exports.getTeacherGameroom = (req, res, next) => {
  // Teacher will emit drawing game question to all students.
};

exports.postGameQuestion = (req, res, next) => {
  // Broadcast drawing question to all students in the room.
};
