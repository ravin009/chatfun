const express = require('express');
const { sendMessage, getMessages, sendImageMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const router = express.Router();

// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory where files will be stored
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

router.post('/send', protect, sendMessage);
router.get('/:roomId', protect, getMessages);
router.post('/send-image', protect, upload.single('image'), sendImageMessage);

module.exports = router;
