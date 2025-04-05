const express = require('express');
const { sendMessage, getMessages, sendImageMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

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

const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/:roomId', protect, getMessages);
router.post('/send-image', protect, upload.single('image'), sendImageMessage);

module.exports = router;

