// Models
const Acara = require('../models/acara');
const AcaraRelations = require('../models/acaraRelations');
const Curriculum = require('../models/curriculum');

// Dependencies
const { Op } = require('sequelize');

// Return Curriculum Specific words to be used by teachers to create doodle questions.
exports.postYearLevelSubstrand = async (req, res) => {
  const yearLevelSubstrand = req.body.topic;
  const yearLevel = req.body.yearLevel;
  const { classCode } = req.body;
  req.session.classCode = classCode;
  try {
    // Return the uid for the given year-level-substrand.
    const substrandID = await Curriculum.findAll({
      attributes: ['aboutID'],
      where: {
        [Op.or]: [
          { yearLevelOne: yearLevel },
          { yearLevelTwo: yearLevel },
          { yearLevelTwo: yearLevel },
        ],
        title: yearLevelSubstrand,
      },
    });

    // Return all the children of the given curriculum sub-strand.
    const childID = substrandID[0].dataValues.aboutID;

    // Using that Substrand ID, return all relevant content descriptions,
    // and all uid dictionary terms from Acaras table.
    const contentDescriptions = await Curriculum.findAll({
      attributes: [
        'strand',
        'description',
        'aboutID',
        'curriculumCode',
        'scotA',
        'scotB',
        'scotC',
        'scotD',
        'scotE',
        'scotF',
        'scotG',
        'scotH',
        'scotI',
      ],
      where: {
        isChildOfOne: childID,
      },
    });

    // Return all non-null uid dictionary terms.
    var scotHolder = [];
    if (contentDescriptions.length >= 1) {
      for (var g = 0; g < contentDescriptions.length; g++) {
        console.log(contentDescriptions[g].dataValues.scotA);
        var conDescrip = contentDescriptions[g].dataValues.description;
        var scotA = contentDescriptions[g].dataValues.scotA;
        var scotB = contentDescriptions[g].dataValues.scotB;
        var scotC = contentDescriptions[g].dataValues.scotC;
        var scotD = contentDescriptions[g].dataValues.scotD;
        var scotE = contentDescriptions[g].dataValues.scotE;
        var scotF = contentDescriptions[g].dataValues.scotF;
        var scotG = contentDescriptions[g].dataValues.scotG;
        var scotH = contentDescriptions[g].dataValues.scotH;
        var scotI = contentDescriptions[g].dataValues.scotI;
        scotA !== null ? scotHolder.push(scotA) : '';
        scotB !== null ? scotHolder.push(scotB) : '';
        scotC !== null ? scotHolder.push(scotC) : '';
        scotD !== null ? scotHolder.push(scotD) : '';
        scotE !== null ? scotHolder.push(scotE) : '';
        scotF !== null ? scotHolder.push(scotF) : '';
        scotG !== null ? scotHolder.push(scotG) : '';
        scotH !== null ? scotHolder.push(scotH) : '';
        scotI !== null ? scotHolder.push(scotI) : '';
      }
    } else {
      res.render('teacher/gameStaging', {
        questions: {},
        path: '/teacher-dashboard',
        name: ' ',
        classCode: classCode,
        contentDescriptions: contentDescriptions,
        substrand: yearLevelSubstrand,
        yearLevel: yearLevel,
      });
    }

    // For the given sub-strand of a subject, return all it's children
    // terms and the children of the children terms.
    const childrenTerms = await AcaraRelations.findAll({
      raw: true,
      where: {
        id: {
          [Op.like]: { [Op.any]: scotHolder },
        },
      },
    });

    var narrowTermTracker = [];
    for (var u = 0; u < scotHolder.length; u++) {
      if (childrenTerms[u].narrowerTerms !== null) {
        narrowTermTracker.push(...childrenTerms[u].narrowerTerms.split(' '));
      }
    }

    // Push all broad and narrow terms into a single array.
    narrowTermTracker.push(...scotHolder);

    // Using the contentDescriptions, return all the terms matching the scoTerms.
    const scoTerms = await Acara.findAll({
      raw: true,
      where: {
        id: {
          [Op.like]: { [Op.any]: narrowTermTracker },
        },
      },
    });
    res.render('teacher/gameStaging', {
      questions: {},
      path: '/teacher-dashboard',
      name: ' ',
      classCode: classCode,
      contentDescriptions: contentDescriptions,
      scot: scoTerms,
      substrand: yearLevelSubstrand,
      yearLevel: yearLevel,
    });
  } catch (err) {
    // No terms have been found for the given content description.
    // Common for ARTs and Humanities subjects as they are not well
    // documented by ACARA (Australian Curriculum).
    res.render('teacher/gameStaging', {
      questions: {},
      path: '/teacher-dashboard',
      name: ' ',
      classCode: classCode,
      contentDescriptions: '',
      scot: '',
      substrand: yearLevelSubstrand,
      yearLevel: yearLevel,
    });
  }
};
