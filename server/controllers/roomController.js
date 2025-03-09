const Room = require('../models/Room');
const User = require('../models/User');

// Function to generate a short unique ID consisting of uppercase letters and digits
const generateShortId = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

exports.createRoom = async (req, res) => {
    const { name, isPrivate } = req.body;
    try {
        const existingRoom = await Room.findOne({ name });
        if (existingRoom) {
            return res.status(400).json({ error: 'Room name already exists. Please choose another name.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const allowedRoles = ['Admin', 'Moderator', 'Super Moderator', 'Co-Admin'];
        if (user.rating < 1000 && !allowedRoles.includes(user.roles)) {
            return res.status(403).json({ error: 'Your rating is less than 1000, you cannot create a room! Please chat and increase rating.' });
        }

        const room = new Room({
            name,
            roomId: generateShortId(8), // Generate a short room ID of 8 characters
            isPrivate,
            creator: req.user.id,
            owner: req.user.id,
        });
        await room.save();
        res.status(201).json(room);
    } catch (err) {
        console.error('Error in createRoom:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};


exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate('creator owner', 'nickname uuid');
        res.json(rooms);
    } catch (err) {
        console.error('Error in getRooms:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

exports.getRoomDetails = async (req, res) => {
    const { roomId } = req.params;
    try {
        const room = await Room.findOne({ roomId }).populate('creator owner', 'nickname uuid');
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Check if the room is private and the user is not the creator or owner
        if (room.isPrivate && room.creator._id.toString() !== req.user.id.toString() && room.owner._id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'You do not have access to this private room' });
        }

        res.json(room);
    } catch (err) {
        console.error('Error in getRoomDetails:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

exports.changeOwnership = async (req, res) => {
    const { roomId } = req.params;
    const { newOwnerId } = req.body;
    try {
        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        if (room.creator.toString() !== req.user.id.toString() && !req.user.roles.includes('Admin')) {
            return res.status(403).json({ error: 'Only the creator or an admin can change ownership' });
        }
        room.owner = newOwnerId;
        await room.save();
        res.json(room);
    } catch (err) {
        console.error('Error in changeOwnership:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

exports.setReadOnly = async (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.body;
    try {
        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const currentUser = await User.findById(req.user.id);
        const targetUser = await User.findById(userId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const restrictedRoles = ['Admin', 'Moderator', 'Super Moderator', 'Co-Admin'];
        const isCurrentUserRestricted = currentUser.roles.some(role => restrictedRoles.includes(role));
        const isTargetUserRestricted = targetUser.roles.some(role => restrictedRoles.includes(role));

        // Admins can set anyone to read-only mode
        if (currentUser.roles.includes('Admin')) {
            if (!room.readOnlyUsers.includes(userId)) {
                room.readOnlyUsers.push(userId);
                await room.save();
            }
            return res.json(room);
        }

        // Check if the target user is the owner or creator of the room and is in their own room
        if (isCurrentUserRestricted && (targetUser._id.toString() === room.owner.toString() || targetUser._id.toString() === room.creator.toString()) && roomId === targetUser.roomId) {
            return res.status(403).json({ error: 'You cannot set the owner or creator to read-only mode in their own room' });
        }

        // Check if the target user has restricted roles
        if (isTargetUserRestricted || targetUser._id.toString() === room.owner.toString() || targetUser._id.toString() === room.creator.toString()) {
            return res.status(403).json({ error: 'You cannot set a user with Admin, Moderator, Super Moderator, Co-Admin roles, or the room owner/creator to read-only mode' });
        }

        if (!room.readOnlyUsers.includes(userId)) {
            room.readOnlyUsers.push(userId);
            await room.save();
        }
        res.json(room);
    } catch (err) {
        console.error('Error in setReadOnly:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};


exports.removeReadOnly = async (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.body;
    try {
        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const currentUser = await User.findById(req.user.id);
        const targetUser = await User.findById(userId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const restrictedRoles = ['Admin', 'Moderator', 'Super Moderator', 'Co-Admin'];
        const isCurrentUserRestricted = currentUser.roles.some(role => restrictedRoles.includes(role));
        const isTargetUserRestricted = targetUser.roles.some(role => restrictedRoles.includes(role));

        // Admins can remove anyone from read-only mode
        if (currentUser.roles.includes('Admin')) {
            room.readOnlyUsers = room.readOnlyUsers.filter(user => user.toString() !== userId.toString());
            await room.save();
            return res.json(room);
        }

        // Check if the target user is the owner or creator of the room and is in their own room
        if (isCurrentUserRestricted && (targetUser._id.toString() === room.owner.toString() || targetUser._id.toString() === room.creator.toString()) && roomId === targetUser.roomId) {
            return res.status(403).json({ error: 'You cannot remove read-only mode for the owner or creator in their own room' });
        }

        // Check if the target user has restricted roles
        if (isTargetUserRestricted || targetUser._id.toString() === room.owner.toString() || targetUser._id.toString() === room.creator.toString()) {
            return res.status(403).json({ error: 'You cannot remove read-only mode for a user with Admin, Moderator, Super Moderator, Co-Admin roles, or the room owner/creator' });
        }

        room.readOnlyUsers = room.readOnlyUsers.filter(user => user.toString() !== userId.toString());
        await room.save();
        res.json(room);
    } catch (err) {
        console.error('Error in removeReadOnly:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};


exports.deleteRoom = async (req, res) => {
    const { roomId } = req.params;
    try {
        console.log(`Attempting to delete room with ID: ${roomId}`);
        const room = await Room.findOne({ roomId });
        if (!room) {
            console.log(`Room with ID: ${roomId} not found`);
            return res.status(404).json({ error: 'Room not found' });
        }
        if (room.creator.toString() !== req.user.id.toString() && !req.user.roles.includes('Admin')) {
            console.log(`User with ID: ${req.user.id} is not the creator of the room`);
            return res.status(403).json({ error: 'Only the creator or an admin can delete the room' });
        }
        await Room.deleteOne({ roomId });
        console.log(`Room with ID: ${roomId} deleted successfully`);
        res.json({ message: 'Room deleted successfully' });
    } catch (err) {
        console.error('Error in deleteRoom:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

exports.changeRoomPrivacy = async (req, res) => {
    const { roomId } = req.params;
    const { isPrivate } = req.body;
    try {
        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        if (room.owner.toString() !== req.user.id.toString() && room.creator.toString() !== req.user.id.toString() && !req.user.roles.includes('Admin')) {
            return res.status(403).json({ error: 'Only the owner, creator, or an admin can change room privacy' });
        }
        room.isPrivate = isPrivate;
        await room.save();
        res.json(room);
    } catch (err) {
        console.error('Error in changeRoomPrivacy:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

exports.changeRoomColor = async (req, res) => {
    const { roomId } = req.params;
    const { backgroundColor } = req.body;
    try {
        console.log(`Attempting to change color of room with ID: ${roomId} to ${backgroundColor}`);
        const room = await Room.findOne({ roomId });
        if (!room) {
            console.log(`Room with ID: ${roomId} not found`);
            return res.status(404).json({ error: 'Room not found' });
        }
        if (room.owner.toString() !== req.user.id.toString() && room.creator.toString() !== req.user.id.toString() && !req.user.roles.includes('Admin')) {
            console.log(`User with ID: ${req.user.id} is not the owner or creator of the room`);
            return res.status(403).json({ error: 'Only the owner, creator, or an admin can change room color' });
        }
        room.backgroundColor = backgroundColor;
        await room.save();
        console.log(`Room with ID: ${roomId} color changed to ${backgroundColor} successfully`);
        res.json(room);
    } catch (err) {
        console.error('Error in changeRoomColor:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};


exports.getUsersInRoom = async (req, res) => {
    const { roomId } = req.params;
    try {
        const users = await User.find({ roomId, isOnline: true }).select('nickname avatar');
        res.json(users);
    } catch (err) {
        console.error('Error in getUsersInRoom:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

exports.getUserCounts = async (req, res) => {
    const { roomId } = req.params;
    try {
        const usersInRoom = await User.find({ isOnline: true, roomId });
        const maleCount = usersInRoom.filter(user => user.gender === 'Male').length;
        const femaleCount = usersInRoom.filter(user => user.gender === 'Female').length;
        res.json({ maleCount, femaleCount });
    } catch (err) {
        console.error('Error in getUserCounts:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};
