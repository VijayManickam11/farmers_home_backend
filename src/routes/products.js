const products = require("../controllers/products");
const session = require("../lib/session");
const { Router } = require("express");

const app = Router();

app.post("/products", products.createProducts);
app.put("/products/:product_id", products.updateProduct);
app.get("/products", products.getAllProducts);
app.get("/products/:product_id", products.getSingleProducts);
app.delete("/products/:product_id", products.deleteProducts);


module.exports = app;