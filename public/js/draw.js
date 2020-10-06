const socket = io();

// Elements
const $submitAnswer = document.querySelector('#submitAnswer');

// socket.on('name') parameter must match the socket.emit('name') in controllers.
socket.on('message', (message) => {
  console.log(message);
});

var timeleft = 10;
socket.on('begin', async (data) => {
  var timer = await setInterval(function () {
    if (timeleft < 0) {
      clearInterval(timer);
      document.getElementById('gameCountdownTimerText').innerHTML =
        data.questionOne;
      document.getElementById('gameCountdownTimer').value = 0;
      var questionOneTimeLeft = 120;
      var qOneTimer = setInterval(function () {
        if (questionOneTimeLeft < 0) {
          document.getElementById('gameCountdownTimer').value = 0;
          clearInterval(qOneTimer);
          document.getElementById('gameCountdownTimerText').innerHTML =
            data.questionTwo;
          var questionTwoTimeLeft = 120;
          var qTwoTimer = setInterval(function () {
            if (questionTwoTimeLeft < 0) {
              document.getElementById('gameCountdownTimer').value = 100;
              document.getElementById('gameCountdownTimerText').innerHTML =
                'Game Finished!';
              return;
            } else {
              document.getElementById('gameCountdownTimer').value =
                10 - questionTwoTimeLeft / 12;
              questionTwoTimeLeft -= 1;
            }
          }, 1000);
        } else {
          document.getElementById('gameCountdownTimer').value =
            10 - questionOneTimeLeft / 12;
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
  //noStroke();
  stroke(202, 110, 255);
  line(relativeX, relativeY, relativeXX, relativeYY);
  //ellipse(data.x, data.y, 15, 15);
}

function windowResized() {
  var px = $('#canvas-holder').parent().width();
  resizeCanvas(px, windowHeight * 0.55);
  background(237, 250, 249);
}

function mouseIsPressed() {
  const px = $('#canvas-holder').parent().width();
  const pey = windowHeight * 0.55;
  var data = {
    x: mouseX,
    y: mouseY,
    x2: pmouseX,
    y2: pmouseY,
    resX: px,
    resY: pey,
  };

  stroke(202, 110, 255);
  line(mouseX, mouseY, pmouseX, pmouseY);
}

function draw() {
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
    };
    stroke(202, 110, 255);
    line(mouseX, mouseY, pmouseX, pmouseY);
    socket.emit('mouse', data);
  }
}

// // Teacher submits the question to the classroom.
// document.querySelector('#send-question').addEventListener('click', () => {
//   socket.emit('sendQuestion', message, (msg) => {
//     console.log('The question will be delivered.', msg);
//   });
// });
