const express = require("express");
const session = require('express-session');
const cors = require("cors");
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const logger = require('morgan');
const serveStatic = require('serve-static');
const cookie = require('cookie-parser');
const crypto = require('crypto');
//const fs = require('fs');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app);
app.use(cookie());
app.use(cors());

app.locals.loginStatus = [];
app.locals.syncVideoData = [];

const webRouter = require('./routes/webroutes');
const apiRouter = require('./routes/apiroutes');
//const jobs = require('./middlewares/jobs');

app.use(rateLimit({ windowMs: 30 * 1000, max: 60 }));
app.use(compression());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
//app.set('trust proxy', true);


app.use(session({
  secret: crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));


app.use((req, res, next) => {
  next();
});



app.use(logger('dev'));
const cacheMaxAge = 30 * 24 * 3600;  // 30 days
let serveStaticOptions = { maxAge: cacheMaxAge * 1000 };
app.use(serveStatic(path.join(__dirname, 'public', 'index'), serveStaticOptions));

app.use('/', webRouter);
app.use('/api', apiRouter);
app.use('/img', serveStatic('./public/img', serveStaticOptions));
app.use('/assets', serveStatic('./assets', serveStaticOptions));

const PORT = process.env.PORT || 8081;

server.on("request", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // 允许的HTTP方法
  res.header('Access-Control-Allow-Credentials', true);
})

//jobs.runJobs();

server.listen(PORT);

server.on('close', e => {
  console.log(`connection on port ${PORT} is closed.`);
  console.error(e.toString());
});

server.on('error', err => {
  console.error(
    `An error occurred on the server, please check if port ${PORT} is occupied.`
  );
  console.error(err.toString());
});

server.on('listening', () => {
  console.log(`Server listen on port: ${PORT}. Please visit website： http://localhost:${PORT}`);
});
module.exports = app;