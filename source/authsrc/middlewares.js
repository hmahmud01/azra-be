const { combine, timestamp, json, printf } = require("winston");
const winston = require("winston");
const { approveTransfer } = require("../controllers/balanceTransfer");
const timestampFormat = 'MMM-DD-YYYY HH:mm:ss';

const fs = require('fs');
let today = new Date().toISOString().split('T')[0]

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

function LogLater(filename, noduplicates, interval) {
    this.filename = filename || 'logs/LOG-'+( new Date().toISOString().slice(0,10) )+'.log';
    this.arr = [];
    this.timeout = false;
    this.interval = interval || 1000;
    this.noduplicates = noduplicates || true;
    this.onsavetimeout_bind = this.onsavetimeout.bind(this);
    this.lasttext = "";
    process.on('exit',()=>{ if(this.timeout)clearTimeout(this.timeout);this.timeout=false; this.save(); })
}

LogLater.prototype = {
    log: function log(text) {
        this.arr.push(text);
        if (!this.timeout) this.timeout = setTimeout(this.onsavetimeout_bind, this.interval);
    },
    text: function log(text, loglastline) {
        if (this.noduplicates) {
            if (this.lasttext === text) return;
            this.lastline = text;
        }
        this._log(text);
    },
    line: function log(text, loglastline) {
        if (this.noduplicates) {
            if (this.lasttext === text) return;
            this.lastline = text;
        }
        this._log(text + '\r\n');
    },
    dateline: function dateline(text) {
        if (this.noduplicates) {
            if (this.lasttext === text) return;
            this.lastline = text;
        }
        this._log(new Date().toLocaleString('en-BN', { timeZone: 'Asia/Dhaka' }).toString() + ' : ' + text + '\r\n');
    },
    onsavetimeout: function onsavetimeout() {
        this.timeout = false;
        this.save();
    },
    save: function save() { fs.appendFile(this.filename, this.arr.splice(0, this.arr.length).join(''), function(err) { if (err) console.log(err.stack) }); }
}

// module.exports = ;

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

const withdrawlogger = winston.createLogger({
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
      filename: `logs/withdraw/${today}-withdraw.log`
    })
  ]
})

const transferlogger = winston.createLogger({
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
      filename: `logs/transfer/${today}-transfer.log`
    })
  ]
})

const transferApprovallogger = winston.createLogger({
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
      filename: `logs/transfer/${today}-approvetransfer.log`
    })
  ]
})

const transferDeclinelogger = winston.createLogger({
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
      filename: `logs/transfer/${today}-deprovetransfer.log`
    })
  ]
})

const rechargeLivelogger = winston.createLogger({
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
      filename: `logs/recharge/${today}-ApiLive.log`
    })
  ]
})

const rechargeETSlogger = winston.createLogger({
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
      filename: `logs/recharge/${today}-ApiETS.log`
    })
  ]
})

const rechargeDulogger = winston.createLogger({
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
      filename: `logs/recharge/${today}-ApiDu.log`
    })
  ]
})

const rechargeRDYlogger = winston.createLogger({
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
      filename: `logs/recharge/${today}-ApiRDY.log`
    })
  ]
})

const rechargeEZLlogger = winston.createLogger({
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
      filename: `logs/recharge/${today}-ApiEZL.log`
    })
  ]
})

const numberLockLogger = winston.createLogger({
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
      filename: `logs/lockednumbers/${today}-numberlock.log`
    })
  ]
})

const accessLog = winston.createLogger({
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
      filename: `logs/${today}-access-log.log`
    })
  ]
})

module.exports = {
  isAuthenticated,
  logger,
  withdrawlogger,
  transferlogger,
  transferApprovallogger,
  transferDeclinelogger,
  rechargeLivelogger,
  rechargeETSlogger,
  rechargeDulogger,
  rechargeRDYlogger,
  rechargeEZLlogger,
  numberLockLogger,
  accessLog,
  LogLater
}
