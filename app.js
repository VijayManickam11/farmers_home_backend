//ExpressJS Requirments
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

//Server Configuration Requirements
const serverConfig = require("./config/environment/serverConfig");
const port = process.env.PORT || serverConfig.ServerPort;

//Router Requirements
const country = require("./src/routes/country");
const state = require("./src/routes/state");
const city = require("./src/routes/city");
const timeZone = require("./src/routes/timeZone");
const session = require("./src/routes/session");
const location = require("./src/routes/location");
const products = require("./src/routes/products");
const cart = require("./src/routes/cart");
const register = require("./src/routes/register");
const userLogin = require("./src/routes/login");
const whishlist = require("./src/routes/whishlist");
const order = require("./src/routes/order");

// New app using express module
const app = express();

app.use(cors());
// app.use(function (req, res, next) {
// 	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, x-auth-token, Authorization, x-api-key, Content-Type, Accept');
// 	res.header('Access-Control-Allow-Origin', '*');
// 	res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PUT,POST,DELETE');
// 	res.setHeader('X-Powered-By', 'Coffee')
// 	next();
// });

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({
	extended: true,
	limit: '10mb',
	parameterLimit: 50000
}));

//List of APIs
app.use(country);
app.use(state);
app.use(city);
app.use(timeZone);
app.use(session);
app.use(location);
app.use(products);
app.use(cart);
app.use(register);
app.use(userLogin);
app.use(order);

app.get('/', (req, res) =>
	res.json({ message: "Welcome to Farmer Application!!!" })
);

app.get('/api/v1/health', (req, res) => {
	res.json({ health: "API Server is up & running." })
});

app.get('/api/v1/greeting', (req, res) => {
	var name = req.query["name"];
	if (name == undefined || name.length <= 0) {
		name = "World";
	}
	res.json({ name: name + "." })
});

app.listen(port, () => {
	console.log("Server is running on http://localhost: " + port);
});
