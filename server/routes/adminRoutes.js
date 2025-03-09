const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const { setReadOnly, setRole } = require('../controllers/adminController');
const router = express.Router();

router.put('/set-read-only', protect, isAdmin, setReadOnly);
router.put('/set-role', protect, isAdmin, setRole);

module.exports = router;
