//module.exports = app => {
const express = require('express');
const router = express.Router();

const index = require("../controllers/indexController.js");
const { uploadFile } = require('../middlewares/upload');

router.get('/wxvideo/login', index.getWeixinVideoCookies);
router.options('/wxvideo/sselogin', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Content-Length,Authorization,Accept,X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    console.log(`router.options('/wxvideo/sselogin'`);
    res.sendStatus(200);
});
router.get('/wxvideo/sselogin', index.getWeixinVideoCookiesSSE);

router.get('/wxvideo/sselogin', index.getWeixinVideoCookies);
//router.post('/wxvideo/upload', uploadFile.single('fileUpload'), index.uploadChrome);
router.post('/wxvideo/upload', index.uploadFile);
router.get('/wxvideo/test', index.uploadTest);

module.exports = router;