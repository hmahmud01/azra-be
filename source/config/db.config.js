module.exports = {
    HOST: process.env.DBHOST,
    USER: process.env.DBUSER,
    PASSWORD: process.env.DBPASSWORD,
    DB: process.env.DB,
    PORT: process.env.DBPORT,
    dialect: process.env.DIALECT,
    pool: {
      max: parseInt(process.env.POOL_MAX),
      min: parseInt(process.env.POOL_MIN),
      acquire: process.env.POOL_ACQUIRE,
      idle: process.env.POOL_IDLE
    }
};