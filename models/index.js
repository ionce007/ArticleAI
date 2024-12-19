const config = require("../config/config.js");

const Sequelize = require("sequelize");
const sequelize = config.dialect ==='postgres' ? new Sequelize(config.POSTGRESQL.DB, config.POSTGRESQL.USER, config.POSTGRESQL.PASSWORD, {host: config.POSTGRESQL.HOST,port: config.POSTGRESQL.PORT,dialect: config.POSTGRESQL.DIALECT,timezone: '+08:00',logging: false,quoteIdentifiers: true,pool: {max: 5,min: 0,idle: 10000}})
  : new Sequelize(config.MYSQL.DB, config.MYSQL.USER, config.MYSQL.PASSWORD, {host: config.MYSQL.HOST, port: config.MYSQL.PORT,DIALECT: config.MYSQL.DIALECT,timezone: '+08:00',logging: false,pool: { max: 5, min: 0, idle: 10000  }})

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
db.AIToken = require("./AIToken.js")(sequelize, Sequelize);

module.exports = db;
