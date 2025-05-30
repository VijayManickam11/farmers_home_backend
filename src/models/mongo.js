"use strict";

const mongoose = require("mongoose");
const config = require("../../config/environment/dbDependencies");
const mongoosePaginate = require("mongoose-paginate");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const db = mongoose.connect(config.dbURL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const Schema = mongoose.Schema;
mongoose.set("debug", true);
let now;
mongoose.Promise = require("bluebird");

const TimezoneSchema = new Schema({
  timezone_uid: { type: String, required: true },
  timezone_name: { type: String, required: true },
  code: { type: String, required: true },
  zone_offset: { type: String, required: true },
  //in_use: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now },
});
TimezoneSchema.pre("save", function (next) {
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
  updated_at: { type: Date, required: true, default: Date.now },
});
CountrySchema.pre("save", function (next) {
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
  country_id: { type: Schema.Types.ObjectId, ref: "Country" },
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now },
});
StateSchema.pre("save", function (next) {
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
  country_id: { type: Schema.Types.ObjectId, ref: "Country" },
  state_id: { type: Schema.Types.ObjectId, ref: "State" },
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now },
});
CitySchema.pre("save", function (next) {
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
  gender: { type: String, enum: ["MALE", "FEMALE", "UN_SPECIFIED"] },
  user_name: { type: String },
  address: { type: String },
  zip_code: { type: String },
  profile_picture_path: { type: String },
  registration_mode: {
    type: String,
    enum: ["MANUAL", "SELF"],
    default: "SELF",
  },
  full_name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
  },
  mobile_number: {
    type: String,
    unique: true,
    required: true,
    match: [/^\d{10}$/, "Please fill a valid 10-digit mobile number"],
  },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  is_verified: { type: Boolean, default: false },
  is_mobile_verified: { type: Boolean, default: false },
  is_email_verified: { type: Boolean, default: false },
  reminder_count: { type: Number, default: 0 },
  last_login: { type: Date },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now },
});
UserSchema.pre("save", function (next) {
  now = new Date();
  this.updated_at = now;
  if (!this.created_at) {
    this.created_at = now;
  }
  next();
});
UserSchema.plugin(mongoosePaginate);

const UserOTPSchema = new Schema({
  otp_uid: { type: String, required: true },
  user_uid: { type: String, required: true },
  admin: { type: Schema.Types.ObjectId, ref: "Admin_User" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  employer: { type: Schema.Types.ObjectId, ref: "Employer" },
  otp: { type: Number },
  device_type_otp: {
    type: String,
    enum: ["EMAIL", "MOBILE", "ADMIN", "SUPER_ADMIN"],
  },
  type: {
    type: String,
    enum: ["REGISTER", "FORGOT_PASSWORD", "CHANGE_PASSWORD"],
  },
  user_type: { type: String, enum: ["CUSTOMER", "ADMIN", "SUPER_ADMIN"] },
  expire_at: { type: Date },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now },
});
UserOTPSchema.pre("save", function (next) {
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
  admin: { type: Schema.Types.ObjectId, ref: "Admin_User" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  employer: { type: Schema.Types.ObjectId, ref: "Employer" },
  user_type: { type: String, enum: ["CUSTOMER", "ADMIN", "SUPER_ADMIN"] },
  expire_at: { type: Date },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now },
});
SessionSchema.pre("save", function (next) {
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
  country: { type: Schema.Types.ObjectId, ref: "Country" },
  state_name: { type: String, required: true },
  state: { type: Schema.Types.ObjectId, ref: "State" },
  city_name: { type: String, required: true },
  city: { type: Schema.Types.ObjectId, ref: "City" },
  zip_code: { type: String },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now },
  created_by: { type: String },
  updated_by: { type: String },
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
});
LocationSchema.pre("save", function (next) {
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
  updated_at: { type: Date, required: true, default: Date.now },
});

WebhookEventSchema.pre("save", function (next) {
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
  user_type: { type: String, enum: ["CAREGIVER", "AGENCY", "ADMIN"] },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  Admin: { type: Schema.Types.ObjectId, ref: "Admin_User" },
  employer: { type: Schema.Types.ObjectId, ref: "Employer" },
  last_login: { type: Date },
  expired_in: { type: String, index: { expires: "1h" } },
  revoke: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now },
});
UserTokenSchema.pre("save", function (next) {
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
  unit: { type: String, default: "kg" },
  base64Image: { type: String, default: "" },
  is_available: { type: Boolean, default: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false }, // Added for soft deletion
  gst_rate: { type: Number, default: 0 }, // GST % e.g., 5, 12, 18
  eco_tax: { type: Number, default: 3 }, // Optional fixed ₹/unit
});

ProductSchema.pre("save", function (next) {
  now = new Date();
  this.updated_at = now;
  if (!this.created_at) {
    this.created_at = now;
  }
  next();
});

const CartSchema = new Schema({
  cart_uid: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1 },
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

CartSchema.pre("save", function (next) {
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
  updated_at: { type: Date, required: true, default: Date.now },
});

// const userSchema = new mongoose.Schema({
//     email: String,
//     password: String,
//     resetPasswordToken: String,
//     resetPasswordExpires: Date
// });

const registerSchema = new Schema({
  uid: { type: String, required: true, unique: true },
  full_name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
  },
  mobile_number: {
    type: String,
    unique: true,
    required: true,
    match: [/^\d{10}$/, "Please fill a valid 10-digit mobile number"],
  },
  user_address: { type: String, default: "" },
  user_district: { type: String, required: true},
  user_area: { type: String, default:""},
  user_pincode: { type: Number, required: true, 
        validate: {
      validator: function (v) {
        return /^\d{6}$/.test(v.toString());
      },
      message: props => `${props.value} is not a valid 6-digit pincode!`
    }
  },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  is_verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

const wishlistSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

wishlistSchema.pre("save", function (next) {
  now = new Date();
  this.updated_at = now;
  if (!this.created_at) {
    this.created_at = now;
  }
  next();
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [
    {
      name: { type: String },
      qty: { type: Number },
      image: { type: String },
      price: { type: Number },
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
    }
  ],
  shippingAddress: {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    phone: { type: String }
  },
  paymentMethod: { type: String },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  itemsPrice: { type: Number },
  shippingPrice: { type: Number },
  taxPrice: { type: Number },
  totalPrice: { type: Number },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date, default: Date.now },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date, default: Date.now }
}, { timestamps: true });

orderSchema.pre("save", function (next) {
  now = new Date();
  this.updated_at = now;
  if (!this.created_at) {
    this.created_at = now;
  }
  next();
});


const paymentSchema = new mongoose.Schema({
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    payment_verified: Boolean,
    paid_at: Date,
    amount: Number,
    currency: {
        type: String,
        default: 'INR'
    },
    customer_email: String,
    customer_mobile: String,
},
    {
        timestamps: true
    }
)

module.exports = {
  Timezone: mongoose.model("Timezone", TimezoneSchema),
  Country: mongoose.model("Country", CountrySchema),
  State: mongoose.model("State", StateSchema),
  City: mongoose.model("City", CitySchema),
  User: mongoose.model("User", UserSchema),
  UserOTP: mongoose.model("User_OTP", UserOTPSchema),
  Session: mongoose.model("Session", SessionSchema),
  Location: mongoose.model("Location", LocationSchema),
  WebhookEvent: mongoose.model("WebhookEvent", WebhookEventSchema),
  UserToken: mongoose.model("UserToken", UserTokenSchema),
  AuditLog: mongoose.model("AuditLog", auditLogSchema),
  Product: mongoose.model("Product", ProductSchema),
  Cart: mongoose.model("Cart", CartSchema),
  Register: mongoose.model("Register", registerSchema),
  Wishlist: mongoose.model("Wishlist", wishlistSchema),
    PaymentDetails: mongoose.model("PaymentDetails", paymentSchema),
  Order: mongoose.model("Order", orderSchema),
};
