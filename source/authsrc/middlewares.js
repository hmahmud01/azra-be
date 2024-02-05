const { combine, timestamp, json, printf } = require("winston");
const winston = require("winston")
const timestampFormat = 'MMM-DD-YYYY HH:mm:ss';

function isAuthenticated(req, res, next) {
    const { authorization } = req.headers;
  
    if (!authorization) {
      res.status(401);
      throw new Error('🚫 Un-Authorized 🚫');
    }
  
    try {
      const token = authorization.split(' ')[1];
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.payload = payload;
    } catch (err) {
      res.status(401);
      if (err.name === 'TokenExpiredError') {
        throw new Error(err.name);
      }
      throw new Error('🚫 Un-Authorized 🚫');
    }
  
    return next();
  }


let today = new Date().toISOString().split('T')[0]
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: `logs/${today}-applog.log`
    })
  ]
})
  
  module.exports = {
      isAuthenticated,
      logger
  }
  