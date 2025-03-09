const express = require('express');
const { register, login, getCurrentUser, sendResetPasswordOTP, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.post('/send-reset-password-otp', sendResetPasswordOTP); // New route for sending OTP
router.post('/reset-password', resetPassword); // New route for resetting password

module.exports = router;
