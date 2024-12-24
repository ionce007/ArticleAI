const express = require('express');
const router = express.Router();

const index = require('../controllers/indexController');

router.get('/', index.getLogin);
router.get('/login', index.getLogin);
router.get('/index', index.getIndex);
//router.get('/headimg/:userName',index.getContactHeadImg);

module.exports = router;