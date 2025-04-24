module.exports = async (req, res) => {
  const Country = require('../models/mongo').Country;
  const Constants = require('../lib/constants');

  let countries = await Country.find({ is_active: true, is_deleted: false }, "-_id").lean();
  if (countries) {
    return res.status(Constants.SUCCESS).send({ type: Constants.SUCCESS_MSG, data: countries });
  } else {
    return res.status(Constants.INTERNAL_ERROR).send({ type: Constants.ERROR_MSG, message: Constants.INTERNAL_SERVER_ERROR });
  }

};