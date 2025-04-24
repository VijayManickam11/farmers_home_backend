const AuditLog = require('../models/mongo').AuditLog;
const axios = require('axios');
const { AllEmail, BulkMessage } = require('../models/mongo');
const uuidv1 = require('uuid').v1;

const LogEntry = {
    //ENTRY LOG FOR EMAIL SERVICES 
        logEntry: async function (user, response, subject) {
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
      },

      bulkLogEntry: async function (log_data) {

        try {
          let save_db;

          if(log_data.user == "user"){
            save_db = { user: log_data.delivered }
          } else {
            save_db = { employer: log_data.delivered }
          }

          save_db = {...save_db,
            message_uid: uuidv1(),
            // email_sid: "",
            subject: log_data.subject || "",
            message: log_data.message,
            delivered: log_data.delivered.length,
            un_delivered: log_data.un_delivered,
            un_verified_users: log_data.un_verified_users,
            trigger: log_data.trigger
          }
          console.log(save_db,"recipient_job_seeker")
          const logEntry = new BulkMessage(save_db);
          await logEntry.save(); 
        } catch (error) {
          console.error('Error while logging:', error);
        }
      },

  };


  
  module.exports = LogEntry;