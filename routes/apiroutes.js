//module.exports = app => {
const express = require('express');
const router = express.Router();

const index = require("../controllers/indexController.js");
const { uploadFile } = require('../middlewares/upload');

router.get('/wxvideo/login', index.getWeixinVideoCookies);
router.get('/wxvideo/sselogin', index.getWeixinVideoCookiesSSE);
router.get('/wxvideo/sselogin', index.getWeixinVideoCookies);
//router.post('/wxvideo/upload', uploadFile.single('fileUpload'), index.uploadChrome);
router.post('/wxvideo/upload', index.uploadFile);
router.get('/wxvideo/test', index.uploadTest);

module.exports = router;