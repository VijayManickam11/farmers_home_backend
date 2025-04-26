const products = require("../controllers/products");
const session = require("../lib/session");
const { Router } = require("express");

const app = Router();

app.post("/products", products.createProducts);


module.exports = app;