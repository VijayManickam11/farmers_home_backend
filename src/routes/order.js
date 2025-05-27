const multer = require("multer");
const order = require("../controllers/order");
const session = require("../lib/session");
const { Router } = require("express");

const app = Router();

app.post('/order', order.addOrder);
app.get('/orders', order.getMyOrders);
app.get("/order/:order_id", order.getOrderById);
app.put("/payorder/:order_id", order.updateOrderToPaid);
app.put("order_deliver/:order_id/", order.updateOrderToDelivered);

module.exports = app;