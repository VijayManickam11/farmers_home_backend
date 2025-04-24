const timeZone = require("../controllers/timeZone");
const session = require("../lib/session");
const { Router } = require("express");

const app = Router();

app.get("/timezone", session.isSessionAuthenticated, timeZone.getTimeZones);
app.post("/timezone", session.isSessionAuthenticated, timeZone.addTimeZones);

module.exports = app;