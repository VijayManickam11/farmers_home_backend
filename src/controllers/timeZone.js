const Timezone = require('../models/mongo').Timezone;
const Constants = require('../lib/constants');

const async = require('async');
const uuidv1 = require('uuid').v1;

const getTimeZones = async (req, res) => {
  let time_zones = await Timezone.find({ is_active: true, is_deleted: false }, "-_id").lean();
  if (time_zones) {
    return res.status(Constants.SUCCESS).send({ type: Constants.SUCCESS_MSG, data: time_zones });
  } else {
    return res.status(Constants.INTERNAL_ERROR).send({ type: Constants.ERROR_MSG, message: Constants.INTERNAL_SERVER_ERROR });
  }

};

const addTimeZones = async function (req, res) {
  let tz_data = req.body;
  if (!tz_data || tz_data.length == 0) {
    res.status(Constants.BAD_REQUEST);
    return res.send({ type: Constants.ERROR_MSG, message: "Mandatory Data Missing" });
  }
  let tzs = [];
  async.eachSeries(tz_data, function (q, cb) {
    tzs.push({
      timezone_uid: uuidv1(),
      timezone_name: q.timezone_name,
      code: q.code,
      zone_offset: q.zone_offset
    })
    cb()
  }, async function (done) {
    await Timezone.insertMany(tzs);
    return res.status(Constants.SUCCESS).send({ type: Constants.SUCCESS_MSG, message: Constants.CREATION_SUCCESS });
  })
}

module.exports = {
  getTimeZones: getTimeZones,
  addTimeZones: addTimeZones
}