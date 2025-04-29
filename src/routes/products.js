const products = require("../controllers/products");
const session = require("../lib/session");
const { Router } = require("express");

const app = Router();

app.post("/product", products.createProducts);
app.put("/product/:product_uid", products.updateProduct);
app.get("/products", products.getAllProducts);
app.get("/product/:product_uid", products.getSingleProducts);
app.delete("/product/:product_uid", products.deleteProducts);


module.exports = app;