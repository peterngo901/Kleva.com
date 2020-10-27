// OpenAI GPT-3 Endpoint
const OpenAI = require('openai-api');
const OPEN_AI_API_KEY = '#################';
const openai = new OpenAI(OPEN_AI_API_KEY);
var start_sequence = 'Doodle the';
//

const express = require('express');
const router = express.Router();

router.post('/openai-question', async (req, res) => {
  const subject = req.body.subject;
  const yearLevel = req.body.yearLevel;
  const term = req.body.term;

  const gptResponse = await openai.complete({
    engine: 'davinci',
    prompt: `###Training###\nThis is a drawing question generator for middle school students.\nSubject: Chemical sciences, Term: Atoms, yearLevel: 9\nQ: Doodle the atomic structure of oxygen.\n\nSubject: Chemical sciences, Term: Molecules, yearLevel: 9\nQ: Doodle the structure of water, H2O.\n\nSubject: Chemical sciences, Term: Acids, yearLevel: 9\nQ: Doodle the structure of aspartic acid.\n\nSubject: Chemical sciences, Term: Atoms, yearLevel: 9\nQ: Doodle the atomic structure of mercury.\n\nSubject: Physical sciences, Term: Waves, yearLevel: 9\nQ: Doodle the transverse wave in air.\n\nSubject: Physical sciences, Term: Heat, yearLevel: 9\nQ: Doodle the direction of heat from hot plate to cold water.\n\nSubject: Physical sciences, Term: Motion, yearLevel: 7\nQ: Doodle the effect of forces on a spear being thrown.\n\nSubject: Biological sciences, Term: Food webs, yearLevel: 7\nQ: Doodle the food chain of animals in the Australian outback.\n\nSubject: Chemical sciences, Term: Chemical compounds, yearLevel: 8\nQ: Doodle the written chemical formula of copper(II) sulfate.\n\nSubject: Chemical sciences, Term: States of matter, yearLevel: 8\nQ: Doodle the phases of a gas in a diagram.\n###Training###\nSubject: ${subject}, Term: ${term}, yearLevel: ${yearLevel}\nQ: Doodle the`,
    max_tokens: 24,
    temperature: 0.9,
    topP: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
    best_of: 1,
    n: 1,
    stream: false,
    stop: ['\n', '.', 'testing'],
  });
  // AI generated question based on the prompt.
  //console.log(start_sequence + " " + gptResponse.data);
  //console.log(start_sequence);
  //console.log(gptResponse.data.choices[0].text);
  //console.log(gptResponse.data);
  res.status(200).send({ aiGeneration: gptResponse.data.choices[0].text });
});

module.exports = router;
