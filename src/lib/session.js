const axios = require("axios");
const jwt = require("jsonwebtoken");
const Constants = require("../lib/constants");
const accessKey = require("../../config/environment/generalConfig");

const User = require("../models/mongo").User;
const Employer = require("../models/mongo").Employer;
const Admin_User = require("../models/mongo").Admin_User;
const UserToken = require("../models/mongo").UserToken;

module.exports = {
  isSessionAuthenticated: async function (req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
      res.status(Constants.UNAUTHORIZED);
      return res.send({
        type: Constants.ERROR_MSG,
        invalid_auth_token: true,
        message: "Missing auth token",
      });
    }
    try {
      const decoded = jwt.verify(token, accessKey.ACCESS_TOKEN_SECERT);

      const user = await UserToken.findOne({
        token: token,
        is_active: true,
        revoke: false,
      });

      if (!user) {
        res.status(Constants.UNAUTHORIZED);
        return res.send({
          type: Constants.ERROR_MSG,
          invalid_auth_token: true,
          message: "Invalid Token or Token expired",
        });
      }

      let user_db = await User.findOne({ user_uid: decoded.user.user_uid });
      if (!user_db) {
        res.status(Constants.UNAUTHORIZED);
        return res.send({
          type: Constants.ERROR_MSG,
          message: "User not found",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(Constants.UNAUTHORIZED);
      return res.send({
        type: Constants.ERROR_MSG,
        invalid_auth_token: true,
        message: "Invalid auth token",
        error,
      });
    }
  },
};
