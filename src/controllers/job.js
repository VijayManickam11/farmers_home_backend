const Timezone = require('../models/mongo').Timezone;
const Country = require('../models/mongo').Country;
const State = require('../models/mongo').State;
const City = require('../models/mongo').City;
const Question = require('../models/mongo').Question;
const Language = require('../models/mongo').Language;
const Job_Seeker = require('../models/mongo').Job_Seeker;
const Employer = require('../models/mongo').Employer;
const Job = require('../models/mongo').Job;
const JobSeekerAlert = require('../models/mongo').JobSeekerAlert;
const JobSeekerMatches = require('../models/mongo').JobSeekerMatches;
const EmployerAlert = require('../models/mongo').EmployerAlert;
const EmployerBillingPlan = require('../models/mongo').EmployerBillingPlan;
const Shortlisted_Candidate = require('../models/mongo').ShortlistedCandidate;

const Constants = require('../lib/constants');
const Util = require('../lib/util');

const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const _ = require('underscore');
const uuidv1 = require('uuid').v1;
const moment = require('moment');
const serverConfig = require("../../config/environment/serverConfig");



const createJob = async function (req, res) {
    var job_data = req.body;

    if (!job_data.employer_uid || !job_data.title) {
        res.status(Constants.BAD_REQUEST);
        return res.send({ type: Constants.ERROR_MSG, message: "Mandatory Data Missing" });
    }

    //VALIDATE UID
    let employer_db = await Employer.findOne({ employer_uid: job_data.employer_uid, is_deleted: false }).lean();
    if (!employer_db) {
        res.status(Constants.NOT_FOUND);
        return res.send({ type: Constants.ERROR_MSG, message: "Invalid UID" });
    }
    job_data.employer = employer_db._id;

    if (job_data.country_uid) {
        let ct_data = await Country.findOne({ country_uid: job_data.country_uid, is_deleted: false, is_active: true }).lean();
        if (!ct_data) {
            res.status(Constants.NOT_FOUND);
            return res.send({ type: Constants.ERROR_MSG, message: "Invalid Country UID" });
        }
        job_data.country_id = ct_data._id;
        job_data.country = ct_data.country_name;
    }

    if (job_data.state_uid) {
        let st_data = await State.findOne({ state_uid: job_data.state_uid, is_deleted: false, is_active: true }).lean();
        if (!st_data) {
            res.status(Constants.NOT_FOUND);
            return res.send({ type: Constants.ERROR_MSG, message: "Invalid State UID" });
        }
        job_data.state_id = st_data._id;
        job_data.state = st_data.state_name;
    }

    if (job_data.city_uid) {
        let cy_data = await City.findOne({ city_uid: job_data.city_uid, is_deleted: false, is_active: true }).lean();
        if (!cy_data) {
            res.status(Constants.NOT_FOUND);
            return res.send({ type: Constants.ERROR_MSG, message: "Invalid City UID" });
        }
        job_data.city_id = cy_data._id;
        job_data.city = cy_data.city_name;
    }

    if (job_data.predefined_languages && job_data.predefined_languages.length > 0) {
        let langs = _.pluck(job_data.predefined_languages, 'language_id');
        if (langs.length > 0) {
            let lang_db = await Language.find({ language_uid: { $in: langs } }).lean();
            if (lang_db && lang_db.length > 0) {
                let predefined_languages = [];
                _.each(lang_db, function (l) {
                    predefined_languages.push({
                        language_id: l._id,
                        language_name: l.language_name
                    })
                })
                job_data.predefined_languages = predefined_languages;
            }
        }
    }

    // if (job_seeker_data.predefined_questions && job_seeker_data.predefined_questions.length > 0) {
    //     let ques = _.pluck(job_seeker_data.predefined_questions, 'question_id');
    //     if (ques.length > 0) {
    //         let ques_db = await Question.find({ question_uid: { $in: ques }, type: 'DEFAULT' }).lean();
    //         if (ques_db && ques_db.length > 0) {
    //             let predefined_questions = [];
    //             _.each(ques_db, function (l) {
    //                 predefined_questions.push({
    //                     question_id: l._id,
    //                     question: l.question,
    //                     answer:""
    //                 })
    //             })
    //             job_seeker_data.predefined_questions = predefined_questions;
    //         }
    //     }
    // }
    job_data['job_uid'] = uuidv1();

    let saved_data = await Job(job_data).save();
    if (saved_data) {
        //CODE BLOCK FOR ALERT SCHEMA 
        const alertData = {
            alert_uid: uuidv1(),
            job: saved_data._id,
            users_viewed: [],
            created_at: new Date(),
            updated_at: new Date()
        };

        await JobSeekerAlert(alertData).save();
        findMatchingJobSeekers(saved_data, 'CREATE');

        res.status(Constants.SUCCESS);
        return res.send({ type: Constants.SUCCESS_MSG, message: Constants.CREATION_SUCCESS, data: { job_uid: saved_data.job_uid } });
    } else {
        return res.status(Constants.INTERNAL_ERROR).send({ type: Constants.ERROR_MSG, message: Constants.INTERNAL_SERVER_ERROR });
    }
}

const updateJob = async function (req, res) {
    let job_uid = req.params.job_uid;
    if (!job_uid) {
        res.status(Constants.BAD_REQUEST);
        return res.send({ type: Constants.ERROR_MSG, message: "Mandatory Data Missing" });
    }

    //VALIDATE UID
    let job_db = await Job.findOne({ job_uid: job_uid, is_active: true, is_deleted: false });
    if (!job_db) {
        res.status(Constants.NOT_FOUND);
        return res.send({ type: Constants.ERROR_MSG, message: "Invalid UID" });
    }

    let job_data = req.body;

    if (job_data.country_uid) {
        let ct_data = await Country.findOne({ country_uid: job_data.country_uid, is_deleted: false, is_active: true }).lean();
        if (!ct_data) {
            res.status(Constants.NOT_FOUND);
            return res.send({ type: Constants.ERROR_MSG, message: "Invalid Country UID" });
        }
        job_data.country_id = ct_data._id;
        job_data.country = ct_data.country_name;
    }

    if (job_data.state_uid) {
        let st_data = await State.findOne({ state_uid: job_data.state_uid, is_deleted: false, is_active: true }).lean();
        if (!st_data) {
            res.status(Constants.NOT_FOUND);
            return res.send({ type: Constants.ERROR_MSG, message: "Invalid State UID" });
        }
        job_data.state_id = st_data._id;
        job_data.state = st_data.state_name;
    }

    if (job_data.city_uid) {
        let cy_data = await City.findOne({ city_uid: job_data.city_uid, is_deleted: false, is_active: true }).lean();
        if (!cy_data) {
            res.status(Constants.NOT_FOUND);
            return res.send({ type: Constants.ERROR_MSG, message: "Invalid City UID" });
        }
        job_data.city_id = cy_data._id;
        job_data.city = cy_data.city_name;
    }

    if (job_data.predefined_languages && job_data.predefined_languages.length > 0) {
        let langs = _.pluck(job_data.predefined_languages, 'language_id');
        if (langs.length > 0) {
            let lang_db = await Language.find({ language_uid: { $in: langs } }).lean();
            if (lang_db && lang_db.length > 0) {
                let predefined_languages = [];
                _.each(lang_db, function (l) {
                    predefined_languages.push({
                        language_id: l._id,
                        language_name: l.language_name
                    })
                })
                job_data.predefined_languages = predefined_languages;
            }
        }
    }

    // if (job_seeker_data.predefined_questions && job_seeker_data.predefined_questions.length > 0) {
    //     let ques = _.pluck(job_seeker_data.predefined_questions, 'question_id');
    //     if (ques.length > 0) {
    //         let ques_db = await Question.find({ question_uid: { $in: ques }, type: 'DEFAULT' }).lean();
    //         if (ques_db && ques_db.length > 0) {
    //             let predefined_questions = [];
    //             _.each(ques_db, function (l) {
    //                 predefined_questions.push({
    //                     question_id: l._id,
    //                     question: l.question,
    //                     answer:""
    //                 })
    //             })
    //             job_seeker_data.predefined_questions = predefined_questions;
    //         }
    //     }
    // }

    let keys_to_omit_in_update = ['job_uid', 'created_at', 'is_active', 'is_deleted', 'in_use', 'created_by'];
    job_data = _.omit(job_data, keys_to_omit_in_update);
    job_db = _.extend(job_db, job_data);

    let updated_data = await job_db.save();
    if (updated_data) {
        findMatchingJobSeekers(updated_data, 'UPDATE');

        return res.send({
            type: Constants.SUCCESS_MSG,
            message: Constants.UPDATION_SUCCESS
        });
    } else {
        res.status(Constants.INTERNAL_ERROR);
        return res.send({
            type: Constants.ERROR_MSG,
            message: Constants.INTERNAL_SERVER_ERROR
        })

    }
}

const getJobs = async function (req, res) {

    let page = req.params.page || req.body.page || req.query.page || 1;
    let count = req.params.count || req.body.count || req.query.count || 10;

    let sort = req.params.sort || req.body.sort || req.query.sort || "DESC";
    let sort_by = req.params.sort_by || req.body.sort_by || req.query.sort_by || "created_at";

    let sort_value = {};

    if (sort == "ASC") {
        sort_value[sort_by] = 1
    } else {
        sort_value[sort_by] = -1
    }

    let query_filter = { is_deleted: false };
    let options = {
        select: "-_id -city_id -state_id -country_id -password",
        lean: true,
        page: Number(page),
        limit: Number(count),
        sort: sort_value,
        populate: [
            { path: 'predefined_languages.language_id', select: '-_id' },
            { path: 'employer', select: '-_id -password -city_id -state_id -country_id' }
        ]
    }

    let filter = {
        keyword: req.query["filter.keyword"],
        language: req.query["filter.language"],
        city: req.query["filter.city"],
        state: req.query["filter.state"],
        zip_code: req.query["filter.zip_code"],
        employer: req.query["filter.employer"],
        address: req.query["filter.address"],
        preferred_gender: req.query["filter.preferred_gender"],
        experience_with: req.query["filter.experience_with"],
        filter_keywords: req.query["filter_keywords"],

    }

    if (filter['experience_with']) {
        filter['experience_with'] = filter['experience_with'].split(',')
        query_filter["predefined_questions"] = {
            //"$elemMatch": { question: filter['experience_with'], answer: "YES" }
            "$elemMatch": { filter_keyword: { $in: filter['experience_with'] }, answer: "YES" }
        }
    }

    if (filter['keyword']) {
        filter['keyword'] = filter['keyword'].replace(/[+]/g, "");
        //filter['keyword'] = filter['keyword'].split(',')
        query_filter['$or'] = [
            {
                "title": { '$regex': filter.keyword, '$options': 'i' }
            }, {
                "comments": { '$regex': filter.keyword, '$options': 'i' }
            }
        ]

    }

    if (filter['language']) {
        filter['language'] = filter['language'].split(',')
        let lang_db = await Language.find({ language_uid: { $in: filter['language'] } }, "_id").lean();
        var lang_ids = _.pluck(lang_db, '_id')
        query_filter["predefined_languages"] = {
            "$elemMatch": { language_id: { '$in': lang_ids } }
        };

    }

    if (filter['state']) {
        query_filter['state'] = { '$regex': filter['state'], '$options': 'i' }
    }

    if (filter['city']) {
        if (filter['city'].indexOf(',') > -1) {
            filter['city'] = filter['city'].split(',');
            query_filter['city'] = { '$in': filter['city'] }
        } else {
            query_filter['city'] = { '$regex': filter['city'], '$options': 'i' }
        }
    }

    if (filter['address']) {
        query_filter['address'] = { '$regex': filter['address'], '$options': 'i' }
    }

    if (filter['status']) {
        if (filter['status'] == 'Active') {
            query_filter['is_active'] = true
        } else if (filter['status'] == 'Inactive') {
            query_filter['is_active'] = false
        }

    }

    if (filter['zip_code']) {
        query_filter['zip_code'] = { '$regex': filter['zip_code'], '$options': 'i' }

    }

    if (filter['preferred_gender']) {
        query_filter['preferred_gender'] = filter['preferred_gender']

    }

    if (filter['employer']) {
        let employer_db = await Employer.findOne({ employer_uid: filter['employer'], is_deleted: false }).lean();
        if (!employer_db) {
            res.status(Constants.NOT_FOUND);
            return res.send({ type: Constants.ERROR_MSG, message: "Invalid UID" });
        } else {
            query_filter['employer'] = employer_db._id;
        }
    }
    let filter_keywords = [];
    if (filter['filter_keywords']) {
        let qf = { is_deleted: false };
        let job_db = await Job.find(qf).lean();
        if (job_db && job_db.length > 0) {
            _.each(job_db, function (job) {
                if (job.predefined_questions) {
                    _.each(job.predefined_questions, function (question) {
                        filter_keywords.push(question.filter_keyword);
                    })
                }
                if (job.additional_questions) {
                    _.each(job.additional_questions, function (question) {
                        filter_keywords.push(question.filter_keyword);
                    })
                }
            });
        }
    }

    Job.paginate(query_filter, options).then(async function (jobs, err) {
        if (err) {
            res.status(Constants.INTERNAL_ERROR);
            return res.send({
                type: Constants.ERROR_MSG,
                message: Constants.INTERNAL_SERVER_ERROR
            })
        } else {
            return res.send({
                type: Constants.SUCCESS_MSG,
                data: jobs.docs,
                total_records: jobs.total,
                current_page: jobs.page,
                total_pages: jobs.pages,
                filter_keywords:_.uniq(filter_keywords)
            });
        }
    })

}

const getJobDetails = async function (req, res) {

    let job_uid = req.params.job_uid;
    if (!job_uid) {
        res.status(Constants.BAD_REQUEST);
        return res.send({ type: Constants.ERROR_MSG, message: "Mandatory Data Missing" });
    }

    let options = {
        populate: [
            { path: 'country_id', select: '-_id' },
            { path: 'city_id', select: '-_id' },
            { path: 'state_id', select: '-_id' },
            { path: 'predefined_languages.language_id', select: '-_id', match: { is_deleted: false } },
            { path: 'employer', select: '-_id -password -city_id -state_id -country_id' }
        ]
    }

    //VALIDATE UID
    let job_db = await Job.findOne({ job_uid: job_uid, is_active: true, is_deleted: false }, "-_id", options).lean();
    if (!job_db) {
        res.status(Constants.NOT_FOUND);
        return res.send({ type: Constants.ERROR_MSG, message: "Invalid UID" });
    }

    return res.send({
        type: Constants.SUCCESS_MSG,
        data: job_db
    });



}

const deleteJob = async function (req, res) {
    let job_uid = req.params.job_uid;
    if (!job_uid) {
        res.status(Constants.BAD_REQUEST);
        return res.send({ type: Constants.ERROR_MSG, message: "Mandatory Data Missing" });
    }

    //VALIDATE UID
    let job_db = await Job.findOne({ job_uid: job_uid, is_active: true, is_deleted: false });
    if (!job_db) {
        res.status(Constants.NOT_FOUND);
        return res.send({ type: Constants.ERROR_MSG, message: "Invalid UID" });
    }
    job_db['is_deleted'] = true;

    let updated_data = await job_db.save();
    if (updated_data) {

        const job_id = updated_data._id;
        await JobSeekerAlert.updateMany({ job: job_id }, { $set: { is_deleted: true } });
        await EmployerAlert.updateMany({job: job_id }, { $set: { is_deleted: true }});
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

async function findMatchingJobSeekers(job, type) {
  
    //CHECK IF EMPLOYER PLAN HAS ALERT FOR AIDES ENABLED
    let plan = await EmployerBillingPlan.findOne({ employer: job.employer, end_date: { $gte: moment() } }).lean();
    if (plan && plan.plan_detail && plan.plan_detail.search_aides_with_geolocation) {
        let has_geo_query = false;
        let query_filter = { is_deleted: false, certificate_status: "VERIFIED", $or: [ {is_email: true }, { mobile_number: true}] }; 
        query_filter['$or'] = [];
        //CHECK IF EMPLOYER HAS GEO LOCATION SEARCH IN HIS PLAN
        if (plan.plan_detail && plan.plan_detail.search_aides_with_geolocation) {
            if (job.city && !job.zip_code) {
                let lat_long = await Util.getLatLong(job.city);
                if (lat_long && lat_long['lat'] && lat_long['lng']) {
                    query_filter['$or'].push({
                        geo_cordinates: {
                            $nearSphere: [lat_long.lng, lat_long.lat],
                            $minDistance: Number(0),
                            $maxDistance: Number(Constants.GEO_RADIUS / 3963.2)
                        }
                    })
                    has_geo_query = true;
                }
            }
            // if (job.state) {

            // }
            if (job.zip_code) {
                let lat_long = await Util.getLatLong(job.zip_code);
                if (lat_long && lat_long['lat'] && lat_long['lng']) {
                    query_filter['$or'].push({
                        geo_cordinates: {
                            $nearSphere: [lat_long.lng, lat_long.lat],
                            $minDistance: Number(0),
                            $maxDistance: Number(Constants.GEO_RADIUS / 3963.2)
                        }
                    })
                    has_geo_query = true;
                }
            }
        } else {
            if (job.city) {
                query_filter['$or'].push({ city: { '$regex': job.city, '$options': 'i' } });
            }
            if (job.state) {
                query_filter['$or'].push({ state: { '$regex': job.state, '$options': 'i' } });
            }
            if (job.zip_code) {
                query_filter['$or'].push({ zip_code: { '$regex': job.zip_code, '$options': 'i' } });
            }
        }
        if (!has_geo_query) {
            if (job.address) {
                query_filter['$or'].push({ address: { '$regex': job.address, '$options': 'i' } });
            }
            if (job.predefined_languages && job.predefined_languages.length > 0) {
                let lang_names = _.pluck(job.predefined_languages, 'language_name')
                query_filter['$or'].push({
                    predefined_languages: {
                        $elemMatch: { language_name: { $in: lang_names } }
                    }
                })
            }
            if (job.preferred_gender) {
                query_filter['$or'].push({ gender: job.preferred_gender })
            }
            if (job.predefined_questions && job.predefined_questions.length > 0) {
                let filter_keywords = _.pluck(job.predefined_questions, 'filter_keyword')
                query_filter['$or'].push({
                    predefined_questions: {
                        $elemMatch: { filter_keyword: { $in: filter_keywords } }
                    }
                })
            }
            if (job.additional_questions && job.additional_questions.length > 0) {
                let filter_keywords = _.pluck(job.additional_questions, 'filter_keyword')
                query_filter['$or'].push({
                    additional_questions: {
                        $elemMatch: { filter_keyword: { $in: filter_keywords } }
                    }
                })
            }
            if (job.available_days && job.available_days.length > 0) {
                let avl_days = _.pluck(job.available_days, 'day')
                query_filter['$or'].push({
                    available_days: {
                        $elemMatch: { day: { $in: avl_days }, availability: true }
                    }
                })
            }
        }

        if (query_filter['$or'] && query_filter['$or'].length == 0) {
            query_filter = _.omit(query_filter, '$or');
        }
        let job_seekers = await Job_Seeker.find(query_filter).lean();
        //COMMENTED BY VASU FOR RECENT CHANGES BY CLINET 
        // if (job_seekers && job_seekers.length == 0 && has_geo_query) {
        //     //INCASE IF NO MATCHES ARE FOUND VIA GEO QUERY, SEARCH AGAIN
        //     let new_query = { is_deleted: false, certificate_status: "VERIFIED" };
        //     new_query['$or'] = [];
        //     if (job.city) {
        //         new_query['$or'].push({ city: { '$regex': job.city, '$options': 'i' } });
        //     }
        //     if (job.state) {
        //         new_query['$or'].push({ state: { '$regex': job.state, '$options': 'i' } });
        //     }
        //     if (job.zip_code) {
        //         new_query['$or'].push({ zip_code: { '$regex': job.zip_code, '$options': 'i' } });
        //     }
        //     if (job.address) {
        //         new_query['$or'].push({ address: { '$regex': job.address, '$options': 'i' } });
        //     }
        //     if (job.predefined_languages && job.predefined_languages.length > 0) {
        //         let lang_names = _.pluck(job.predefined_languages, 'language_name')
        //         new_query['$or'].push({
        //             predefined_languages: {
        //                 $elemMatch: { language_name: { $in: lang_names } }
        //             }
        //         })
        //     }
        //     if (job.preferred_gender) {
        //         new_query['$or'].push({ gender: job.preferred_gender })
        //     }
        //     if (job.predefined_questions && job.predefined_questions.length > 0) {
        //         let filter_keywords = _.pluck(job.predefined_questions, 'filter_keyword')
        //         new_query['$or'].push({
        //             predefined_questions: {
        //                 $elemMatch: { filter_keyword: { $in: filter_keywords } }
        //             }
        //         })
        //     }
        //     if (job.additional_questions && job.additional_questions.length > 0) {
        //         let filter_keywords = _.pluck(job.additional_questions, 'filter_keyword')
        //         new_query['$or'].push({
        //             additional_questions: {
        //                 $elemMatch: { filter_keyword: { $in: filter_keywords } }
        //             }
        //         })
        //     }
        //     if (job.available_days && job.available_days.length > 0) {
        //         let avl_days = _.pluck(job.available_days, 'day')
        //         new_query['$or'].push({
        //             available_days: {
        //                 $elemMatch: { day: { $in: avl_days }, availability: true }
        //             }
        //         })
        //     }
        //     if (new_query['$or'] && new_query['$or'].length == 0) {
        //         new_query = _.omit(new_query, '$or');
        //     }
        //     job_seekers = await Job_Seeker.find(new_query).lean();
        // }
        if (job_seekers && job_seekers.length > 0) {
            //DELETE MATCHING SEEKERS IF ANY
            let matches = await JobSeekerMatches.findOne({
                job: job._id,
                employer: job.employer
            });
            if (matches) {
                matches['is_deleted'] = true;
                matches.save();
            }
            let match_array = {
                match_uid: uuidv1(),
                job: job._id,
                employer: job.employer
            };
            let matching_seekers = [];
            _.each(job_seekers, function (j) {
                matching_seekers.push({
                    job_seeker: j._id
                })
            })
            match_array['job_seekers'] = matching_seekers;
            let saved_match = await JobSeekerMatches(match_array).save();

            //SAVE IN EMPLOYER ALERT
            
            if (matching_seekers.length > 0) {
                let employer_alert = {
                    alert_uid: uuidv1(),
                    alert_type: 'JOB_SEEKER_MATCHES',
                    match: saved_match._id,
                    job: job._id,
                    employer: job.employer,
                    alert_message: "Found " + matching_seekers.length + " care givers who may be a match to your requirement - " + job.title
                }

                await EmployerAlert(employer_alert).save();
                //SEND EMAIL TO EMPLOYER
                const matchingAlertTemplate = fs.readFileSync(path.join(__dirname, "../lib/email_templates/employer_matches_alert.html")).toString();
                const matchingAlertTemplateCompiled = handlebars.compile(matchingAlertTemplate);
                let employer_db = await Employer.findOne({ _id: job.employer, is_deleted: false }).lean();
                const emailBody = matchingAlertTemplateCompiled({
                    employer_name: employer_db.employer_name,
                    no_of_matches: matching_seekers.length,
                    base_url: serverConfig.base_url
                });

                //LOG ENNTRY
                let log = await Util.logEntry(employer_db.email, saved_match, "You have caregivers matching your job posts");
            } else {
                console.log("No matching caregivers found. Further execution blocked.");
                let log = await Util.logEntry(employer_db.email, saved_match, "No matching caregivers found. Further execution blocked.");

            }   
          //SAVE COUNT IN JOB
            job['no_of_matches'] = matching_seekers.length;
            job.save();
        } else {
            if (type == 'UPDATE') {
                //DELETE MATCHING SEEKERS IF ANY
                let matches = await JobSeekerMatches.findOne({
                    job: job._id,
                    employer: job.employer
                });
                if (matches) {
                    matches['is_deleted'] = true;
                    matches.save();
                }
                job['no_of_matches'] = 0;
                job.save();
            }
       }
    }
}

const getMatchingJobSeekers = async function (req, res) {
    let job_uid = req.params.job_uid;
    if (!job_uid) {
        res.status(Constants.BAD_REQUEST);
        return res.send({ type: Constants.ERROR_MSG, message: "Mandatory Data Missing" });
    }

    let job_db = await Job.findOne({ job_uid: job_uid, is_active: true, is_deleted: false }).lean();
    if (!job_db) {
        res.status(Constants.NOT_FOUND);
        return res.send({ type: Constants.ERROR_MSG, message: "Invalid UID" });
    }

    if (job_db.no_of_matches > 0) {
        let options = {
            populate: [
                { path: 'job_seekers.job_seeker', select: '-city_id -state_id -country_id -password' }
            ]
        }
        let matches_db = await JobSeekerMatches.findOne({ job: job_db._id, is_active: true, is_deleted: false }, "-_id -job -employer", options).lean();
        //GET SHORTLISTED CANDIDATES FOR THE EMPLOYER
        let employee_shortlisted = await Shortlisted_Candidate.find({ is_deleted: false, employer: job_db.employer }).lean();
        if (employee_shortlisted && employee_shortlisted.length > 0) {
            _.each(matches_db.job_seekers, function (j) {
                let _s = _.find(employee_shortlisted, function (s) {
                    return (String(s.job_seeker) == String(j.job_seeker._id));
                })
                if (_s) {
                    j['job_seeker']['is_shortlisted'] = true;
                    j['job_seeker']['shortlisted_uid'] = _s.shortlisted_uid;
                } else {
                    j['job_seeker']['is_shortlisted'] = false;
                    j['job_seeker']['shortlisted_uid'] = null;
                }
                j = _.omit(j['job_seeker'], '_id');
            })
        } else {
            _.each(matches_db.job_seekers, function (j) {
                j['job_seeker']['is_shortlisted'] = false;
                j['job_seeker']['shortlisted_uid'] = null;
                j = _.omit(j['job_seeker'], '_id');
            })

        }
        return res.send({ type: Constants.SUCCESS_MSG, data: matches_db || {} });

    } else {
        return res.send({ type: Constants.SUCCESS_MSG, message: "No Matching Care Givers at the moment.", data: {} });
    }

}

const refreshMatchingJobSeekers = async function (req, res) {
    let job_uid = req.params.job_uid;
    if (!job_uid) {
        res.status(Constants.BAD_REQUEST);
        return res.send({ type: Constants.ERROR_MSG, message: "Mandatory Data Missing" });
    }

    let job_db = await Job.findOne({ job_uid: job_uid, is_active: true, is_deleted: false });
    if (!job_db) {
        res.status(Constants.NOT_FOUND);
        return res.send({ type: Constants.ERROR_MSG, message: "Invalid UID" });
    }
    await findMatchingJobSeekers(job_db, 'UPDATE');
    return res.send({
        type: Constants.SUCCESS_MSG,
        message: Constants.CREATION_SUCCESS
    });
}

const getOpenJobs =  async function(req, res) {

    let page = req.params.page || req.body.page || req.query.page || 1;
    let count = req.params.count || req.body.count || req.query.count || 10;

    let sort = req.params.sort || req.body.sort || req.query.sort || "DESC";
    let sort_by = req.params.sort_by || req.body.sort_by || req.query.sort_by || "created_at";

    let sort_value = {};

    if (sort == "ASC") {
        sort_value[sort_by] = 1
    } else {
        sort_value[sort_by] = -1
    }

    let query_filter = { is_deleted: false };
    let options = {
        select: "-_id -city_id -state_id -country_id -password",
        lean: true,
        page: Number(page),
        limit: Number(count),
        sort: sort_value,
        populate: [
            { path: 'predefined_languages.language_id', select: '-_id' },
            { path: 'employer', select: '-_id -password -city_id -state_id -country_id' }
        ]
    }

    let filter = {
        keyword: req.query["filter.keyword"],
        language: req.query["filter.language"],
        city: req.query["filter.city"],
        state: req.query["filter.state"],
        zip_code: req.query["filter.zip_code"],
        employer: req.query["filter.employer"],
        address: req.query["filter.address"],
        preferred_gender: req.query["filter.preferred_gender"],
        experience_with: req.query["filter.experience_with"]
    }

    if (filter['experience_with']) {
        filter['experience_with'] = filter['experience_with'].split(',')
        query_filter["predefined_questions"] = {
            //"$elemMatch": { question: filter['experience_with'], answer: "YES" }
            "$elemMatch": { filter_keyword: { $in: filter['experience_with'] }, answer: "YES" }
        }
    }

    if (filter['keyword']) {
        filter['keyword'] = filter['keyword'].replace(/[+]/g, "");
        //filter['keyword'] = filter['keyword'].split(',')
        query_filter['$or'] = [
            {
                "title": { '$regex': filter.keyword, '$options': 'i' }
            }, {
                "comments": { '$regex': filter.keyword, '$options': 'i' }
            }
        ]

    }

    if (filter['language']) {
        filter['language'] = filter['language'].split(',')
        let lang_db = await Language.find({ language_uid: { $in: filter['language'] } }, "_id").lean();
        var lang_ids = _.pluck(lang_db, '_id')
        query_filter["predefined_languages"] = {
            "$elemMatch": { language_id: { '$in': lang_ids } }
        };

    }

    if (filter['state']) {
        query_filter['state'] = { '$regex': filter['state'], '$options': 'i' }
    }

    if (filter['city']) {
        if (filter['city'].indexOf(',') > -1) {
            filter['city'] = filter['city'].split(',');
            query_filter['city'] = { '$in': filter['city'] }
        } else {
            query_filter['city'] = { '$regex': filter['city'], '$options': 'i' }
        }
    }

    if (filter['address']) {
        query_filter['address'] = { '$regex': filter['address'], '$options': 'i' }
    }

    if (filter['status']) {
        if (filter['status'] == 'Active') {
            query_filter['is_active'] = true
        } else if (filter['status'] == 'Inactive') {
            query_filter['is_active'] = false
        }

    }

    if (filter['zip_code']) {
        query_filter['zip_code'] = { '$regex': filter['zip_code'], '$options': 'i' }

    }

    if (filter['preferred_gender']) {
        query_filter['preferred_gender'] = filter['preferred_gender']

    }

    if (filter['employer']) {
        let employer_db = await Employer.findOne({ employer_uid: filter['employer'], is_deleted: false }).lean();
        if (!employer_db) {
            res.status(Constants.NOT_FOUND);
            return res.send({ type: Constants.ERROR_MSG, message: "Invalid UID" });
        } else {
            query_filter['employer'] = employer_db._id;
        }
    }

    Job.paginate(query_filter, options).then(async function (jobs, err) {
        if (err) {
            res.status(Constants.INTERNAL_ERROR);
            return res.send({
                type: Constants.ERROR_MSG,
                message: Constants.INTERNAL_SERVER_ERROR
            })
        } else {
            return res.send({
                type: Constants.SUCCESS_MSG,
                data: jobs.docs,
                total_records: jobs.total,
                current_page: jobs.page,
                total_pages: jobs.pages
            });
        }
    })


}

module.exports = {
    createJob: createJob,
    updateJob: updateJob,
    getJobDetails: getJobDetails,
    getJobs: getJobs,
    deleteJob: deleteJob,
    getMatchingJobSeekers: getMatchingJobSeekers,
    refreshMatchingJobSeekers: refreshMatchingJobSeekers,
    getOpenJobs: getOpenJobs
}