const multer = require("multer");
const whishlist = require("../controllers/whishlist");
const session = require("../lib/session");
const { Router } = require("express");

const app = Router();

app.post("/wishlist", whishlist.createWhishlist);
app.get("/wishlist/:user_uid", whishlist.getWhishlist);
app.delete("/wishlist", whishlist.deleteWhishlist);
app.get("/selecetdwishlist/:user_uid", whishlist.getSelecetdWhishlist);


module.exports = app;