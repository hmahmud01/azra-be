const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize);
db.agentearning = require("./agentearning.model.js")(sequelize, Sequelize);
db.agentpercentage = require("./agentpercentage.model.js")(sequelize, Sequelize);
db.agenttransaction = require("./agenttransaction.model.js")(sequelize, Sequelize);
db.api = require("./api.model.js")(sequelize, Sequelize);
db.apicountrypriority = require("./apicountrypriority.model.js")(sequelize, Sequelize);
db.apipercent = require("./apipercent.model.js")(sequelize, Sequelize);
db.apitransaction = require("./apitransaction.model.js")(sequelize, Sequelize);
db.country = require("./country.model.js")(sequelize, Sequelize);
db.lockedbalance = require("./lockedbalance.model.js")(sequelize, Sequelize);
db.lockednumber = require("./lockednumber.model.js")(sequelize, Sequelize);
db.mobile = require("./mobile.model.js")(sequelize, Sequelize);
db.mobilesetting = require("./mobilesetting.model.js")(sequelize, Sequelize);
db.organizationearned = require("./organizationearned.model.js")(sequelize, Sequelize);
db.refreshtoken = require("./refreshtoken.model.js")(sequelize, Sequelize);
db.service = require("./service.model.js")(sequelize, Sequelize);
db.servicesetting = require('./servicesetting.model.js')(sequelize, Sequelize);
db.systemlog = require("./systemlog.model.js")(sequelize, Sequelize);
db.transaction = require("./transaction.model.js")(sequelize, Sequelize);
db.transactionrecordapi = require("./transactionrecordapi.model.js")(sequelize, Sequelize);
db.transactionresponse = require("./transactionresponse.model.js")(sequelize, Sequelize);
db.transactionsource = require("./transactionsource.model.js")(sequelize, Sequelize);
db.useramountsettlement = require("./useramountsettlement.model.js")(sequelize, Sequelize);
db.userprofile = require("./userprofile.model.js")(sequelize, Sequelize);
db.userbalance = require("./userbalance.model.js")(sequelize, Sequelize);
db.transactionadjustments = require("./transactionadjustments.model.js")(sequelize, Sequelize);
db.operatorCode = require("./operatorcode.model.js")(sequelize, Sequelize);


module.exports = db;