const multer = require("multer");
const userRegister = require("../controllers/register");
const session = require("../lib/session");
const { Router } = require("express");

const app = Router();

const upload = multer();

app.post("/registerNew", upload.none(), userRegister)

module.exports = app;