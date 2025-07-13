const express = require('express');
const router = express.Router();
const { initiateOrder, confirmPayment } = require('../controllers/couponController');

router.post('/initiate-order', initiateOrder);

// router.post('/payment/webhook', confirmPayment);


module.exports = router;

