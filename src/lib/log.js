const AuditLog = require('../models/mongo').AuditLog;

async function logEntry(user, response, subject) {
  try {
    const logEntry = new AuditLogEntry({
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

module.exports = logEntry; 
