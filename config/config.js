//let fs = require('fs');
const dotEnv  = require('dotenv');
dotEnv.config();

let config = {
   MYSQL:
   {
    HOST: process.env.MYSQL_HOST,
    USER: process.env.MYSQL_USER,
    PASSWORD: process.env.MYSQL_PWD,
    DB: process.env.MYSQL_DBNAME,
    PORT: parseInt(process.env.MYSQL_PORT),
    DIALECT: 'mysql',
  },
  POSTGRESQL: {
    DB: process.env.PG_DBNAME,
    USER: process.env.PG_USER,
    PASSWORD: process.env.PG_PASSWORD,
    HOST: process.env.PG_HOST, 
    DIALECT: 'postgres',
    PORT: parseInt(process.env.PG_PORT)
  },
  DOUBAO:
  {
    WXBOT_APPKEY: process.env.WXBOT_FANGZHOU_APPKEY, 
  },
  QIANFAN:
  {
    WXBOT_APPID: process.env.WXBOT_QIANFAN_APPID, 
    WXBOT_APPKEY: process.env.WXBOT_QIANFAN_APPKEY,
    WXBOT_SECRETKEY: process.env.WXBOT_QIANFAN_SECRETKEY,
  },
  dialect: process.env.DIALECT, //'postgres',  'mysql'
};

module.exports = config;