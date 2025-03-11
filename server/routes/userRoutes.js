const overrideConsole = require('../utils/consoleOverride');
overrideConsole();


const express = require('express');
const { updateProfile, uploadProfileAssets, incrementRating, addFriend, removeFriend, blockUser, unblockUser, updateProfilePicture, updateAvatar, getUserProfile, updateColors, updateEmail, changePassword, updatePrivacySetting, banUser, unbanUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Import the protect middleware
const { isAdmin } = require('../middleware/adminMiddleware'); // Import the isAdmin middleware
const User = require('../models/User'); // Import the User model
const router = express.Router();

// Route to update user profile and upload profile assets
router.put('/update', protect, uploadProfileAssets, updateProfile);

// Route to update profile picture
router.put('/updateProfilePicture', protect, uploadProfileAssets, updateProfilePicture);

// Route to update avatar
router.put('/updateAvatar', protect, uploadProfileAssets, updateAvatar);

// Route to increment user rating
router.put('/increment-rating', protect, incrementRating);

// Routes for adding/removing friends
router.put('/add-friend/:friendId', protect, addFriend);
router.put('/remove-friend/:friendId', protect, removeFriend);

// Routes for blocking/unblocking users
router.put('/block-user/:blockedUserId', protect, blockUser);
router.put('/unblock-user/:blockedUserId', protect, unblockUser);

// Route to get user profile
router.get('/:userId', protect, getUserProfile);

// Route to update colors
router.put('/updateColors', protect, updateColors);

// Route to update email
router.put('/updateEmail', protect, updateEmail);

// Route to change password
router.put('/changePassword', protect, changePassword);

// Route to update privacy settings
router.put('/updatePrivacySetting', protect, updatePrivacySetting);

// Routes for banning/unbanning users
router.put('/ban-user', protect, banUser); // Remove isAdmin middleware
router.put('/unban-user', protect, unbanUser); // Remove isAdmin middleware

// Route to get all users (Admin only)
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});

module.exports = router;
