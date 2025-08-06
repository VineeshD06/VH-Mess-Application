const express = require('express');
const router = express.Router();
const multer = require('multer');
const { loginAdmin, getCurrentAdminMenu, uploadMenu, getAllCoupons, getTodaysSummary, verifyToken, markCouponAsUsed, markPayment } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/login', loginAdmin);

router.get('/verify-token', protect, verifyToken);
router.post('/menu/upload', protect, upload.single('menuFile'), uploadMenu);
router.get('/coupons/all', protect, getAllCoupons);
router.get('/coupons/summary', protect, getTodaysSummary); 
router.post('/coupons/mark-used/:id', protect, markCouponAsUsed);
router.post('/coupons/payment/:id', protect, markPayment);
router.get('/menu/current', protect, getCurrentAdminMenu); 
module.exports = router;

