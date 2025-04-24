const city = require("../controllers/city");
const session = require("../lib/session");
const { Router } = require("express");
const util = require('../lib/util')

const app = Router();

app.get("/city", session.isSessionAuthenticated, city);
app.get('/latlong', util.getLatLong);

module.exports = app;