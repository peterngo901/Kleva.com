const socket = io();

// Elements
const $submitAnswer = document.querySelector('#submitAnswer');

// socket.on('name') parameter must match the socket.emit('name') in controllers.
socket.on('message', (message) => {
  console.log(message);
});

var cnv;

function setup() {
  var px = $('#canvas-holder').parent().width();
  // var py = $('#canvas-holder').parent().height();

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
  cnv = resizeCanvas(px, windowHeight * 0.55);
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
