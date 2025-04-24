const Location = require('../models/mongo').Location;
const Country = require('../models/mongo').Country;
const State = require('../models/mongo').State;
const City = require('../models/mongo').City;



const Constants = require('../lib/constants');
const async = require('async');
const uuidv1 = require('uuid').v1;
const Util = require('../lib/util');

const getLocation = async function (req, res) {
    let page = req.params.page || req.body.page || req.query.page || 1;
    let count = req.params.count || req.body.count || req.query.count || 100;

    let sort = req.params.sort || req.body.sort || req.query.sort || "DESC";
    let sort_by = req.params.sort_by || req.body.sort_by || req.query.sort_by || "created_at";

    let sort_value = {};

    if (sort == "ASC") {
        sort_value[sort_by] = 1;
    } else {
        sort_value[sort_by] = -1;
    }

    let options = {
        select: "-_id",
        lean: true,
        page: Number(page),
        limit: Number(count),
        sort: sort_value,
        populate: [
            { path: 'country', select: 'country_name  uid -_id' },
            { path: 'state', select: 'state_name  uid -_id' },
            { path: 'city', select: 'city_name uid -_id' }
        ]
    };

    let filter = {
        state: req.query["filter.state"],
        city: req.query["filter.city"],
        zip_code: req.query['filter.zip_code'],
        status: req.query["filter.status"]
    };

    let query_filter = { is_deleted: false };

    if (filter.state) {
        query_filter['state_name'] = { '$regex': filter.state, '$options': 'i' };
    }

    if (filter.city) {
        query_filter['city_name'] = { '$regex': filter.city, '$options': 'i' };
    }

    if (filter.zip_code) {
        query_filter['zip_code'] = { '$regex': filter.zip_code, '$options': 'i' };
    }

    if (filter.status) {
        query_filter['is_active'] = filter.status === 'Active';
    }

    try {
        let location = await Location.paginate(query_filter, options);
        return res.status(Constants.SUCCESS).send({
            type: Constants.SUCCESS_MSG,
            data: location.docs,
            total_records: location.total,
            current_page: location.page,
            total_pages: location.pages
        });
    } catch (error) {
        return res.status(Constants.INTERNAL_ERROR).send({ type: Constants.ERROR_MSG, message: Constants.INTERNAL_SERVER_ERROR });
    }
};

const addLocation = async function (req, res) {
    let location_data = req.body;
    if (!location_data || location_data.length == 0) {
        res.status(Constants.BAD_REQUEST);
        return res.send({ type: Constants.ERROR_MSG, message: "Mandatory Data Missing" });
    }

        //ZIp Code Validation 
        const zip_code = location_data.zip_code;   
        const isZipCodeValid = await Util.validateZipCode(zip_code)        
        if (!isZipCodeValid) {
            res.status(Constants.BAD_REQUEST);
            return res.send({ type: Constants.ERROR_MSG, message: "Invalid Zip Code" });
        }

    let country_db, state_db, city_db;
    if (location_data.country) {
        country_db = await Country.findOne({ country: location_data['country'], is_deleted: false }).lean();
        if (country_db) {
            location_data['country'] = country_db._id;
        } else {
            res.status(Constants.NOT_FOUND);
            return res.send({ type: Constants.ERROR_MSG, message: "Invalid Country Name" });
        }
    }


    if (location_data.state) {
        state_db = await State.findOne({ state: location_data['state'], is_deleted: false });
        if (state_db) {
            location_data['state'] = state_db._id;
        } else {
            res.status(Constants.NOT_FOUND);
            return res.send({ type: Constants.ERROR_MSG, message: "Invalid State Name" });
        }
    }

    if (location_data.city) {
        city_db = await City.findOne({ city: location_data['city'], is_deleted: false });
        if (city_db) {
            location_data['city'] = city_db._id;
        } else {
            res.status(Constants.NOT_FOUND);
            return res.send({ type: Constants.ERROR_MSG, message: "Invalid City Name" });
        }
    }

    let dup_city_db = await Location.findOne({ city_name: location_data.city_name, is_deleted: false }).lean();
    if (dup_city_db) {
        res.status(Constants.CONFLICT);
        return res.send({ type: Constants.ERROR_MSG, message: "City Name already exist" });
    }

    let dup_zip_db = await Location.findOne({ zip_code: location_data.zip_code, is_deleted: false }).lean();
    if (dup_zip_db) {
        res.status(Constants.CONFLICT);
        return res.send({ type: Constants.ERROR_MSG, message: "Zip Code already exist" });
    }


    location_data['location_uid'] = uuidv1();

    try {
        let saved_data = await Location(location_data).save();
        res.status(Constants.SUCCESS);
        return res.send({ type: Constants.SUCCESS_MSG, message: Constants.CREATION_SUCCESS, data: { location_uid: saved_data.location_uid } });
    } catch (error) {
        return res.status(Constants.INTERNAL_ERROR).send({ type: Constants.ERROR_MSG, message: error.message });
    }
};

const updateLocation = async function (req, res) {

    let location_uid = req.params.location_uid;
    let location_data = req.body;

    if (!location_uid || !location_data) {
        res.status(Constants.BAD_REQUEST);
        return res.send({ type: Constants.ERROR_MSG, message: "Mandatory Data Missing" });
    }

    //ZIp Code Validation 
    const zip_code = location_data.zip_code;   
    const isZipCodeValid = await Util.validateZipCode(zip_code)
       if (!isZipCodeValid) {
        res.status(Constants.BAD_REQUEST);
        return res.send({ type: Constants.ERROR_MSG, message: "Invalid Zip Code" });
    }
       

    // let dup_country_db = await State.findOne({ country_name: location_data.country_name, is_deleted: false }).lean();
    // if (!dup_country_db) {
    //   res.status(Constants.CONFLICT);
    //   return res.send({ type: Constants.ERROR_MSG, message: "Country Name already exist" });
    // }

    // let dup_state_db = await State.findOne({ state_name: location_data.state_name, is_deleted: false }).lean();
    // if (!dup_state_db) {
    //   res.status(Constants.CONFLICT);
    //   return res.send({ type: Constants.ERROR_MSG, message: "State Name already exist" });
    // }

    // let dup_city_db = await City.findOne({ city_name: location_data.city_name, is_deleted: false }).lean();
    // if (!dup_city_db) {
    //   res.status(Constants.CONFLICT);
    //   return res.send({ type: Constants.ERROR_MSG, message: "State Name already exist" });
    // }

    let dup_zip_db = await Location.findOne({ zip_code: location_data.zip_code, is_deleted: false }).lean();
    if (dup_zip_db) {
        res.status(Constants.CONFLICT);
        return res.send({ type: Constants.ERROR_MSG, message: "Zip Code already exist" });
    }

    let location_db = await Location.findOne({ location_uid: location_uid, is_active: true, is_deleted: false });
    if (location_db) {
        location_db.country_name = location_data.country_name || location_data.country_name;
        location_db.state_name = location_data.state_name || location_data.state_name;
        location_db.city_name = location_data.city_name || location_data.city_name;
        location_db.zip_code = location_data.zip_code || location_data.zip_code;

        await location_db.save();
        return res.send({ type: Constants.SUCCESS_MSG, message: Constants.UPDATION_SUCCESS });
    } else {
        res.status(Constants.NOT_FOUND);
        return res.send({ type: Constants.ERROR_MSG, message: Constants.INTERNAL_SERVER_ERROR });
    }

}

const deleteLocation = async function (req, res) {
    let location_uid = req.params.location_uid;
    if (!location_uid) {
        res.status(Constants.BAD_REQUEST);
        return res.send({ type: Constants.ERROR_MSG, message: "Mandatory Data Missing" });
    }
    //VALIDATE UID
    let location_db = await Location.findOne({ location_uid: location_uid, is_deleted: false });
    if (!location_db) {
        res.status(Constants.NOT_FOUND);
        return res.send({ type: Constants.ERROR_MSG, message: "Invalid UID" });
    }
    location_db['is_deleted'] = true;
    let updated_data = await location_db.save();
    if (updated_data) {
        return res.send({
            type: Constants.SUCCESS_MSG,
            message: Constants.DELETION_SUCCESS
        });
    } else {
        res.status(Constants.INTERNAL_ERROR);
        return res.send({
            type: Constants.ERROR_MSG,
            message: Constants.INTERNAL_SERVER_ERROR
        })

    }
}

module.exports = {
    getLocation: getLocation,
    addLocation: addLocation,
    updateLocation: updateLocation,
    deleteLocation: deleteLocation
}