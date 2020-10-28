// Production Environment, let the server decide the path.
const socket = io({
  transports: ['websocket'],
});

// on reconnection, reset the transports option, as the Websocket
// connection may have failed (caused by proxy, firewall, browser, ...)
socket.on('reconnect_attempt', () => {
  socket.io.opts.transports = ['polling', 'websocket'];
});

// Dev Environment
// const socket = io();

// Firebase
var firebaseConfig = {
  apiKey: 'AIzaSyACUQI6Ub4BTlHavE9cbEhOyGTad3H01nY',
  authDomain: 'kleva-7918e.firebaseapp.com',
  databaseURL: 'https://kleva-7918e.firebaseio.com',
  projectId: 'kleva-7918e',
  storageBucket: 'kleva-7918e.appspot.com',
  messagingSenderId: '709329434947',
  appId: '1:709329434947:web:44166481f1beac6ef417f6',
  measurementId: 'G-JN9T1Z8MNF',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

// Moment.JS
var now = moment();
var timeFormatted = now.format('ddd MMM Do YYYY');

// Elements
const $submitAnswer = document.querySelector('#submitAnswer');

// Gameroom Variables
var uniquePenColors = ['#FF0000', '#D500FF', '#FFFF00', '#1B1B0A', '#5EFFBA'];
var timeleft = 10;
var roomName;
var teacherDoodleQuestion;
var gameRoomID;
var realStudentNames;
var uniqueStroke;
var assignedPenColor = '#000000';
var studentAnons;
var cnv;
var px;
var pey;
var penTracker = true;
var strokeColor;
var strokeWeightNumber;

// Stream the Drawing Data to the Realtime Database in Chunks.
var drawingStream = [];
var currentPath = [];
var memoryDrawingStream = [];

// Track the real student names.
function loadRealStudentNames(allStudents) {
  var realStudentNames = '';
  for (i = 0; i < allStudents.students.length; i++) {
    realStudentNames +=
      '<li class="side-nav__item"><a href="/teacher-students" class="side-nav__link"><svg class="side-nav__icon"><use xlink:href="../img/symbol-defs.svg#icon-user-check"></use></svg><span class="sideBarCustom">' +
      allStudents.students[i].realName +
      '</span></a></li>';
  }
  return realStudentNames;
}

// Track anonymous student names.
function loadAnonStudentNames(allStudents) {
  var studentNames = '';
  for (i = 0; i < allStudents.students.length; i++) {
    studentNames +=
      '<li class="side-nav__item"><a href="/teacher-students" class="side-nav__link"><svg class="side-nav__icon"><use xlink:href="../img/symbol-defs.svg#icon-user-check"></use></svg><span class="sideBarCustom">' +
      allStudents.students[i].displayName +
      '</span></a></li>';
  }
  document.getElementById('studentAnonOutput').innerHTML = '';
  return studentNames;
}

socket.on('leaver', (studentAnonNames) => {
  studentAnons = [];
  studentAnons = loadAnonStudentNames(studentAnonNames);
  document.getElementById('studentAnonOutput').innerHTML = studentAnons;
});

socket.on('anonStudents', (studentAnonNames) => {
  studentAnons = [];
  studentAnons = loadAnonStudentNames(studentAnonNames);
  document.getElementById('studentAnonOutput').innerHTML = studentAnons;
});

socket.on('begin', async (data) => {
  // Dynamically assign students a unique pen color based on their socket id.
  var penTrackingColor = data.uniquePenColorTracker;
  uniqueStroke = penTrackingColor.indexOf(socket.id);

  if (uniqueStroke != -1) {
    assignedPenColor = uniquePenColors[penTrackingColor.indexOf(socket.id)];
  }

  realStudentNames = data.realUsers;
  gameRoomID = data.uniqueGameRoomID;
  roomName = data.doodleGameRoomName;
  var timer = await setInterval(function () {
    if (timeleft <= 0) {
      clearInterval(timer);
      // Reset the canvas
      clear();
      setup();
      drawingStream = [];
      memoryDrawingStream = [];
      $('#gameCountdownTimerText').animate({ opacity: 0 }, 400, function () {
        var doodleQuestionOne = data.questionOne;
        $(this).text(`${doodleQuestionOne}`).animate({ opacity: 1 }, 400);
      });
      document.getElementById('gameCountdownTimer').value = 0;
      var questionOneTimeLeft = 30;
      var qOneTimer = setInterval(function () {
        if (questionOneTimeLeft < 0) {
          teacherDoodleQuestion = data.questionOne;
          // Stream the doodle data to the database.
          saveDoodle();
          drawingStream = [];
          memoryDrawingStream = [];
          document.getElementById('gameCountdownTimer').value = 0;
          clear();
          setup();
          clearInterval(qOneTimer);

          $('#gameCountdownTimerText').animate(
            { opacity: 0 },
            400,
            function () {
              var doodleQuestionTwo = data.questionTwo;
              $(this).text(`${doodleQuestionTwo}`).animate({ opacity: 1 }, 400);
            }
          );
          var questionTwoTimeLeft = 30;
          var qTwoTimer = setInterval(function () {
            if (questionTwoTimeLeft < 0) {
              teacherDoodleQuestion = data.questionTwo;

              saveDoodle();
              drawingStream = [];
              memoryDrawingStream = [];
              document.getElementById('gameCountdownTimer').value = 100;
              clearInterval(qTwoTimer);
              document.getElementById('gameCountdownTimerText').innerHTML =
                'Game Finished!';

              return (window.location.href = '/student-dashboard');
            } else {
              document.getElementById('gameCountdownTimer').value =
                10 - questionTwoTimeLeft / 3;
              questionTwoTimeLeft -= 1;
            }
          }, 1000);
        } else {
          document.getElementById('gameCountdownTimer').value =
            10 - questionOneTimeLeft / 3;
          questionOneTimeLeft -= 1;
        }
      }, 1000);
    } else {
      $('#gameCountdownTimerText').animate({ opacity: 0 }, 400, function () {
        var timeLeftToQuestion = 'Game Beginning in ....' + timeleft;
        $(this).text(`${timeLeftToQuestion}`).animate({ opacity: 1 }, 400);
      });
      document.getElementById('gameCountdownTimer').value = 10 - timeleft;
      timeleft -= 1;
    }
  }, 1000);
});

// Setup the canvas and emit the student's doodle data.
function setup() {
  px = $('#canvas-holder').parent().width() * 0.95;
  cnv = createCanvas(px, windowHeight * 0.55);
  // Optimise the streaming of the drawing data.
  cnv.mousePressed(startPath);
  cnv.mouseReleased(endPath);
  background(237, 250, 249);
  cnv.parent('canvas-holder');
  socket.on('mousedata', newDrawing);
}

// Draw the data received from the other students in the room.
function newDrawing(data) {
  startPath;
  px = $('#canvas-holder').parent().width() * 0.95;
  pey = windowHeight * 0.55;
  var relativeX = data.x * (px / data.resX);
  var relativeXX = data.x2 * (px / data.resX);
  var relativeY = data.y * (pey / data.resY);
  var relativeYY = data.y2 * (pey / data.resY);
  var s0 = data.strokeColor;
  var weight = data.strokeWeight;
  strokeWeight(parseInt(weight));
  stroke(s0);
  line(relativeX, relativeY, relativeXX, relativeYY);
  currentPath.push(data);
  memoryDrawingStream.push(data);
  endPath;
}

// Resize the canvas when the window resizes.
// Redraw the current game session drawing.
function windowResized() {
  px = $('#canvas-holder').parent().width() * 0.95;
  resizeCanvas(px, windowHeight * 0.45);
  background(237, 250, 249);
  redrawAfterResizing(memoryDrawingStream);
}

// User has selected an eraser.
function chooseEraser() {
  penTracker = false;
}

// User has selected a pen.
function choosePen() {
  noErase();
  penTracker = true;
}

// Draw on the canvas.
function draw() {
  if (penTracker) {
    strokeColor = assignedPenColor;
    stroke(strokeColor);
    strokeWeightNumber = 1;
    strokeWeight(strokeWeightNumber);
    if (mouseIsPressed) {
      px = $('#canvas-holder').parent().width() * 0.95;
      pey = windowHeight * 0.55;

      var data = {
        x: mouseX,
        y: mouseY,
        x2: pmouseX,
        y2: pmouseY,
        resX: px,
        resY: pey,
        strokeWeight: strokeWeightNumber,
        strokeColor: strokeColor,
      };
      // Stream the data to the realtime database in chunks
      currentPath.push(data);
      // Stream the data to the in memory array for redrawing
      // on disconnects, refresh and canvas resizing.
      memoryDrawingStream.push(data);
      line(mouseX, mouseY, pmouseX, pmouseY);
      socket.emit('mouse', data);
    }
  } else if (penTracker === false) {
    strokeColor = '#EDFAF9';
    stroke(strokeColor);
    strokeWeightNumber = 10;
    strokeWeight(strokeWeightNumber);
    if (mouseIsPressed) {
      px = $('#canvas-holder').parent().width() * 0.95;
      pey = windowHeight * 0.55;

      var data = {
        x: mouseX,
        y: mouseY,
        x2: pmouseX,
        y2: pmouseY,
        resX: px,
        resY: pey,
        strokeWeight: strokeWeightNumber,
        strokeColor: strokeColor,
      };
      currentPath.push(data);
      memoryDrawingStream.push(data);
      line(mouseX, mouseY, pmouseX, pmouseY);
      socket.emit('mouse', data);
    }
  } else {
    strokeWeight(1);
    stroke(assignedPenColor);
  }
}

// In memory storage to retrace sudden network dropouts or screen tabbing.
function redrawAfterResizing(memoryDrawingStream) {
  px = $('#canvas-holder').parent().width() * 0.95;
  pey = windowHeight * 0.55;
  for (var retracer = 0; retracer < memoryDrawingStream.length; retracer++) {
    var retraceData = memoryDrawingStream[retracer];
    var relativeX = retraceData.x * (px / retraceData.resX);
    var relativeXX = retraceData.x2 * (px / retraceData.resX);
    var relativeY = retraceData.y * (pey / retraceData.resY);
    var relativeYY = retraceData.y2 * (pey / retraceData.resY);
    var s0 = retraceData.strokeColor;
    var weight = retraceData.strokeWeight;
    strokeWeight(parseInt(weight));
    stroke(s0);
    line(relativeX, relativeY, relativeXX, relativeYY);
  }
}

// Start drawing on mouse press.
function startPath() {
  currentPath = [];
}

// End drawing path on mouse release.
function endPath() {
  // Once the mouse is released add the array of points to the drawing array.
  drawingStream.push(currentPath);
}

// Post Drawing Data Chunks to the Database for Rehydration
function saveDoodle() {
  // Push to the classroom code + gameSession Date + the gameroom code.
  var ref = database.ref(`${roomName}/${timeFormatted}`);

  // Add the real student names to the doodling data.
  var doodleData = {
    studentNames: realStudentNames,
    doodle: drawingStream,
    question: teacherDoodleQuestion,
    gameRoomID: gameRoomID,
  };
  ref.push(doodleData, (err) => {
    var errorTracker = err;
  });
}

// Resize the canvas on resizing the window.
$(window).on('resize', function (e) {
  px = $('#canvas-holder').parent().width() * 0.95;
  windowResized();
});
