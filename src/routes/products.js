const multer = require("multer");
const products = require("../controllers/products");
const session = require("../lib/session");
const { Router } = require("express");

const app = Router();


// Multer config to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/product", upload.single('image_file'), products.createProducts);
app.put("/product/:product_uid", upload.single('image_file'), products.updateProduct);
app.get("/products", products.getAllProducts);
app.get("/product/:product_uid", products.getSingleProducts);
app.delete("/product/:product_uid", products.deleteProducts);


module.exports = app;