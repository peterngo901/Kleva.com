const socket = io();

// socket.on('name') parameter must match the socket.emit('name') in controllers.
socket.on('hello', (counter) => {
  console.log('Receiving message from server with no request.');
});

var cnv;

function setup() {
  var px = $('#canvas-holder').parent().width();
  // var py = $('#canvas-holder').parent().height();

  cnv = createCanvas(px, windowHeight * 0.55);

  background(237, 250, 249);
  cnv.parent('canvas-holder');
  io.connect('http://localhost:3000/game-room');
}

function windowResized() {
  var px = $('#canvas-holder').parent().width();
  cnv.resizeCanvas(px, windowHeight * 0.55);
}
