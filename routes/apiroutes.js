//module.exports = app => {
const express = require('express');
const router = express.Router();

const index = require("../controllers/indexController.js");
const { uploadFile } = require('../middlewares/upload');

router.get('/accesstoken',index.getAccessToken);
router.get('/bdchat',index.chat4ernieSpeed128K);
router.get('/wxvideo/login', index.getWeixinVideoCookies);
//router.post('/wxvideo/upload', uploadFile.single('fileUpload'), index.uploadChrome);
router.post('/wxvideo/upload', index.uploadFile);
router.get('/wxvideo/test', index.uploadTest);

module.exports = router;