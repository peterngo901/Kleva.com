socket.on('studentsList', (allStudents) => {
  //   allStudents.students.foreach((student) => {
  //     console.log(student.realName);
  //   });
  //console.log(allStudents);
  //   console.log(allStudents);
  //   html = '<h1>' + allStudents.realName + '</h1>';
  var studentNames = '';
  for (i = 0; i < allStudents.students.length; i++) {
    studentNames +=
      '<li class="side-nav__item"><a href="/teacher-students" class="side-nav__link"><svg class="side-nav__icon"><use xlink:href="../img/symbol-defs.svg#icon-user-check"></use></svg><span>' +
      allStudents.students[i].realName +
      '</span></a></li>';
  }

  //console.log(allStudents.students[0]);
  document.getElementById('studentOutput').innerHTML = studentNames;
});

var gameStarted = false;

function beginGame() {
  gameStarted = true;
  socket.emit('beginGame');
  console.log(gameStarted);
  watchQuestions();
}
var questionTimeTracker = 0;
function watchQuestions() {
  if (gameStarted) {
    setInterval(function () {
      console.log(questionTimeTracker);
      questionTimeTracker += 1;
      if (questionTimeTracker === 12) {
        clear();
        setup();
      }
      if (questionTimeTracker === 45) {
        clear();
        setup();
      }
      if (questionTimeTracker === 77) {
        clearInterval();
        //TODO REDIRECT TO STATISTICS DASHBOARD TO VIEW ALL DRAWINGS
        return (window.location.href = '/teacher-students');
      }
    }, 1000);
  }
}
