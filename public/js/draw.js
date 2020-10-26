const socket = io();
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

var now = moment();
var timeFormatted = now.format('ddd MMM Do YYYY');
// Elements
const $submitAnswer = document.querySelector('#submitAnswer');

// Track students coming and going.
function loadRealStudentNames(allStudents) {
  var realStudentNames = '';
  for (i = 0; i < allStudents.students.length; i++) {
    realStudentNames +=
      '<li class="side-nav__item"><a href="/teacher-students" class="side-nav__link"><svg class="side-nav__icon"><use xlink:href="../img/symbol-defs.svg#icon-user-check"></use></svg><span class="sideBarCustom">' +
      allStudents.students[i].realName +
      '</span></a></li>';
  }

  //console.log(allStudents.students[0]);
  return realStudentNames;
}

// Track students coming and going.
function loadAnonStudentNames(allStudents) {
  var studentNames = '';
  for (i = 0; i < allStudents.students.length; i++) {
    studentNames +=
      '<li class="side-nav__item"><a href="/teacher-students" class="side-nav__link"><svg class="side-nav__icon"><use xlink:href="../img/symbol-defs.svg#icon-user-check"></use></svg><span class="sideBarCustom">' +
      allStudents.students[i].displayName +
      '</span></a></li>';
  }

  //console.log(allStudents.students[0]);
  return studentNames;
}
// socket.on('name') parameter must match the socket.emit('name') in controllers.
socket.on('leaver', (studentAnonNames) => {
  const studentAnons = loadAnonStudentNames(studentAnonNames);
  document.getElementById('studentAnonOutput').innerHTML = studentAnons;
});

socket.on('anonStudents', (studentAnonNames) => {
  const studentAnons = loadAnonStudentNames(studentAnonNames);
  document.getElementById('studentAnonOutput').innerHTML = studentAnons;
});
var uniquePenColors = ['#FF0000', '#D500FF', '#FFFF00', '#1B1B0A', '#5EFFBA'];
var timeleft = 10;
var roomName;
var teacherDoodleQuestion;
var gameRoomID;
var realStudentNames;
var uniqueStroke;
var assignedPenColor = '#000000';
socket.on('begin', async (data) => {
  //console.log(socket.id);
  var penTrackingColor = data.uniquePenColorTracker;
  uniqueStroke = penTrackingColor.indexOf(socket.id);
  // const indexOfSocketID = penTrackingColor.findIndex(
  //   (studentSocketID) => studentSocketID.id === socket.id
  // );
  if(uniqueStroke != -1) {
    assignedPenColor = uniquePenColors[penTrackingColor.indexOf(socket.id)]
  }
  
  realStudentNames = data.realUsers
  gameRoomID = data.uniqueGameRoomID;
  roomName = data.doodleGameRoomName;
  var timer = await setInterval(function () {
    if (timeleft < 0) {
      clearInterval(timer);
      clear();
      setup();
      drawingStream = [];
      
      document.getElementById('gameCountdownTimerText').innerHTML =
        data.questionOne;
      document.getElementById('gameCountdownTimer').value = 0;
      var questionOneTimeLeft = 30;
      var qOneTimer = setInterval(function () {
        if (questionOneTimeLeft < 0) {
          teacherDoodleQuestion = data.questionOne;
          // Stream to realtime database.
          
          saveDoodle();
          drawingStream = [];
          document.getElementById('gameCountdownTimer').value = 0;
          clear();
          setup();
          clearInterval(qOneTimer);
          
          document.getElementById('gameCountdownTimerText').innerHTML =
            data.questionTwo;
          var questionTwoTimeLeft = 30;
          var qTwoTimer = setInterval(function () {
            if (questionTwoTimeLeft < 0) {
              teacherDoodleQuestion = data.questionTwo;
              
              saveDoodle();
              drawingStream = [];
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
      document.getElementById('gameCountdownTimerText').innerHTML =
        'Game Beginning in ....' + timeleft;
      document.getElementById('gameCountdownTimer').value = 10 - timeleft;
      timeleft -= 1;
    }
  }, 1000);
});

var cnv;

function setup() {
  
  var px = $('#canvas-holder').parent().width();

  cnv = createCanvas(px, windowHeight * 0.55);

  // Optimise the streaming of the drawing data.
  cnv.mousePressed(startPath);
  cnv.mouseReleased(endPath);

  background(237, 250, 249);
  cnv.parent('canvas-holder');
  io.connect('http://localhost:3000/game-room');
  socket.on('mousedata', newDrawing);
}

function newDrawing(data) {
  startPath;
  var px = $('#canvas-holder').parent().width();
  var pey = windowHeight * 0.55;
  var relativeX = data.x * (px / data.resX);
  var relativeXX = data.x2 * (px / data.resX);
  var relativeY = data.y * (pey / data.resY);
  var relativeYY = data.y2 * (pey / data.resY);
  //var s0 = data.strokeColor[0];
  //var s1 = data.strokeColor[1];
  //var s2 = data.strokeColor[2];
  var s0 = data.strokeColor;
  var weight = data.strokeWeight;
  //noStroke();
  
  strokeWeight(parseInt(weight));
  //stroke(parseInt(s0), parseInt(s1), parseInt(s2));
  stroke(s0);
  line(relativeX, relativeY, relativeXX, relativeYY);
  //ellipse(data.x, data.y, 15, 15);
  currentPath.push(data);
  endPath;
}

function windowResized() {
  var px = $('#canvas-holder').parent().width();
  resizeCanvas(px, windowHeight * 0.55);
  background(237, 250, 249);
}

// function mouseIsPressed() {
//   const px = $('#canvas-holder').parent().width();
//   const pey = windowHeight * 0.55;
//   var data = {
//     x: mouseX,
//     y: mouseY,
//     x2: pmouseX,
//     y2: pmouseY,
//     resX: px,
//     resY: pey,
//     strokeWeight: strokeWeight,
//     strokeColor: strokeColor,
//   };

//   stroke(202, 110, 255);
//   line(mouseX, mouseY, pmouseX, pmouseY);
// }

var penTracker = true;

function chooseEraser() {
  //strokeWeight(10);
  penTracker = false;
}

function choosePen() {
  noErase();
  //strokeWeight(1);
  //stroke(assignedPenColor);
  penTracker = true;
}

var strokeColor;
var strokeWeightNumber;

function draw() {
  if (penTracker) {
    strokeColor = assignedPenColor;
    stroke(strokeColor);
    strokeWeightNumber = 1;
    strokeWeight(strokeWeightNumber);
    if (mouseIsPressed) {
      const px = $('#canvas-holder').parent().width();
      const pey = windowHeight * 0.55;

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
      // makes it more efficient.
      currentPath.push(data);

      line(mouseX, mouseY, pmouseX, pmouseY);
      socket.emit('mouse', data);
    }
  } else if (penTracker === false) {
    strokeColor = '#EDFAF9';
    stroke(strokeColor);
    strokeWeightNumber = 10;
    strokeWeight(strokeWeightNumber);
    if (mouseIsPressed) {
      const px = $('#canvas-holder').parent().width();
      const pey = windowHeight * 0.55;

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
      // makes it more efficient.
      currentPath.push(data);

      line(mouseX, mouseY, pmouseX, pmouseY);
      socket.emit('mouse', data);
    }
  } else {
    strokeWeight(1);
    stroke(assignedPenColor);
  }
}

// // Teacher submits the question to the classroom.
// document.querySelector('#send-question').addEventListener('click', () => {
//   socket.emit('sendQuestion', message, (msg) => {
//     console.log('The question will be delivered.', msg);
//   });
// });

// Stream the Drawing Data to the Realtime Database.
var drawingStream = [];
var currentPath = [];

// Start drawing on mouse press.
function startPath() {
  currentPath = [];
}

// End drawing on mouse release.
function endPath() {
  // Once the mouse is released add the array of points to the drawing array.
  drawingStream.push(currentPath);
}

// Post Drawing Data Chunks to the Database
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
