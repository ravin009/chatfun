const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
const socket = require('../socket');
const io = socket.getIO();

// Function to generate a short unique ID consisting of uppercase letters and digits
const generateShortId = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const emitRoomInvite = (roomId, roomName, invitedUserId) => {
    let foundSockets = 0;
    for (let [id, socket] of io.of("/").sockets) {
        if (socket.userId === invitedUserId) {
            foundSockets++;
            socket.emit('roomInvite', { roomId, roomName });
            console.log(`Emitted roomInvite to socket ${id} for user ${invitedUserId}`);
        }
    }
    if (foundSockets === 0) {
        console.log(`No active sockets found for invitedUserId ${invitedUserId}`);
    }
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
        const hasAllowedRole = user.roles.some(role => allowedRoles.includes(role));
        if (user.rating < 1000 && !hasAllowedRole) {
            return res.status(403).json({ error: 'Your rating is less than 1000, you cannot create a room! Please chat and increase rating.' });
        }

        const room = new Room({
            name,
            roomId: generateShortId(8),
            isPrivate,
            creator: req.user.id,
            owner: req.user.id,
            accessedUsers: [], // Initialize empty accessedUsers list
            invitedUsers: [],  // Initialize empty invitedUsers list
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
        const room = await Room.findOne({ roomId })
            .populate('creator owner', 'nickname uuid')
            .populate('accessedUsers', 'nickname avatar uuid'); // populate accessedUsers with needed fields

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        if (room.isPrivate) {
            const userIdStr = req.user.id.toString();
            const isOwnerOrCreator = room.owner._id.toString() === userIdStr || room.creator._id.toString() === userIdStr;
            const isAccessedUser = room.accessedUsers.some(user => user._id.toString() === userIdStr);

            if (!isOwnerOrCreator && !isAccessedUser) {
                return res.status(403).json({ error: 'You do not have access to this private room' });
            }
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

        // Admins can always set read-only
        if (currentUser.roles.includes('Admin')) {
            if (!room.readOnlyUsers.includes(userId)) {
                room.readOnlyUsers.push(userId);
                await room.save();
            }
            return res.json(room);
        }

        // Prevent restricted users from setting owner or creator to read-only in their own room
        if (isCurrentUserRestricted && (targetUser._id.toString() === room.owner.toString() || targetUser._id.toString() === room.creator.toString()) && roomId === targetUser.roomId) {
            return res.status(403).json({ error: 'You cannot set the owner or creator to read-only mode in their own room' });
        }

        // Prevent setting read-only for users with restricted roles or owner/creator
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

        // Admins can always remove read-only
        if (currentUser.roles.includes('Admin')) {
            room.readOnlyUsers = room.readOnlyUsers.filter(user => user.toString() !== userId.toString());
            await room.save();
            return res.json(room);
        }

        // Prevent restricted users from removing read-only for owner or creator in their own room
        if (isCurrentUserRestricted && (targetUser._id.toString() === room.owner.toString() || targetUser._id.toString() === room.creator.toString()) && roomId === targetUser.roomId) {
            return res.status(403).json({ error: 'You cannot remove read-only mode for the owner or creator in their own room' });
        }

        // Prevent removing read-only for users with restricted roles or owner/creator
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
        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        if (room.creator.toString() !== req.user.id.toString() && !req.user.roles.includes('Admin')) {
            return res.status(403).json({ error: 'Only the creator or an admin can delete the room' });
        }
        await Room.deleteOne({ roomId });
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

        // If room is made public, clear invitedUsers and accessedUsers
        if (!isPrivate) {
            room.invitedUsers = [];
            room.accessedUsers = [];
        }

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
        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        if (room.owner.toString() !== req.user.id.toString() && room.creator.toString() !== req.user.id.toString() && !req.user.roles.includes('Admin')) {
            return res.status(403).json({ error: 'Only the owner, creator, or an admin can change room color' });
        }
        room.backgroundColor = backgroundColor;
        await room.save();
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

exports.inviteUser = async (req, res) => {
    const { roomId, userIdToInvite } = req.body;
    try {
        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const userToInvite = await User.findById(userIdToInvite);
        if (!userToInvite) {
            return res.status(404).json({ error: 'User to invite not found' });
        }

        if (room.isPrivate) {
            if (room.owner.toString() !== req.user.id && room.creator.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Only owner or creator can invite users to private rooms' });
            }
        }

        // Add to invitedUsers only if not already invited or accessed
        if (!room.invitedUsers.includes(userIdToInvite) && !room.accessedUsers.includes(userIdToInvite)) {
            room.invitedUsers.push(userIdToInvite);
            await room.save();
        }

        // Emit invite only to the invited user’s sockets with current room info
        emitRoomInvite(room.roomId, room.name, userIdToInvite);

        res.json({ message: 'User invited successfully', room });
    } catch (err) {
        console.error('Error in inviteUser:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

exports.acceptInvitation = async (req, res) => {
    const { roomId } = req.params;
    try {
        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const userId = new mongoose.Types.ObjectId(req.user.id);

        if (!Array.isArray(room.invitedUsers)) {
            console.error('invitedUsers is not an array:', room.invitedUsers);
            return res.status(500).json({ error: 'Room data corrupted: invitedUsers not an array' });
        }

        if (!Array.isArray(room.accessedUsers)) {
            room.accessedUsers = [];
        }

        const isInvited = room.invitedUsers.some(id => id.equals(userId));
        const isAccessed = room.accessedUsers.some(id => id.equals(userId));

        if (!isInvited && !isAccessed) {
            return res.status(403).json({ error: 'You are not invited to this private room' });
        }

        // If user is not already in accessedUsers, add them
        if (!isAccessed) {
            room.accessedUsers.push(userId);
        }

        // Remove user from invitedUsers if present
        room.invitedUsers = room.invitedUsers.filter(id => !id.equals(userId));

        await room.save();

        await User.findByIdAndUpdate(userId, { roomId: room.roomId });

        const populatedRoom = await Room.findOne({ roomId })
            .populate('creator owner', 'nickname uuid')
            .populate('invitedUsers', 'nickname avatar uuid')
            .populate('accessedUsers', 'nickname avatar uuid');

        return res.json({ message: 'Invitation accepted', room: populatedRoom });
    } catch (err) {
        console.error('Error in acceptInvitation:', err.message);
        console.error(err.stack);
        return res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

  
exports.rejectInvitation = async (req, res) => {
    const { roomId } = req.params;
    try {
        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        room.invitedUsers = room.invitedUsers.filter(id => id.toString() !== req.user.id.toString());
        await room.save();

        res.json({ message: 'Invitation rejected', room });
    } catch (err) {
        console.error('Error in rejectInvitation:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

// New: Revoke access (remove user from accessedUsers)
exports.revokeAccess = async (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.body;
    try {
        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        if (room.owner.toString() !== req.user.id && room.creator.toString() !== req.user.id && !req.user.roles.includes('Admin')) {
            return res.status(403).json({ error: 'Only the owner, creator, or an admin can revoke access' });
        }

        room.accessedUsers = room.accessedUsers.filter(id => id.toString() !== userId);
        await room.save();

        res.json({ message: 'Access revoked successfully', room });
    } catch (err) {
        console.error('Error in revokeAccess:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};
