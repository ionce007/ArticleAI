//module.exports = app => {
const express = require('express');
const router = express.Router();

const index = require("../controllers/indexController.js");

router.get('/accesstoken',index.getAccessToken);
router.get('/bdchat',index.chat4ernieSpeed128K);
router.get('/wxvideo/login', index.getWeixinVideoCookies);

module.exports = router;