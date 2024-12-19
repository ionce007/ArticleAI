const express = require('express');
const router = express.Router();

const index = require('../controllers/indexController');

router.get('/', index.getIndex);
//router.get('/headimg/:userName',index.getContactHeadImg);

module.exports = router;