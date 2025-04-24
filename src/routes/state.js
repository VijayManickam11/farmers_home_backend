const state = require("../controllers/states");
const session = require("../lib/session");
const { Router } = require("express");

const app = Router();

app.get("/state", session.isSessionAuthenticated, state);

module.exports = app;