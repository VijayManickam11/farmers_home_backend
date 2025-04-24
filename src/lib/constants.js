/* STORE ALL THE CONSTANTS HERE */

/*HTTP CODES*/
exports.BAD_REQUEST = 400;
exports.VALIDATION_ERROR = 412;
exports.NOT_FOUND = 404;
exports.NOT_ALLOWED = 405;
exports.INTERNAL_ERROR = 500;
exports.BAD_GATEWAY = 502;
exports.SUCCESS = 200;
exports.CREATED = 201;
exports.ACCEPTED = 202;
exports.CONFLICT = 409;
exports.UNAUTHORIZED = 401;
exports.FORBIDDEN = 403;
exports.TOO_LARGE = 413;
exports.REDIRECT = 302;
exports.PAYMENT_REQUIRED = 402;
exports.EXPIRED = 498;

/*Response Messages*/
exports.SUCCESS_MSG = "success";
exports.ERROR_MSG = "error";
exports.DB_ERROR = "Database Error";
exports.INTERNAL_SERVER_ERROR = "Internal Server Error";
exports.ERR_CREATING = "Error in Creating";
exports.ERR_FETCHING = "Error in Fetching";
exports.ERR_UPDATING = "Error in Updating";
exports.ERR_DELETING = "Error in Deleting";
exports.CREATION_SUCCESS = "Created Successfully";
exports.DELETION_SUCCESS = "Deleted Successfully";
exports.UPDATION_SUCCESS = "Updated Successfully";

exports.EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
exports.GEO_RADIUS = 25; //miles
exports.SEARCH_LIMIT = 25;
exports.ALPHA_NUMERIC_REGEX = /^[a-z0-9_.]+$/i;
exports.GOOGLE_MAPS_API_KEY = 'AIzaSyC9g3ARc52hDWqRTZmmSowCEYPBRiXct5Y';
exports.kickboxApiKey = 'live_3ef4a5d560b7a9cef2844c15f424042a2408c6d98c8c407f2cd3c9b5a4719bbc';
exports.kickboxApiKey_test = 'test_f153e05796f6180d0198ba172371085a02124914d0c3176df3a6abf36938aa80';
exports.bouncifyAPIKey = 'uyigre1sdtvkeub2l0vfu8g722kpgjfj';
exports.REMIND_BEFORE = 5;
exports.ACCESS_TOKEN_SECERT = "FarmerApp@123";
exports.CRYPTO_JS_SECRET = "FarmerApp_CRYPTO_JS@1011"


//PAYMENT 
exports.DIRECT_API_PAYMENT_SUCCESS = "Subscription Payment has been successful";
exports.DIRECT_API_PAYMENT_FAILD = "Subscription Payment has been faild";
exports.DIRECT_API_DUPLICATE_TRANSACTION = "Duplicate transaction. Please try again.";
exports.DIRECT_API_INVALID_CUSTOMER_VAULT_ID = "Invalid Customer Vault ID specified. Please check your information.";


