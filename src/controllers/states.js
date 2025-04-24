module.exports = async (req, res) => {
  const State = require('../models/mongo').State;
  const Country = require('../models/mongo').Country;
  const Constants = require('../lib/constants');

  let country = req.query.country;
  // if (!country) {
  //   res.status(Constants.BAD_REQUEST);
  //   return res.send({ type: Constants.ERROR_MSG, message: "Mandatory Data Missing" });
  // }
  let country_db;
  if (country) {
    country_db = await Country.findOne({ country_uid: country, is_active: true, is_deleted: false }).lean();
    if (!country_db) {
      res.status(Constants.NOT_FOUND);
      return res.send({ type: Constants.ERROR_MSG, message: "Invalid UID" });
    }
  }

  let query_filter = { is_active: true, is_deleted: false };

  if (country_db) {
    query_filter['country_id'] = country_db._id;
  }

  let filter = {
    keyword: req.query["filter.keyword"]
  }

  if (filter['keyword']) {

    filter['keyword'] = filter['keyword'].replace(/[+]/g, "");
    //filter['keyword'] = filter['keyword'].split(',')
    query_filter['$or'] = [
      {
        "state_name": { '$regex': filter.keyword, '$options': 'i' }
      }
    ]
  }

  let states = await State.find(query_filter, "-_id -country_id").lean();
  if (states) {
    return res.status(Constants.SUCCESS).send({ type: Constants.SUCCESS_MSG, data: states });
  } else {
    return res.status(Constants.INTERNAL_ERROR).send({ type: Constants.ERROR_MSG, message: Constants.INTERNAL_SERVER_ERROR });
  }

};