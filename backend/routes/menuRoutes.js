const express = require('express');
const router = express.Router();
const { getCurrentMenu , getLastUpdatedTime } = require('../controllers/menuController');

router.get('/current', getCurrentMenu);
router.get('/last-updated', getLastUpdatedTime);


module.exports = router;

