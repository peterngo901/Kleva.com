const Curriculum = require('../models/curriculum');
const Acara = require('../models/acara');
const { Op } = require('sequelize');

exports.postYearLevelSubstrand = async (req, res) => {
  const yearLevelSubstrand = req.body.yearLevelSubstrand;
  const yearLevel = req.body.yearLevel;
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
    // Using that Substrand ID, return all relevant content descriptions.
    const contentDescriptions = await Curriculum.findAll({
      attributes: [
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
        isChildOfOne: substrandID,
      },
    });

    // Loop over every content description and return it's matching word for the scoTerm.
    contentDescriptions.forEach((cd) => {});
    // Using the contentDescriptions, return all the terms matching the scoTerms.
    const scoTerms = await Acara.findAll({
      where: {
        [Op.or]: [
          { id: scotA },
          { id: scotB },
          { id: scotC },
          { id: scotD },
          { id: scotE },
          { id: scotF },
          { id: scotG },
          { id: scotH },
          { id: scotI },
        ],
      },
    });
  } catch (err) {
    res
      .status(502)
      .send({ message: 'Please try resubmitting your live game!' });
  }
};
