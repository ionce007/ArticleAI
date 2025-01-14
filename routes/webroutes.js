const express = require('express');
const router = express.Router();

const index = require('../controllers/indexController');
const video = require('../controllers/wxvideo');

router.get('/', video.getLogin);
router.get('/login', video.getLogin);
router.get('/welcome', video.showWelcome);
router.get('/index', index.getIndex);
//router.get('/headimg/:userName',index.getContactHeadImg);

module.exports = router;