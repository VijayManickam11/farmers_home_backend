const Timezone = require("../models/mongo").Timezone;
const User = require("../models/mongo").User;
const User_Otp = require("../models/mongo").UserOTP;
const City = require("../models/mongo").City;
const State = require("../models/mongo").State;
const Country = require("../models/mongo").Country;
const UserToken = require("../models/mongo").UserToken;

const Constants = require("../lib/constants");
const Util = require("../lib/util");

const ServerConfig = require("../../config/environment/serverConfig");
const accessKey = require("../../config/environment/generalConfig");

const bcrypt = require("bcrypt-nodejs");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const uuidv1 = require("uuid").v1;
const moment = require("moment");
const _ = require("underscore");

const jwt = require("jsonwebtoken");

const apiConfig = require("../../config/environment/generalConfig");

const CryptoJS = require("crypto-js");

const register = async function (req, res) {
  let email = req.body.email;
  let full_name = req.body.full_name;
  let password = req.body.key;
  let mobile_number = req.body.mobile_number;
  let accessToken;

  const req_data = req.body;

  if (!email && !mobile_number && !password && !full_name ) {
    res.status(Constants.BAD_REQUEST);
    return res.send({
      type: Constants.ERROR_MSG,
      message: "Mandatory Data Missing",
    });
  }

  // if (email) {
  //   email = email.toLowerCase();
  //   let email_regex = Constants.EMAIL_REGEX;
  //   email = email.replace(/^\s+|\s+$/g, "");
  //   // user_name = user_name ? user_name.replace(/^\s+|\s+$/g, "") : null;
  //   // mobile_number = mobile_number
  //   //   ? mobile_number.replace(/^\s+|\s+$/g, "")
  //   //   : null;
  //   let is_email = await Util.isEmailValid(email);

  //   if (!email_regex.test(email)) {
  //     //|| !is_email.valid) {
  //     res.status(Constants.BAD_REQUEST);
  //     return res.send({ type: Constants.ERROR_MSG, message: "Invalid Email" });
  //   }
  // }

  // //Mobile Number Validation if available
  // if (mobile_number) {
  //   let is_mobile = await Util.isMobileValid(mobile_number);
  //   if (!is_mobile) {
  //     res.status(Constants.BAD_REQUEST);
  //     return res.send({ type: Constants.ERROR_MSG, message: "Invalid Mobile" });
  //   }
  // }

  //CHECK EMAIL UNIQUENESS
  let query = { is_deleted: false };

  if (email && mobile_number) {
    query["$or"] = [{ email: email }, { mobile_number: mobile_number }];
  } else if (email) {
    query["email"] = email;
  } else if (mobile_number) {
    query["mobile_number"] = mobile_number;
  } else {
    res.status(Constants.BAD_REQUEST);
    return res.send({
      type: Constants.ERROR_MSG,
      message: "Mandatory Data Missing",
    });
  }

  //CHECK REGISTER WITH NOT VERFIED OR RE-REGISTER
  let re_register_email = await User.findOne({
    email: email,
    is_deleted: false,
    is_verified: false,
  }).lean();

  if (re_register_email) {
    deleted_existing_user = await User.findOneAndUpdate(
      { email: email, is_deleted: false },
      { $set: { is_deleted: true } }
    );
  }

  let re_register_mobile_number = await User.findOne({
    mobile_number: mobile_number,
    is_deleted: false,
    is_verified: false,
  }).lean();

  if (re_register_mobile_number) {
    deleted_existing_user = await User.findOneAndUpdate(
      { mobile_number: mobile_number, is_deleted: false },
      { $set: { is_deleted: true } }
    );
  }

  //CHECK DUPLICATE EMAIL AND MOBILE NUMBER
  let duplicate_user_email = null;
  let duplicate_user_mobile = null;

  if (email) {
    duplicate_user_email = await User.findOne({
      email: email,
      is_verified: true,
      is_deleted: false,
    }).lean();
  }
  if (mobile_number) {
    duplicate_user_mobile = await User.findOne({
      mobile_number: mobile_number,
      is_verified: true,
      is_deleted: false,
    }).lean();
  }

  if (
    (email || mobile_number) &&
    (duplicate_user_email || duplicate_user_mobile)
  ) {
    res.status(Constants.CONFLICT);
    return res.send({
      type: Constants.ERROR_MSG,
      message: "Email/Mobile Number is already registered",
      email_not_available: !!duplicate_user_email,
      mobile_not_available: !!duplicate_user_mobile,
    });
  }

  //ADD USER TO DB
  let user_data = {
    user_uid: uuidv1(),
    email: email,
    full_name: user_name,
    mobile_number: mobile_number || null,
    address: req_data.address || "",
  };

  let saved_data = await User(user_data).save();

  var mobileOtp = 1234;  // Math.floor(1000 + Math.random() * 9000);
  var emailOtp = 4321;  //Math.floor(1000 + Math.random() * 9000);

  let otpSentToMobile = false;
  let otpSentToEmail = false;

  // Send OTP to mobile number if provided
  // if (mobile_number) {
  //   await User_Otp.create({
  //     otp_uid: uuidv1(),
  //     user_uid: saved_data.user_uid,
  //     otp: mobileOtp,
  //     device_type_otp: "MOBILE",
  //     mobile_number: mobile_number,
  //     user_type: "CUSTOMER",
  //     user: saved_data._id,
  //     type: "REGISTER",
  //     expire_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  //   });
  // }

  // Send OTP to email if provided
  // if (email) {
  //   await User_Otp.create({
  //     otp_uid: uuidv1(),
  //     user_uid: saved_data.user_uid,
  //     otp: emailOtp,
  //     device_type_otp: "EMAIL",
  //     email: email,
  //     user_type: "CUSTOMER",
  //     user: saved_data._id,
  //     type: "REGISTER",
  //     expire_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  //   });
  // }

  let otpStatusMessage = "Registered successfully";
  //   if ((!otpSentToMobile && mobile_number) || (!otpSentToEmail && email)) {
  //     otpStatusMessage = "Error sending OTP via ";
  //     if (!otpSentToMobile && mobile_number) {
  //       otpStatusMessage += "SMS";
  //     }
  //     if (!otpSentToEmail && email) {
  //       if (!otpSentToMobile && mobile_number) {
  //         otpStatusMessage += " and ";
  //       }
  //       otpStatusMessage += "Email";
  //     }
  //   }

  res.status(Constants.SUCCESS);
  return res.send({
    type: Constants.SUCCESS_MSG,
    accessToken: accessToken,
    message: `${Constants.CREATION_SUCCESS}. ${otpStatusMessage}`,
    data: { user_uid: saved_data.user_uid },
  });
};

const login = async function (req, res) {
  let user_identifier =
    req.body.email || req.body.mobile_number || req.body.user_name;

  let password = req.body.password;
  let accessToken;

  if (!user_identifier || !password) {
    res.status(Constants.BAD_REQUEST);
    return res.send({
      type: Constants.ERROR_MSG,
      message: "Mandatory Data Missing",
    });
  }

  if (user_identifier) {
    user_identifier = user_identifier;
  }

  let user_db = await User.findOne({
    $or: [
      { email: user_identifier.toLowerCase() },
      { mobile_number: user_identifier },
      { user_name: user_identifier },
    ],
    is_deleted: false,
  }).lean();

  if (!user_db) {
    res.status(Constants.NOT_FOUND);
    return res.send({
      type: Constants.ERROR_MSG,
      invalid_user_name: true,
      message: "Invalid Email, Mobile Number, or User Name",
    });
  }

  if (!user_db.is_active) {
    res.status(Constants.UNAUTHORIZED);
    return res.send({
      message: "Sorry, your account is inactive. Please contact admin.",
      type: Constants.ERROR_MSG,
    });
  }

  if (user_db.password) {
    var is_password_correct = bcrypt.compareSync(
      password,
      user_db.password
    );
    if (!is_password_correct) {
      res.status(Constants.UNAUTHORIZED);
      return res.send({
        message: "Invalid Credentials",
        invalid_password: true,
        type: Constants.ERROR_MSG,
      });
    }
    //JWT Obtain the Access token from JWT
    accessToken = jwt.sign(
      {
        user: {
          user_uid: user_db.user_uid,
          user_email: user_db.email,
          user_mobile: user_db.mobile_number,
          user_type: "CUSTOMER",
        },
      },
      accessKey.ACCESS_TOKEN_SECERT,
      { expiresIn: accessKey.EXPIRES_IN }
    );

    // SAVE TOKEN IN DB
    current_time = new Date();
    let store_last_login = await User.updateOne(
      { _id: user_db._id },
      { last_login: current_time }
    );
    let save_user_session = await UserToken.create({
      token_uid: uuidv1(),
      token: accessToken,
      user_type: "CUSTOMER",
      user: user_db._id,
      last_login: current_time,
      expired_in: accessKey.EXPIRES_IN,
    });

  } else {
    res.status(Constants.NOT_FOUND);
    return res.send({
      type: Constants.ERROR_MSG,
      invalid_password: true,
      message: "Invalid Credentials",
    });
  }

  if (user_db.is_verified) {
    // If the user is not verified, and checking if it's a mobile number and update is_mobile_verified accordingly
    if (user_db.mobile_number === user_identifier) {
      if (user_db.is_mobile_verified) {
        return res.send({
          type: Constants.SUCCESS_MSG,
          message: "Login Successful",
          data: {
            accessToken: accessToken,
            user_uid: user_db.user_uid,
          },
        });
      } else {
        res.status(Constants.UNAUTHORIZED);
        return res.send({
          message: "Mobile number is not verified",
          type: Constants.ERROR_MSG,
          is_verified: user_db.is_verified,
          is_email_verified: user_db.is_email_verified,
          is_mobile_verified: user_db.is_mobile_verified,
          registration_mode: user_db.registration_mode,
          user_uid: user_db.user_uid,
        });
      }
    } else if (user_db.email === user_identifier.toLowerCase()) {
      if (user_db.is_email_verified) {
        return res.send({
          type: Constants.SUCCESS_MSG,
          message: "Login Successful",
          data: {
            accessToken: accessToken,
            user_uid: user_db.user_uid,
          },
        });
      } else {
        res.status(Constants.UNAUTHORIZED);
        return res.send({
          message: "Email is not verified",
          type: Constants.ERROR_MSG,
          is_verified: user_db.is_verified,
          is_email_verified: user_db.is_email_verified,
          is_mobile_verified: user_db.is_mobile_verified,
          registration_mode: user_db.registration_mode,
          user_uid: user_db.user_uid,
        });
      }
    } else {
      res.status(Constants.UNAUTHORIZED);
      return res.send({
        message: "Email OTP verification is Pending",
        type: Constants.ERROR_MSG,
        is_verified: user_db.is_verified,
        is_email_verified: user_db.is_email_verified,
        is_mobile_verified: user_db.is_mobile_verified,
        registration_mode: user_db.registration_mode,
        user_uid: user_db.user_uid,
      });
    }
  } else {
    res.status(Constants.NOT_FOUND);
    return res.send({
      type: Constants.ERROR_MSG,
      message: "Verification is Pending",
      is_verified: user_db.is_verified,
      is_email_verified: user_db.is_email_verified,
      is_mobile_verified: user_db.is_mobile_verified,
      registration_mode: user_db.registration_mode,
      user_uid: user_db.user_uid,
    });
  }
};

const logout = async function (req, res) {
  const token = req.headers.authorization;
  if (token) {
    let revoke_toke = await User.updateOne(
      { token: token },
      { revoke: true }
    );
    return res.status(Constants.SUCCESS).send({
      type: Constants.SUCCESS_MSG,
      message: "Logout Successful",
    });
  } else {
    return res.status(Constants.BAD_REQUEST).send({
      type: Constants.ERROR_MSG,
      message: "Token not provided",
    });
  }
};

const verifyOtp = async function (req, res) {
  let otp = req.params.otp || req.body.otp || req.query.otp;
  let email = req.params.email || req.body.email || req.query.email;
  let user_data = req.body;
  let accessToken;

  let type = req.body.otp_type || "REGISTER";

  if (!otp) {
    res.status(Constants.BAD_REQUEST);
    return res.send({
      message: "OTP is Mandatory",
      type: Constants.ERROR_MSG,
    });
  }

  if (!email) {
    res.status(Constants.BAD_REQUEST);
    return res.send({
      message: "Email is Missing",
      type: Constants.ERROR_MSG,
    });
  }

  let user_db = await User.findOne({
    email: email,
    is_deleted: false,
  });

  if (!user_db) {
    res.status(Constants.NOT_FOUND);
    return res.send({ type: Constants.ERROR_MSG, message: "Invalid Email" });
  }

  let otp_details = await User_Otp.findOne({
    user_uid: user_db.user_uid,
    otp: otp,
    user_type: "CUSTOMER",
    is_active: true,
    type: type,
    device_type_otp: "EMAIL",
  });

  if (!otp_details) {
    res.status(Constants.BAD_REQUEST);
    return res.send({
      message: "Invalid OTP",
      type: Constants.ERROR_MSG,
    });
  }

  if (otp_details.expires_at < new Date()) {
    otp_details.delete();
    res.status(Constants.EXPIRED);
    return res.send({
      type: Constants.ERROR_MSG,
      message: "OTP Expired",
    });
  }

  otp_details.is_active = false;
  otp_details.save();

  user_db.is_verified = true;
  user_db.is_email_verified = true;
  let update_data = user_db.save();

  if (update_data) {
    if (user_data.register_access_token) {
      accessToken = jwt.sign(
        {
          user: {
            user_uid: user_db.user_uid,
            user_email: user_db.email,
            user_mobile: user_db.mobile_number,
            user_type: "CUSTOMER",
          },
        },
        accessKey.ACCESS_TOKEN_SECERT,
        { expiresIn: accessKey.EXPIRES_IN }
      );

      //SAVE TOKEN TO DB
      let save_user_session = await UserToken.create({
        token_uid: uuidv1(),
        token: accessToken,
        user_type: "CUSTOMER",
        user: user_db._id,
        expired_in: accessKey.EXPIRES_IN,
      });
    }
  }

  return res.send({
    type: Constants.SUCCESS_MSG,
    message: "OTP Verified Successfully",
    accessToken: accessToken,
    data: { user_uid: user_db.user_uid },
  });
};

const verifyMobileOtp = async function (req, res) {
  let otp = req.params.mobileOtp || req.body.mobileOtp || req.query.mobileOtp;
  let mobile_number =
    req.params.mobile_number ||
    req.body.mobile_number ||
    req.query.mobile_number;
  let user_data = req.body;
  let accessToken;

  let type = req.body.otp_type || "REGISTER";

  if (!otp) {
    res.status(Constants.BAD_REQUEST);
    return res.send({
      message: "OTP is Mandatory",
      type: Constants.ERROR_MSG,
    });
  }

  if (!mobile_number) {
    res.status(Constants.BAD_REQUEST);
    return res.send({
      message: "Mobile number is Missing",
      type: Constants.ERROR_MSG,
    });
  }

  let user_db = await User.findOne({
    mobile_number: mobile_number,
    is_deleted: false,
  });

  if (!user_db) {
    res.status(Constants.NOT_FOUND);
    return res.send({
      type: Constants.ERROR_MSG,
      message: "Invalid Mobile Number",
    });
  }

  let otp_details = await User_Otp.findOne({
    user_uid: user_db.user_uid,
    otp: otp,
    user_type: "CUSTOMER",
    is_active: true,
    device_type_otp: "MOBILE",
  });

  if (!otp_details) {
    res.status(Constants.BAD_REQUEST);
    return res.send({
      message: "Invalid OTP",
      type: Constants.ERROR_MSG,
    });
  }

  if (otp_details.expires_at < new Date()) {
    otp_details.delete();
    res.status(Constants.EXPIRED);
    return res.send({
      type: Constants.ERROR_MSG,
      message: "OTP Expired",
    });
  }

  otp_details.is_active = false;
  otp_details.save();

  user_db.is_verified = true;
  user_db.is_mobile_verified = true;
  let update_data = user_db.save();

  if (update_data) {
    if (user_data.register_access_token) {
      accessToken = jwt.sign(
        {
          user: {
            user_uid: user_db.user_uid,
            user_email: user_db.email,
            user_mobile: user_db.mobile_number,
            user_type: "CUSTOMER",
          },
        },
        accessKey.ACCESS_TOKEN_SECERT,
        { expiresIn: accessKey.EXPIRES_IN }
      );

      //SAVE TOKEN TO DB
      let save_user_session = await UserToken.create({
        token_uid: uuidv1(),
        token: accessToken,
        user_type: "CUSTOMER",
        user: user_db._id,
        expired_in: accessKey.EXPIRES_IN,
      });
    }
  }

  return res.send({
    type: Constants.SUCCESS_MSG,
    message: "Mobile OTP Verified Successfully",
    accessToken: accessToken,
    data: { user_uid: user_db.user_uid },
  });
};

const resendOTP = async function (req, res) {
  let email = req.body.email;
  let mobile_number = req.body.mobile_number;
  let user_name = req.body.full_name;
  let type = req.body.otp_type || req.body.type || "REGISTER";
  let user_uid_previous = req.body.user_uid;

  if (!email && !mobile_number) {
    res.status(Constants.BAD_REQUEST);
    return res.send({
      type: Constants.ERROR_MSG,
      message: "Mandatory Data Missing",
    });
  }

  let user_db;

  if (email) {
    let email_regex = Constants.EMAIL_REGEX;
    if (!email_regex.test(email)) {
      res.status(Constants.BAD_REQUEST);
      return res.send({ type: Constants.ERROR_MSG, message: "Invalid Email" });
    }
    // CHECK EMAIL UNIQUENESS
    user_db = await User.findOne({
      $or: [{ email: email }, { user_uid: user_uid_previous }],
      is_deleted: false,
    }).lean();
    if (!user_db) {
      res.status(Constants.CONFLICT);
      return res.send({
        type: Constants.ERROR_MSG,
        message: "Email is not registered",
      });
    }
    if (!user_name) {
      user_name = user_db.user_name;
    }
  }

  if (mobile_number) {
    // let mobile_regex = Constants.MOBILE_REGEX;
    // if (!mobile_regex.test(mobile_number)) {
    //     res.status(Constants.BAD_REQUEST);
    //     return res.send({ type: Constants.ERROR_MSG, message: "Invalid Mobile Number" });
    // }

    // CHECK MOBILE NUMBER UNIQUENESS

    user_db = await User.findOne({
      $or: [{ mobile_number: mobile_number }, { user_uid: user_uid_previous }],
      is_deleted: false,
    }).lean();

    if (!user_db) {
      res.status(Constants.CONFLICT);
      return res.send({
        type: Constants.ERROR_MSG,
        message: "Mobile Number is not registered",
      });
    }
    if (!user_name) {
      user_name = user_db.user_name;
    }
  }

  if (user_uid_previous) {
    const user_db = await User.findOne({
      user_uid: user_uid_previous,
      is_deleted: false,
    });
    if (!user_db) {
      return res
        .status(Constants.NOT_FOUND)
        .send({ type: Constants.ERROR_MSG, message: "User not found" });
    }

    let duplicateQuery = { is_deleted: false };

    if (email) {
      duplicateQuery.email = email;
    }
    if (mobile_number) {
      duplicateQuery.mobile_number = mobile_number;
    }
    // Exclude the current user from the duplicate check
    duplicateQuery.user_uid = { $ne: user_uid_previous };
    let duplicateUser = await User.findOne(duplicateQuery);

    if (duplicateUser) {
      return res.status(Constants.CONFLICT).send({
        type: Constants.ERROR_MSG,
        message: "Email or mobile number is already registered as Customer",
        is_duplicate_email: email ? !!duplicateUser.email : false,
        is_duplicate_mobile: mobile_number
          ? !!duplicateUser.mobile_number
          : false,
      });
    }

    let duplicateEmployer = await Employer.findOne(duplicateQuery);
    if (duplicateEmployer) {
      return res.status(Constants.CONFLICT).send({
        type: Constants.ERROR_MSG,
        message: "Email or mobile number is already registered as Agency",
        is_duplicate_email: email ? !!duplicateEmployer.email : false,
        is_duplicate_mobile: mobile_number
          ? !!duplicateEmployer.mobile_number
          : false,
      });
    }

    let updateField = {};
    if (email) {
      updateField.email = email;
    }
    if (mobile_number) {
      updateField.mobile_number = mobile_number;
    }
    // Update the user document in the DB
    await User.findOneAndUpdate(
      { user_uid: user_uid_previous, is_deleted: false },
      { $set: updateField }
    );

    let otp_details = await User_Otp.findOne({
      user_uid: user_uid_previous,
      user_type: "CUSTOMER",
      is_active: true,
      type: type,
    });

    if (otp_details) {
      otp_details.is_active = false;
      await otp_details.save();
    }
  }
  // DELETE OLD OTP
  await User_Otp.updateMany(
    { user_uid: user_db.user_uid, is_active: true },
    { $set: { is_active: false } }
  );

  // SEND OTP VIA MOBILE
  var otp = 1234;  // Math.floor(1000 + Math.random() * 9000);
  let sms_sent = false;
  if (mobile_number) {
    sms_sent = true;
    if (sms_sent) {
      // STORE OTP FOR VERIFICATION
      await User_Otp.create({
        otp_uid: uuidv1(),
        user_uid: user_db.user_uid,
        otp: otp,
        device_type_otp: "MOBILE",
        mobile_number: mobile_number,
        user_type: "CUSTOMER",
        user: user_db._id,
        type: type,
        expire_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });
    }
  }

  // SEND OTP VIA EMAIL
  let email_sent = false;
  if (email) {
   
    email_sent = false;

    if (email_sent) {
      // STORE OTP FOR VERIFICATION
      await User_Otp.create({
        otp_uid: uuidv1(),
        user_uid: user_db.user_uid,
        otp: otp,
        device_type_otp: "EMAIL",
        email: email,
        user_type: "CUSTOMER",
        user: user_db._id,
        type: type,
        expire_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });
    }
  }

  let _responseMsg = "resend OTP has failed";
  if (email_sent || sms_sent) {
    _responseMsg = "resend OTP has been sent";
  }

  res.status(Constants.SUCCESS);
  return res.send({ type: Constants.SUCCESS_MSG, message: _responseMsg });
};

module.exports = {
  register: register,
  login: login,
  logout: logout,
  verifyOtp: verifyOtp,
  verifyMobileOtp: verifyMobileOtp,
  resendOTP: resendOTP,
};
