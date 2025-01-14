//module.exports = app => {
const express = require('express');
const router = express.Router();

const index = require("../controllers/indexController.js");
const video = require("../controllers/wxvideo.js");
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

router.options('/video/login', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Content-Length,Authorization,Accept,X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    console.log(`router.options('/video/login'`);
    res.sendStatus(200);
});
router.get('/video/login', video.wxvlogin);
router.get('/video/hepler_merlin_mmdata', video.hepler_merlin_mmdata);
router.get('/video/helper_mmdata', video.helper_mmdata);
router.get('/video/get_login_token', video.get_login_token);
router.get('/video/request_qrcode', video.request_qrcode);
router.get('/video/auth_data', video.auth_data);
router.get('/video/helper_upload_params', video.helper_upload_params);

module.exports = router;