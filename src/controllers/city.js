module.exports = async (req, res) => {
  const City = require('../models/mongo').City;
  const State = require('../models/mongo').State;
  const Constants = require('../lib/constants');

  let state = req.query.state;
  // if (!state) {
  //   res.status(Constants.BAD_REQUEST);
  //   return res.send({ type: Constants.ERROR_MSG, message: "Mandatory Data Missing" });
  // }
  let state_db;
  if (state) {
    state_db = await State.findOne({ '$or': [{ state_uid: state }, { state_name: state }], is_active: true, is_deleted: false }).lean();
    if (!state_db) {
      res.status(Constants.NOT_FOUND);
      return res.send({ type: Constants.ERROR_MSG, message: "Invalid UID" });
    }
  }

  let query_filter = { is_active: true, is_deleted: false };

  if (state_db) {
    query_filter['state_id'] = state_db._id;
  }

  let filter = {
    keyword: req.query["filter.keyword"]
  }

  if (filter['keyword']) {

    filter['keyword'] = filter['keyword'].replace(/[+]/g, "");
    //filter['keyword'] = filter['keyword'].split(',')
    query_filter['$or'] = [
      {
        "city_name": { '$regex': filter.keyword, '$options': 'i' }
      }
    ]
  }


  let cities = await City.find(query_filter, "-_id -country_id -state_id")
  //.populate('state_id', 'state_name') 
  //.populate('country_id', 'country_name')
  .lean();

  if (cities) {
    return res.status(Constants.SUCCESS).send({ type: Constants.SUCCESS_MSG, data: cities });
  } else {
    return res.status(Constants.INTERNAL_ERROR).send({ type: Constants.ERROR_MSG, message: Constants.INTERNAL_SERVER_ERROR });
  }

};