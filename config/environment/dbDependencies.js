let ENV = 'LOCAL'; //DEV,QA,LIVE,UAT
if (ENV == 'LOCAL') {
    module.exports.dbPort = "27017";
    module.exports.dbURL = "mongodb://localhost/FarmerApp";
    module.exports.dbName = "FarmerApp";
}

