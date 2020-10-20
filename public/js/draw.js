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
// Elements
const $submitAnswer = document.querySelector('#submitAnswer');

// socket.on('name') parameter must match the socket.emit('name') in controllers.
socket.on('message', (message) => {
  console.log(message);
});

var timeleft = 10;
var roomName;
var teacherDoodleQuestion;
socket.on('begin', async (data) => {
  roomName = data.doodleGameRoomName;
  var timer = await setInterval(function () {
    if (timeleft < 0) {
      clearInterval(timer);
      clear();
      setup();

      document.getElementById('gameCountdownTimerText').innerHTML =
        data.questionOne;
      document.getElementById('gameCountdownTimer').value = 0;
      var questionOneTimeLeft = 30;
      var qOneTimer = setInterval(function () {
        if (questionOneTimeLeft < 0) {
          teacherDoodleQuestion = data.questionOne;
          // Stream to realtime database.
          saveDoodle();
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
  var px = $('#canvas-holder').parent().width();
  var pey = windowHeight * 0.55;
  var relativeX = data.x * (px / data.resX);
  var relativeXX = data.x2 * (px / data.resX);
  var relativeY = data.y * (pey / data.resY);
  var relativeYY = data.y2 * (pey / data.resY);
  var s0 = data.strokeColor[0];
  var s1 = data.strokeColor[1];
  var s2 = data.strokeColor[2];
  var weight = data.strokeWeight;
  //noStroke();

  strokeWeight(parseInt(weight));
  stroke(parseInt(s0), parseInt(s1), parseInt(s2));
  line(relativeX, relativeY, relativeXX, relativeYY);
  //ellipse(data.x, data.y, 15, 15);
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
  strokeWeight(10);
  stroke(237, 250, 249);
  penTracker = false;
}

function choosePen() {
  noErase();
  strokeWeight(1);
  stroke(202, 110, 255);
  penTracker = true;
}

function draw() {
  if (penTracker) {
    const strokeColor = [202, 110, 255];
    const strokeWeight = 1;

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
        strokeWeight: strokeWeight,
        strokeColor: strokeColor,
      };
      // Stream the data to the realtime database in chunks
      // makes it more efficient.
      currentPath.push(data);

      line(mouseX, mouseY, pmouseX, pmouseY);
      socket.emit('mouse', data);
    }
  } else if (!penTracker) {
    const strokeColor = [237, 250, 249];
    const strokeWeight = 10;
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
        strokeWeight: strokeWeight,
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
    stroke(202, 110, 255);
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
  var ref = database.ref(`${roomName}`);

  var doodleData = {
    studentNames: 'Bobby, Joe, Craig',
    doodle: drawingStream,
    question: teacherDoodleQuestion,
  };
  ref.push(doodleData, (err) => {
    console.log(err);
  });
}
