const location = require("../controllers/location");
const session = require("../lib/session");
const { Router } = require("express");

const app = Router();

app.get("/location", session.isSessionAuthenticated, location.getLocation);
app.post("/location", session.isSessionAuthenticated, location.addLocation);
app.put("/location/:location_uid", session.isSessionAuthenticated, location.updateLocation);
app.delete("/location/:location_uid", session.isSessionAuthenticated, location.deleteLocation);


module.exports = app;