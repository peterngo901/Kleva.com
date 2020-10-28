socket.on('anonTeacherRoomStudents', (allStudents) => {
  const studentNameTags = loadRealStudentNames(allStudents);
  document.getElementById('studentOutput').innerHTML = studentNameTags;
});

// Render the real student names.
socket.on('teacherLeaver', (remainingStudents) => {
  const remainingStudentsInRoom = loadRealStudentNames(remainingStudents);
  document.getElementById('studentOutput').innerHTML = remainingStudentsInRoom;
});

var gameStarted = false;

// Begin the game for the given gameroom.
function beginGame() {
  gameStarted = true;
  socket.emit('beginGame');
  return;
}

// Allow the teacher to view the timer remaining and the current doodle question.
socket.on('teacherMasterView', async (data) => {
  var timer = await setInterval(function () {
    if (timeleft <= 0) {
      clearInterval(timer);
      clear();
      setup();
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
          document.getElementById('gameCountdownTimer').value = 0;
          clear();
          setup();
          memoryDrawingStream = [];
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
              document.getElementById('gameCountdownTimer').value = 100;
              clearInterval(qTwoTimer);
              memoryDrawingStream = [];
              document.getElementById('gameCountdownTimerText').innerHTML =
                'Game Finished!';
              return (window.location.href = '/teacher-students');
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
