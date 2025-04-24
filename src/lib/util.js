
const emailValidator = require('deep-email-validator');
const { Client } = require("@googlemaps/google-maps-services-js");
const Constants = require('./constants');
// const kickbox = require('kickbox').client(apiConfig_kb.kickboxApiKey_test).kickbox();
const axios = require('axios');
// const apiConfig_tinyURL = require('../../config/environment/smsConfig');
const AuditLog = require('../models/mongo').AuditLog;

const user = require('../lib/session');
const isEmailValid = async function (email) {
  return await emailValidator.validate(email)
}

//Method One Kickbox Email Validation 

// function verifyEmailExistence(email) {
//   return new Promise((resolve, reject) => {
//     kickbox.verify(email, (error, response) => {
//       if (error) {
//         console.error('Error checking email existence:', error);
//         reject(new Error(Constants.INTERNAL_SERVER_ERROR));
//       } else {
//         if (response.body.result !== 'deliverable') {
//           reject(new Error('Invalid Email existence'));
//         } else {
//           resolve();
//         }
//       }
//     });
//   });
// }

//Method two bouncify email validation 

// function isbouncifyEmailValid(email) {
//   return new Promise((resolve, reject) => {
//     axios
//       .get('https://api.bouncify.io/v1/verify', {
//         params: {
//           apikey: apiConfig_bf.bouncifyAPIKey,
//           email: email,
//         },
//       })
//       .then(response => {
//         //console.log(response);
//         if (response.data.result !== 'deliverable') {
//           reject(new Error('Invalid Email existence'));
//         } else {
//           resolve();
//         }

//       })
//       .catch(error => {
//         reject(error);
//       });
//   });
// }

const getLatLong = async function (user_address) {
    try {
      const client = new Client({});
      let result = await client.geocode({
        params: {
          address: user_address,
          key: Constants.GOOGLE_MAPS_API_KEY,
        },
        timeout: 1000, // milliseconds
      });
    // Check if the API response status is "OK" and the expected data exists
    if (result.data.status === 'OK' && result.data.results[0].geometry) {
      const location = result.data.results[0].geometry.location;
      console.log(location);
      return location;
    } else {
      console.log('Invalid or missing response data');
      return {};
    }
  } catch (e) {
    console.log(e);
    return {};
  }
}
function isMobileValid(number) {
    const cleanedNumber = number.replace(/\D/g, '');
  if (cleanedNumber.length === 10) {
    return true; 
  } else {
    return false;
  }
}


const validateZipCode = async function (zip_code) {
  const apiKey = Constants.GOOGLE_MAPS_API_KEY;
  const apiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

  try {
    const response = await axios.get(apiUrl, {
      params: {
        address: zip_code,
        components: 'country:US',
        key: apiKey
      }
    });

    const data = response.data;
   // console.log(data);
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      if ('partial_match' in result) {
      //  console.log("ZipCode Invalid");
        return false; // Zip code is invalid
      } else {
       // console.log("ZipCode is Valid");
        return true; // Zip code is valid 
      }
    }
    return false; // Zip code is invalid if there is no result or status is not 'OK'    
  } catch (error) {
    console.error(error);
    return false;
  }
};

//Log File

async function logEntry(user, response, subject) {
  try {
    const logEntry = new AuditLog({
    log_subject: subject,
    timestamp: new Date(),
    user: user,
    response: response,
    });
    await logEntry.save(); 
  } catch (error) {
    console.error('Error while logging:', error);
  }
}




module.exports = {
  isEmailValid: isEmailValid,
  getLatLong: getLatLong,
  isMobileValid:isMobileValid,
  validateZipCode:validateZipCode,
  logEntry: logEntry,
}