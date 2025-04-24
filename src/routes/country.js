const country = require("../controllers/country");
const session = require("../lib/session");
const { Router } = require("express");

const app = Router();

app.get("/country", session.isSessionAuthenticated, country);

module.exports = app;