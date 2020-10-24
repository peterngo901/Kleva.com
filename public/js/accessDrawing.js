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
  console.log(key);
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

        // var node = document.createElement('BUTTON');
        // node.className = 'btn btn-success mx-5';
        // var textnode = document.createTextNode(doodleQuestions);
        // var attr = document.createAttribute('onclick');
        // var attr2 = document.createAttribute('value');
        // attr.value = 'retrieveDoodle(this)';
        // attr2.value = `${key}/${drawingQuestions[p]}/studentNames`;
        // node.appendChild(textnode);
        // node.setAttributeNode(attr);
        // node.setAttributeNode(attr2);
        // document.getElementById('doodle-holder').appendChild(node);
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
        // console.log(doodleLines.length);
        // for (var m = 0; m < doodleLines.length; m++) {
        //   var currentDoodleLine = doodleLines[m];
        //   for (var s = 0; s < currentDoodleLine.length; s++) {
        //     newDrawing(doodleLines[m][s]);
        //   }
        // }
      }
    }
    // Return a card depending on the length of the doodleQ's array.
    for (var u = 0; u < doodleQs.length; u++) {
      var attr1 = document.createAttribute('id');
      var attr2 = document.createAttribute('onclick');
      var attr3 = document.createAttribute('value');
      attr1.value = `doodle${u}`; //id=doodle0
      attr2.value = `openDoodleStream(this)`; //onclick=openDoodleStream(this)
      attr3.value = `${u}`; //value=doodleLineDataTracker[]

      var node = document.createElement('BUTTON');
      node.className = 'btn btn-success m-5';

      var questionNode = document.createTextNode('Q: ' + doodleQs[u]);
      var studentNameNode = document.createTextNode(
        ' By: ' + studentDoodlesTracker[u]
      );
      node.appendChild(questionNode);
      node.appendChild(studentNameNode);

      node.setAttributeNode(attr1); //id=doodle0
      node.setAttributeNode(attr2); //onclick=openDoodleStream(this)
      node.setAttributeNode(attr3); //value=doodleLineDataTracker[]

      document.getElementById('doodle-holder').appendChild(node);
    }

    return console.log(doodleQs, studentDoodlesTracker, doodleLineDataTracker);

    //drawingDataLoop(drawingQuestions);
  }
}
var currentDoodleLine;
var doodleLinesRetracing;
async function openDoodleStream(btn) {
  currentDoodleLine = [];
  doodleLinesRetracing = [];
  draw();
  setup();
  doodlePoints = btn.value;
  console.log(doodlePoints);
  //console.log(doodleLineDataTracker[doodlePoints]);
  doodleLinesRetracing = doodleLineDataTracker[doodlePoints];

  console.log(doodleLinesRetracing.length);
  for (var m = 0; m < doodleLinesRetracing.length; m++) {
    currentDoodleLine = await doodleLinesRetracing[m];
    for (var s = 0; s < currentDoodleLine.length; s++) {
      newDrawing(doodleLinesRetracing[m][s]);
    }
  }
  return console.log(doodleLinesRetracing);
}

// function drawingDataLoop(drawingQuestions) {
//   for (var p = 0; p < drawingQuestions.length; p++) {
//     // Return the Doodle Question
//     var questionRef = database.ref(key + `/${drawingQuestions[p]}/question`);
//     // Return the Drawing Line Data
//     var doodleDataRef = database.ref(key + `/${drawingQuestions[p]}/doodle`);
//     // Return the Students For Each Doodle
//     var studentsRef = database.ref(
//       key + `/${drawingQuestions[p]}/studentNames`
//     );
//     questionRef.on('value', oneQuestionDoodle);
//     doodleDataRef.on('value', doodleLineData);
//     studentsRef.on('value', studentDoodleData);
//     async function oneQuestionDoodle(data) {
//       var doodleQuestions = await data.val();
//       console.log(doodleQuestions);
//       //newDrawing(doodleLines);
//       var node = document.createElement('LI');
//       var textnode = document.createTextNode(doodleQuestions);
//       node.appendChild(textnode);
//       document.getElementById('doodle-holder').appendChild(node);
//     }
//     async function studentDoodleData(data) {
//       var studentDoodles = await data.val();
//       console.log(studentDoodles);
//     }
//     function doodleLineData(data) {
//       data.forEach((doodleStreams) => {
//         doodleStreams.forEach((dData) => {
//           newDrawing(dData.val());
//         });
//       });
//       // var doodleLines = data.val();
//       // console.log(doodleLines.length);
//       // for (var m = 0; m < doodleLines.length; m++) {
//       //   var currentDoodleLine = doodleLines[m];
//       //   for (var s = 0; s < currentDoodleLine.length; s++) {
//       //     //newDrawing(doodleLines[m][s]);
//       //   }
//       // }
//     }
//   }
// }

var cnv;
var px;
var pey;

$(window).on('resize', function (e) {
  px = $('#canvas-holder').parent().width();
  windowResized();
});

function setup() {
  px = $('#canvas-holder').parent().width();
  cnv = createCanvas(px, windowHeight * 0.55);
  background(237, 250, 249);
  cnv.parent('canvas-holder');
  newDrawing;
  noLoop();
}

function newDrawing(data) {
  px = $('#canvas-holder').parent().width();
  pey = windowHeight * 0.55;
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
  px = $('#canvas-holder').parent().width();
  resizeCanvas(px, windowHeight * 0.55);
  background(237, 250, 249);
}

function draw() {}
