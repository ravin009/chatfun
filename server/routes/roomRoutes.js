const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    createRoom,
    getRooms,
    getRoomDetails,
    changeOwnership,
    setReadOnly,
    removeReadOnly,
    deleteRoom,
    changeRoomPrivacy,
    changeRoomColor,
    getUsersInRoom,
    getUserCounts, // Add this line
} = require('../controllers/roomController');
const router = express.Router();

router.post('/create', protect, createRoom);
router.get('/', protect, getRooms);
router.get('/:roomId', protect, getRoomDetails);
router.get('/:roomId/users', protect, getUsersInRoom);
router.get('/:roomId/user-counts', protect, getUserCounts); // Add this line
router.put('/change-ownership/:roomId', protect, changeOwnership);
router.put('/set-read-only/:roomId', protect, setReadOnly);
router.put('/remove-read-only/:roomId', protect, removeReadOnly);
router.delete('/:roomId', protect, deleteRoom); // Ensure this route is correctly set up
router.put('/change-privacy/:roomId', protect, changeRoomPrivacy);
router.put('/change-color/:roomId', protect, changeRoomColor);

module.exports = router;
