const cart = require("../controllers/cart");
const session = require("../lib/session");
const { Router } = require("express");

const app = Router();

app.post("/cart", cart.createCart);
app.put("/cart/:cart_uid", cart.updateCart);
app.get("/carts", cart.getAllCart);
app.get("/cart/:cart_uid", cart.getSingleCart);
app.delete("/cart/:cart_uid", cart.deleteCart);


module.exports = app;