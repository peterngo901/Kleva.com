const Curriculum = require('../models/curriculum');
const Acara = require('../models/acara');
const AcaraRelations = require('../models/acaraRelations');
const { Op } = require('sequelize');

exports.postYearLevelSubstrand = async (req, res) => {
  //console.log(req.body.topic);
  //console.log(req.body.yearLevel);
  //console.log(req.body.classCode);
  const yearLevelSubstrand = req.body.topic;
  const yearLevel = req.body.yearLevel;
  const { classCode } = req.body;
  req.session.classCode = classCode;
  try {
    // Return the ID for the Substrand
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

    //console.log(substrandID);
    const childID = substrandID[0].dataValues.aboutID;
    //console.log(childID);

    // Using that Substrand ID, return all relevant content descriptions.
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
    //console.log(contentDescriptions.length);
    // res.render('teacher/gameStaging', {
    //   questions: {},
    //   path: '/teacher-dashboard',
    //   name: ' ',
    //   classCode: classCode,
    //   contentDescriptions: contentDescriptions,
    // });
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
        yearLevel: yearLevel
      });
    }
    //console.log(scotHolder);
    // Using the terms in the scotHolder, return all the narrower terms.
    const childrenTerms = await AcaraRelations.findAll({
      raw: true,
      where: {
        id: {
          [Op.like]: { [Op.any]: scotHolder },
        },
      },
    });
    console.log(childrenTerms);
    var narrowTermTracker = [];

    for (var u = 0; u < scotHolder.length; u++) {
      if (childrenTerms[u].narrowerTerms !== null) {
        narrowTermTracker.push(...childrenTerms[u].narrowerTerms.split(' '));
      }
    }
    console.log(narrowTermTracker);
    //console.log(narrowTermTracker);
    //console.log(scotHolder);

    narrowTermTracker.push(...scotHolder);

    console.log(narrowTermTracker.push(...scotHolder));
    //console.log(narrowTermTracker);
    // Using the contentDescriptions, return all the terms matching the scoTerms.
    const scoTerms = await Acara.findAll({
      raw: true,
      where: {
        id: {
          [Op.like]: { [Op.any]: narrowTermTracker },
        },
      },
    });
    console.log(scoTerms);
    res.render('teacher/gameStaging', {
      questions: {},
      path: '/teacher-dashboard',
      name: ' ',
      classCode: classCode,
      contentDescriptions: contentDescriptions,
      scot: scoTerms,
      substrand: yearLevelSubstrand,
      yearLevel: yearLevel
    });
  } catch (err) {
    res.render('teacher/gameStaging', {
      questions: {},
      path: '/teacher-dashboard',
      name: ' ',
      classCode: classCode,
      contentDescriptions: '',
      scot: '',
      substrand: yearLevelSubstrand,
      yearLevel: yearLevel
    });
  }
};
