const multer = require("multer");
const whishlist = require("../controllers/whishlist");
const session = require("../lib/session");
const { Router } = require("express");

const app = Router();

app.post("/wishlist", whishlist.createWhishlist);
app.get("/wishlist/:userId", whishlist.getWhishlist);
app.delete("/wishlist", whishlist.deleteWhishlist);


module.exports = app;