let ENV = 'LOCAL'; //DEV,QA,LIVE,UAT
if (ENV == 'LOCAL') {
    module.exports.dbPort = "27017";
    module.exports.dbURL = "mongodb+srv://farmerapp:Test%40123@farmerapp.zsam2pt.mongodb.net/FarmerApp?retryWrites=true&w=majority";
    // module.exports.dbURL = "mongodb://localhost:27017/FarmerApp";
}

