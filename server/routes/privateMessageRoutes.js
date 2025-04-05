const express = require('express');
const { sendPrivateMessage, getPrivateMessages, markAsRead } = require('../controllers/privateMessageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/send', protect, sendPrivateMessage);
router.get('/', protect, getPrivateMessages);
router.put('/read/:messageId', protect, markAsRead);

module.exports = router;

