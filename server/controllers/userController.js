const User = require('../models/User');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Set up multer for profile picture and avatar uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory where files will be stored
    },
    filename: (req, file, cb) => {
        // Create a unique filename using user ID and original file extension
        cb(null, `${req.user.id}-${file.fieldname}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: File upload only supports the following filetypes - ' + filetypes);
        }
    },
    limits: { fileSize: 50 * 1024 * 1024 } // Increase file size limit to 50MB
});

// Middleware to handle file uploads for profile assets
exports.uploadProfileAssets = upload.fields([
    { name: 'profilePicture', maxCount: 1 }, // Allow one profile picture
    { name: 'avatar', maxCount: 1 }, // Allow one avatar
]);

// Function to update user profile
exports.updateProfile = async (req, res) => {
    const { nickname, maritalStatus, dateOfBirth, gender, country, bio } = req.body;

    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files);

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (nickname) user.nickname = nickname;
        if (maritalStatus) user.maritalStatus = maritalStatus;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (gender) user.gender = gender;
        if (country) user.country = country;
        if (bio) user.bio = bio;

        if (req.files['profilePicture']) user.profilePicture = req.files['profilePicture'][0].path;
        if (req.files['avatar']) user.avatar = `${req.files['avatar'][0].path}?${new Date().getTime()}`; // Add cache-busting query parameter

        await user.save();
        res.json(user);
    } catch (err) {
        console.error('Error in updateProfile:', err);
        res.status(500).json({ error: err.message });
    }
};

// Function to update profile picture
exports.updateProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (req.files['profilePicture']) {
            user.profilePicture = req.files['profilePicture'][0].path;
        }

        await user.save();
        res.json(user);
    } catch (err) {
        console.error('Error in updateProfilePicture:', err);
        res.status(500).json({ error: err.message });
    }
};

// Function to update avatar
exports.updateAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (req.files['avatar']) {
            user.avatar = `${req.files['avatar'][0].path}?${new Date().getTime()}`; // Add cache-busting query parameter
        }

        await user.save();
        res.json(user);
    } catch (err) {
        console.error('Error in updateAvatar:', err);
        res.status(500).json({ error: err.message });
    }
};

// Function to increment user rating
exports.incrementRating = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.rating += 1;
        await user.save();
        res.json({ rating: user.rating });
    } catch (err) {
        console.error('Error in incrementRating:', err);
        res.status(500).json({ error: err.message });
    }
};

// Function to add a friend
exports.addFriend = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const friendId = req.params.friendId;
        console.log('Received Friend ID:', friendId); // Log the received friend ID

        if (!mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({ error: 'Invalid friend ID' });
        }

        const friend = await User.findById(friendId);
        console.log('User:', user);
        console.log('Friend:', friend);
        if (!user || !friend) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!user.friends.includes(friend._id)) {
            user.friends.push(friend._id);
            await user.save();
        }
        const populatedUser = await User.findById(user._id).populate('friends', 'nickname avatar');
        res.json(populatedUser);
    } catch (err) {
        console.error('Error in addFriend:', err);
        res.status(500).json({ error: err.message });
    }
};

// Function to remove a friend
exports.removeFriend = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const friendId = req.params.friendId;
        console.log('Received Friend ID:', friendId); // Log the received friend ID

        if (!mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({ error: 'Invalid friend ID' });
        }

        const friend = await User.findById(friendId);
        console.log('User:', user);
        console.log('Friend:', friend);
        if (!user || !friend) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.friends = user.friends.filter(friendId => friendId.toString() !== friend._id.toString());
        await user.save();
        const populatedUser = await User.findById(user._id).populate('friends', 'nickname avatar');
        res.json(populatedUser);
    } catch (err) {
        console.error('Error in removeFriend:', err);
        res.status(500).json({ error: err.message });
    }
};

// Function to block a user
exports.blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const blockedUserId = req.params.blockedUserId;
        console.log('Received Blocked User ID:', blockedUserId); // Log the received blocked user ID

        if (!mongoose.Types.ObjectId.isValid(blockedUserId)) {
            return res.status(400).json({ error: 'Invalid blocked user ID' });
        }

        const blockedUser = await User.findById(blockedUserId);
        console.log('User:', user);
        console.log('Blocked User:', blockedUser);
        if (!user || !blockedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (blockedUser.roles.includes('Admin')) {
            return res.status(403).json({ error: 'You cannot block an admin' });
        }
        if (!user.blockedUsers.some(user => user._id.toString() === blockedUser._id.toString())) {
            user.blockedUsers.push(blockedUser);
            await user.save();
        }
        const populatedUser = await User.findById(user._id).populate('blockedUsers', 'nickname avatar');
        res.json(populatedUser);
    } catch (err) {
        console.error('Error in blockUser:', err);
        res.status(500).json({ error: err.message });
    }
};

// Function to unblock a user
exports.unblockUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const blockedUserId = req.params.blockedUserId;
        console.log('Received Blocked User ID:', blockedUserId); // Log the received blocked user ID

        if (!mongoose.Types.ObjectId.isValid(blockedUserId)) {
            return res.status(400).json({ error: 'Invalid blocked user ID' });
        }

        const blockedUser = await User.findById(blockedUserId);
        console.log('User:', user);
        console.log('Blocked User:', blockedUser);
        if (!user || !blockedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.blockedUsers = user.blockedUsers.filter(user => user._id.toString() !== blockedUser._id.toString());
        await user.save();
        const populatedUser = await User.findById(user._id).populate('blockedUsers', 'nickname avatar');
        res.json(populatedUser);
    } catch (err) {
        console.error('Error in unblockUser:', err);
        res.status(500).json({ error: err.message });
    }
};

// Function to fetch user profile
exports.getUserProfile = async (req, res) => {
    try {
        console.log('Fetching user profile for userId:', req.params.userId); // Add logging
        const user = await User.findById(req.params.userId).select('-password -email');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Function to update colors
exports.updateColors = async (req, res) => {
    const { nicknameColor, chatTextColor } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.nicknameColor = nicknameColor;
        user.chatTextColor = chatTextColor;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error('Error in updateColors:', err);
        res.status(500).json({ error: err.message });
    }
};

// Function to update email
exports.updateEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.email = email;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error('Error in updateEmail:', err);
        if (err.errors && err.errors.email) {
            res.status(400).json({ error: 'Invalid E-Mail format' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

// Function to change password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        console.log('Current password:', currentPassword);
        console.log('Stored hashed password:', user.password);
        console.log('Is current password match:', isMatch);

        if (!isMatch) {
            console.log('Current password is incorrect');
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        console.log('New password before hashing:', newPassword);
        user.password = newPassword; // Let the pre-save hook handle the hashing

        await user.save();
        console.log('Password changed successfully for user:', user.email);
        console.log('New hashed password stored in DB:', user.password);

        // Verify the stored password directly from the database
        const updatedUser = await User.findById(req.user.id);
        console.log('Verified stored hashed password from DB:', updatedUser.password);

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Error in changePassword:', err);
        res.status(500).json({ error: err.message });
    }
};

// Function to update privacy settings
exports.updatePrivacySetting = async (req, res) => {
    const { privacySetting } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.privacySetting = privacySetting;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error('Error in updatePrivacySetting:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.banUser = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ error: 'Current user not found' });
        }

        const restrictedRoles = ['Admin', 'Moderator', 'Super Moderator', 'Co-Admin'];
        const isCurrentUserRestricted = currentUser.roles.some(role => restrictedRoles.includes(role));
        const isTargetUserRestricted = user.roles.some(role => restrictedRoles.includes(role));

        // Admins can ban anyone
        if (currentUser.roles.includes('Admin')) {
            user.isBanned = true;
            await user.save();
            return res.json(user);
        }

        // Check if the target user has restricted roles
        if (isTargetUserRestricted) {
            return res.status(403).json({ error: 'You cannot ban a user with Admin, Moderator, Super Moderator, or Co-Admin roles' });
        }

        // Check if the current user has restricted roles and is trying to ban a normal user
        if (isCurrentUserRestricted && !isTargetUserRestricted) {
            user.isBanned = true;
            await user.save();
            return res.json(user);
        }

        // If none of the above conditions are met, the current user does not have permission to ban users
        return res.status(403).json({ error: 'You do not have permission to ban users' });
    } catch (err) {
        console.error('Error in banUser:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

exports.unbanUser = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ error: 'Current user not found' });
        }

        const restrictedRoles = ['Admin', 'Moderator', 'Super Moderator', 'Co-Admin'];
        const isCurrentUserRestricted = currentUser.roles.some(role => restrictedRoles.includes(role));
        const isTargetUserRestricted = user.roles.some(role => restrictedRoles.includes(role));

        // Admins can unban anyone
        if (currentUser.roles.includes('Admin')) {
            user.isBanned = false;
            await user.save();
            return res.json(user);
        }

        // Check if the target user has restricted roles
        if (isTargetUserRestricted) {
            return res.status(403).json({ error: 'You cannot unban a user with Admin, Moderator, Super Moderator, or Co-Admin roles' });
        }

        // Check if the current user has restricted roles and is trying to unban a normal user
        if (isCurrentUserRestricted && !isTargetUserRestricted) {
            user.isBanned = false;
            await user.save();
            return res.json(user);
        }

        // If none of the above conditions are met, the current user does not have permission to unban users
        return res.status(403).json({ error: 'You do not have permission to unban users' });
    } catch (err) {
        console.error('Error in unbanUser:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};
