function questionGenerator() {
  var substrand = document.getElementById('qGeneratorSubject').value;
  var yearLevel = document.getElementById('qGeneratorYearLevel').value;
  var aiPromptTerm = document.getElementById('qGeneratorTerm').value;

  $.post('/openai-question', {
    subject: substrand,
    yearLevel: yearLevel,
    term: aiPromptTerm,
  }).done(function (data) {
    //var generatedDoodleQuestion = 'Doodle the' + data.aiGeneration;
    //document.getElementById('AIGENERATED').value = 'Doodle the' + data.aiGeneration;
    $('#AIGENERATED').animate({ opacity: 0 }, 400, function () {
      var generatedDoodleQuestion = 'Doodle the' + data.aiGeneration;
      $(this).val(`${generatedDoodleQuestion}`).animate({ opacity: 1 }, 400);
    });
  });
}
