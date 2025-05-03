"use strict";

const mongoose = require('mongoose');
const config = require('../../config/environment/dbDependencies');
const mongoosePaginate = require('mongoose-paginate');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const db = mongoose.connect(config.dbURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});
const Schema = mongoose.Schema;
mongoose.set('debug', true);
let now;
mongoose.Promise = require('bluebird');

const TimezoneSchema = new Schema({
    timezone_uid: { type: String, required: true },
    timezone_name: { type: String, required: true },
    code: { type: String, required: true },
    zone_offset: { type: String, required: true },
    //in_use: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
});
TimezoneSchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

const CountrySchema = new Schema({
    country_uid: { type: String, required: true },
    country_name: { type: String, required: true },
    code: { type: String, required: true },
    //in_use: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
});
CountrySchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

const StateSchema = new Schema({
    state_uid: { type: String, required: true },
    state_name: { type: String, required: true },
    code: { type: String },
    country_id: { type: Schema.Types.ObjectId, ref: 'Country' },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
});
StateSchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

const CitySchema = new Schema({
    city_uid: { type: String, required: true },
    city_name: { type: String, required: true },
    code: { type: String },
    country_id: { type: Schema.Types.ObjectId, ref: 'Country' },
    state_id: { type: Schema.Types.ObjectId, ref: 'State' },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
});
CitySchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

const UserSchema = new Schema({
    user_uid: { type: String, required: true },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'UN_SPECIFIED'] },
    full_name: { type: String },
    user_name: { type: String },
    address: { type: String },
    zip_code: { type: String },
    profile_picture_path: { type: String },
    email: { type: String },
    password: { type: String },
    mobile_number: { type: String },
    registration_mode: { type: String, enum: ['MANUAL', 'SELF'], default: 'SELF' },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    is_verified: { type: Boolean, default: false },
    is_mobile_verified: { type: Boolean, default: false },
    is_email_verified: { type: Boolean, default: false },
    reminder_count: {type: Number, default: 0 },
    last_login: { type: Date },
    created_by: { type: String },
    updated_by: { type: String },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
});
UserSchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});
UserSchema.plugin(mongoosePaginate);

const JobSchema = new Schema({
    job_uid: { type: String, required: true },
    employer: { type: Schema.Types.ObjectId, ref: 'Employer' },
    country_id: { type: Schema.Types.ObjectId, ref: 'Country' },
    state_id: { type: Schema.Types.ObjectId, ref: 'State' },
    city_id: { type: Schema.Types.ObjectId, ref: 'City' },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    title: { type: String, required: true },
    comments: { type: String },
    address: { type: String },
    zip_code: { type: String },
    preferred_gender: { type: String },
    predefined_languages: [{
        language_id: { type: Schema.Types.ObjectId, ref: 'Language' },
        language_name: { type: String }
    }],
    predefined_questions: [{
        question_id: { type: Schema.Types.ObjectId, ref: 'Question' },
        question: { type: String },
        filter_keyword: { type: String },
        answer: { type: String }
    }],
    additional_questions: [{
        question_id: { type: Schema.Types.ObjectId, ref: 'Question' },
        question: { type: String },
        answer: { type: String },
        filter_keyword: { type: String }
    }],
    available_days: [{
        day: { type: String },
        availability: { type: Boolean }
    }],
    no_of_matches: { type: Number, default: 0 },
    in_use: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    created_by: { type: String },
    updated_by: { type: String },
    no_of_hours_per_day: { type: String },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
})
JobSchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});
JobSchema.plugin(mongoosePaginate);

const UserOTPSchema = new Schema({
    otp_uid: { type: String, required: true },
    user_uid: { type: String, required: true },
    admin: { type: Schema.Types.ObjectId, ref: 'Admin_User' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    employer: { type: Schema.Types.ObjectId, ref: 'Employer' },
    otp: { type: Number },
    device_type_otp: { type: String, enum: ['EMAIL', 'MOBILE', 'ADMIN', 'SUPER_ADMIN'] },
    type: { type: String, enum: ['REGISTER', 'FORGOT_PASSWORD', 'CHANGE_PASSWORD'] },
    user_type: { type: String, enum: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'] },
    expire_at: { type: Date },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }

})
UserOTPSchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

const SessionSchema = new Schema({
    session_uid: { type: String, required: true },
    session_key: { type: String, required: true },
    user_uid: { type: String, required: true },
    admin: { type: Schema.Types.ObjectId, ref: 'Admin_User' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    employer: { type: Schema.Types.ObjectId, ref: 'Employer' },
    user_type: { type: String, enum: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'] },
    expire_at: { type: Date },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }

})
SessionSchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

//Location Schema
const LocationSchema = new Schema({
    location_uid: { type: String, required: true },
    country_name: { type: String, required: true },
    country: { type: Schema.Types.ObjectId, ref: 'Country' },
    state_name: { type: String, required: true },
    state: { type: Schema.Types.ObjectId, ref: 'State' },
    city_name: { type: String, required: true },
    city: { type: Schema.Types.ObjectId, ref: 'City' },
    zip_code: { type: String },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now },
    created_by: { type: String },
    updated_by: { type: String },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false }
})
LocationSchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

LocationSchema.plugin(mongoosePaginate);


const WebhookEventSchema = new Schema({
    event_id: { type: String, required: true },
    event_type: { type: String, required: true },
    event_body: { type: Object, required: true },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
});

WebhookEventSchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

WebhookEventSchema.plugin(mongoosePaginate);

const UserTokenSchema = new Schema({
    token_uid: { type: String },
    token: { type: String },
    user_type: { type: String, enum: ['CAREGIVER', 'AGENCY', 'ADMIN'] },
    user: { type: Schema.Types.ObjectId, ref: 'User'}, 
    Admin: { type: Schema.Types.ObjectId, ref: 'Admin_User'},   
    employer: { type: Schema.Types.ObjectId, ref: 'Employer' }, 
    last_login: { type: Date },
    expired_in: { type: String, index: { expires: '1h' } },
    revoke: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
});
UserTokenSchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

UserTokenSchema.plugin(mongoosePaginate);

// farming Prodect Models Start

const ProductSchema = new Schema({
    product_uid: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    discount_price: { type: Number },
    stock: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    image_url: { type: String },
    is_available: { type: Boolean, default: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false }  // Added for soft deletion
  });

  ProductSchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

const auditLogSchema = new Schema({
    timestamp: { type: Date, default: Date.now },
    log_subject: { type: String },
    user: { type: String },
    response: Object,
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
});


// Export the schema to register with MongoDB
module.exports = {
    Timezone: mongoose.model('Timezone', TimezoneSchema),
    Country: mongoose.model('Country', CountrySchema),
    State: mongoose.model('State', StateSchema),
    City: mongoose.model('City', CitySchema),
    User: mongoose.model('User', UserSchema),
    Job: mongoose.model('Job', JobSchema),
    UserOTP: mongoose.model('User_OTP', UserOTPSchema),
    Session: mongoose.model('Session', SessionSchema),
    Location: mongoose.model('Location', LocationSchema),
    WebhookEvent: mongoose.model('WebhookEvent', WebhookEventSchema),
    UserToken: mongoose.model('UserToken', UserTokenSchema),
    AuditLog: mongoose.model('AuditLog', auditLogSchema),
    Product: mongoose.model('Product',ProductSchema)
}
