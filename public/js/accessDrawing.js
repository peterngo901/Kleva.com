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

var drawingQuestions = [];
var doodleQs = [];
var studentDoodlesTracker = [];
var doodleLineDataTracker = [];
var key;
var uPenColors = ['#FF0000', '#D500FF', '#FFFF00', '#1B1B0A', '#5EFFBA'];

// Return the students, the student's pen color
// and the question for each doodle from a selected date.
async function queryDoodlesFromDate(btn, event) {
  drawingQuestions = [];
  doodleQs = [];
  studentDoodlesTracker = [];
  doodleLineDataTracker = [];
  var nodeReset = document.getElementById('doodle-holder');
  nodeReset.innerHTML = '';
  // Refresh canvas.
  setup();

  // Retrieve the date of the doodle.
  key = btn.value;
  var ref = database.ref(key);
  //console.log(key);
  // Retrieve all the doodles from the date.
  await ref.on('value', oneQuestionDrawing);

  // Retrieve Each Doodle
  function oneQuestionDrawing(data) {
    var doodleDataDrawing = data.val();
    var drawingKeys = Object.keys(doodleDataDrawing);
    // Return the entire list of keys to the doodles: ["-MKJeIlu2OlDL9wziZzI", "-MKJeQef115Ym1mWveNw"]
    for (var l = 0; l < drawingKeys.length; l++) {
      drawingQuestions.push(drawingKeys[l]);
    }

    // Return the students and question from each key.
    for (var p = 0; p < drawingQuestions.length; p++) {
      // Return the db path to the questions.
      var questionRef = database.ref(key + `/${drawingQuestions[p]}/question`);
      // Return the db path to the studentNames.
      var studentsRef = database.ref(
        key + `/${drawingQuestions[p]}/studentNames`
      );
      // Return the Drawing Line Data
      var doodleDataRef = database.ref(key + `/${drawingQuestions[p]}/doodle`);

      questionRef.on('value', oneQuestionDoodle);
      function oneQuestionDoodle(data) {
        var doodleQuestions = data.val();

        // Push the doodleQuestions into an array.
        if (doodleQuestions !== null) {
          doodleQs.push(doodleQuestions);
        }
      }
      studentsRef.on('value', studentDoodleData);
      function studentDoodleData(data) {
        var studentDoodles = data.val();
        if (studentDoodles !== null) {
          studentDoodlesTracker.push(studentDoodles);
        }
      }

      doodleDataRef.on('value', doodleLineData);
      function doodleLineData(data) {
        var doodleLines = data.val();
        doodleLineDataTracker.push(doodleLines);
      }
    }
    // Return a card depending on the length of the doodleQ's array.
    for (var u = 0; u < doodleQs.length; u++) {
      var attr1 = document.createAttribute('id');
      var attr2 = document.createAttribute('onclick');
      var attr3 = document.createAttribute('value');
      var attr4 = document.createAttribute('style');
      var attr5 = document.createAttribute('style');

      attr1.value = `doodle${u}`; //id=doodle0
      attr2.value = `openDoodleStream(this)`; //onclick=openDoodleStream(this)
      attr3.value = `${u}`; //value=doodleLineDataTracker[]
      attr4.value = `font-size: 1.5rem; padding: 2rem 1.5rem;`;
      attr5.value = `font-size: 1.5rem; font-family: 'Quicksand', cursive;`;
      var node = document.createElement('BUTTON');
      var node2 = document.createElement('H2');

      node.className = 'btn doodleDrawingView m-2';
      node2.className = 'ml-2 text-left my-2';
      var questionNode = document.createTextNode('Q: ' + doodleQs[u]);
      var studentNameNode = document.createTextNode('Created By: ');
      node.appendChild(questionNode);
      node2.appendChild(studentNameNode);

      node2.setAttributeNode(attr5);
      node.setAttributeNode(attr1); //id=doodle0
      node.setAttributeNode(attr2); //onclick=openDoodleStream(this)
      node.setAttributeNode(attr3); //value=doodleLineDataTracker[]
      node.setAttributeNode(attr4);
      document.getElementById('doodle-holder').appendChild(node);
      document.getElementById('doodle-holder').appendChild(node2);

      for (var rt = 0; rt < studentDoodlesTracker[u].length; rt++) {
        var node3 = document.createElement('img');
        var node4 = document.createElement('h5');
        var node5 = document.createElement('div');
        var studentColorName = document.createTextNode(
          studentDoodlesTracker[u][rt]
        );
        node4.appendChild(studentColorName);

        var penColorIdentifier = uPenColors[rt];
        var attr6 = document.createAttribute('style');
        attr6.value = `background-color: ${penColorIdentifier};`;
        var attr7 = document.createAttribute('style');
        attr7.value = `text-transform: uppercase; font-size: 1.3rem; font-family: 'Quicksand', cursive; color: ${penColorIdentifier};`;
        node5.className = 'row d-flex justify-content-start ml-2 my-2';
        node4.setAttributeNode(attr7);
        node3.className = `dotHistory`;
        node3.setAttributeNode(attr6);
        node5.appendChild(node3);
        node5.appendChild(node4);
        document.getElementById('doodle-holder').appendChild(node5);
      }
    }

    return;
  }
}
var currentDoodleLine;
var doodleLinesRetracing;
var sliderHistoryRange;

// Draw the doodle data based upon the value of the slider.
function openDoodleStream(btn) {
  currentDoodleLine = [];
  doodleLinesRetracing = [];
  sliderHistoryRange = 0;
  draw();
  setup();
  doodlePoints = btn.value;

  if (doodleLineDataTracker[doodlePoints] === null) {
    sliderHistoryRange = 0;
    $('#slider').slider({
      max: sliderHistoryRange,
    });
    $('#slider').slider('disable');
  } else {
    sliderHistoryRange = doodleLineDataTracker[doodlePoints].length;

    $('#slider').slider({
      max: sliderHistoryRange,
    });
    $('#slider').slider('enable');
    $('#slider').slider('value', 0);
  }

  doodleLinesRetracing = doodleLineDataTracker[doodlePoints];

  $('#slider').on('slide', function (event, ui) {
    setup();
    var selection = ui.value;

    for (var m = 0; m < selection; m++) {
      currentDoodleLine = doodleLinesRetracing[m];
      for (var s = 0; s < currentDoodleLine.length; s++) {
        newDrawing(doodleLinesRetracing[m][s]);
      }
    }
  });
  $('#slider').on('slidestop', function (event, ui) {});
  return;
}

var cnv;
var px;
var pey;

// Resize the canvas when the user resizes their window.
$(window).on('resize', function (e) {
  px = $('#canvas-holder').parent().width();
  windowResized();
});

// Setup the drawing canvas.
function setup() {
  px = $('#canvas-holder').parent().width();
  cnv = createCanvas(px, windowHeight * 0.45);
  background(237, 250, 249);
  cnv.parent('canvas-holder');
  newDrawing;
  noLoop();
}

// Rehydrate the doodle from the selected doodle.
function newDrawing(data) {
  px = $('#canvas-holder').parent().width();
  pey = windowHeight * 0.45;
  var relativeX = data.x * (px / data.resX);
  var relativeXX = data.x2 * (px / data.resX);
  var relativeY = data.y * (pey / data.resY);
  var relativeYY = data.y2 * (pey / data.resY);
  var s0 = data.strokeColor;
  var weight = data.strokeWeight;
  strokeWeight(parseInt(weight));
  stroke(s0);
  line(relativeX, relativeY, relativeXX, relativeYY);
}

function windowResized() {
  px = $('#canvas-holder').parent().width();
  resizeCanvas(px, windowHeight * 0.45);
  background(237, 250, 249);
}

function draw() {}
