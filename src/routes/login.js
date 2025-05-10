const multer = require("multer");
const session = require("../lib/session");
const { Router } = require("express");
const userLogin = require("../controllers/login");

const app = Router();

app.post("/userLogin", userLogin)

module.exports = app;