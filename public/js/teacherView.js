socket.on('studentsList', (allStudents) => {
  //   allStudents.students.foreach((student) => {
  //     console.log(student.realName);
  //   });
  //console.log(allStudents);
  //   console.log(allStudents);
  //   html = '<h1>' + allStudents.realName + '</h1>';
  const studentNameTags = loadRealStudentNames(allStudents);
  document.getElementById('studentOutput').innerHTML = studentNameTags;
});

socket.on('anonTeacherRoomStudents', (allStudents) => {
  const studentNameTags = loadRealStudentNames(allStudents);
  document.getElementById('studentOutput').innerHTML = studentNameTags;
});

socket.on('teacherLeaver', (remainingStudents) => {
  const remainingStudentsInRoom = loadRealStudentNames(remainingStudents);
  document.getElementById('studentOutput').innerHTML = remainingStudentsInRoom;
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
      //console.log(questionTimeTracker);
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
