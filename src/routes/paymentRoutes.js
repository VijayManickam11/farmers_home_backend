const { Router } = require("express");
const multer = require('multer');
const { createOrder, verifyPayment } = require('../controllers/payment');
const session = require('./session');

const app = Router();
const upload = multer();

app.post("/create-order", createOrder);
app.post("/verify", verifyPayment);


module.exports = app;