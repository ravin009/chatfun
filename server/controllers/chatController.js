const Chat = require('../models/Chat');
const User = require('../models/User');
const Room = require('../models/Room');
const amqp = require('amqplib/callback_api');

const MAX_MESSAGES = 70;

const limitMessagesInRoom = async (roomId) => {
    const messageCount = await Chat.countDocuments({ roomId });
    if (messageCount >= MAX_MESSAGES) {
        const oldestMessage = await Chat.findOne({ roomId }).sort({ createdAt: 1 });
        if (oldestMessage) {
            await Chat.deleteOne({ _id: oldestMessage._id });
        }
    }
};

// RabbitMQ setup
let channel;
amqp.connect(process.env.RABBITMQ_URL, (err, connection) => {
    if (err) {
        throw err;
    }
    connection.createChannel((err, ch) => {
        if (err) {
            throw err;
        }
        channel = ch;
        console.log('Connected to RabbitMQ');
        channel.assertQueue('chat_messages', { durable: false });
    });
});

exports.sendMessage = async (req, res) => {
    const { roomId, message, userId, nickname, avatar } = req.body;
    if (!avatar) {
        return res.status(400).json({ error: 'Avatar is required' });
    }

    try {
        const sender = await User.findById(userId);
        if (sender.isBanned) {
            return res.status(403).json({ error: 'You are banned from sending messages.' });
        }

        const recipient = await User.findById(req.body.recipientId);
        const room = await Room.findOne({ roomId });

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Check if the room is private and the user is not the creator or owner
        if (room.isPrivate && room.creator._id.toString() !== userId && room.owner._id.toString() !== userId) {
            return res.status(403).json({ error: 'You do not have access to this private room' });
        }

        // Check if the sender is blocked by the recipient
        if (recipient && recipient.blockedUsers.includes(sender._id)) {
            return res.status(403).json({ error: 'You are blocked by this user and cannot send private messages.' });
        }

        // Limit the number of messages in the room
        await limitMessagesInRoom(roomId);

        const chat = new Chat({
            roomId,
            userId,
            nickname,
            avatar,
            message,
            nicknameColor: sender.nicknameColor,
            chatTextColor: sender.chatTextColor
        });
        await chat.save();

        // Increment the chat message count for the sender
        sender.chatMessageCount = (sender.chatMessageCount || 0) + 1;
        await sender.save();

        // Send message to RabbitMQ queue
        channel.sendToQueue('chat_messages', Buffer.from(JSON.stringify(chat)));

        res.status(201).json(chat);
    } catch (err) {
        console.error('Error in sendMessage:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getMessages = async (req, res) => {
    const { roomId } = req.params;
    try {
        const user = await User.findById(req.user.id);
        const chats = await Chat.find({ roomId }).populate('userId', 'nickname avatar');

        // Filter out messages from blocked users
        const filteredChats = user ? chats.filter(chat => chat.userId && !user.blockedUsers.includes(chat.userId._id)) : chats;

        res.json(filteredChats);
    } catch (err) {
        console.error('Error in getMessages:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.sendImageMessage = async (req, res) => {
    const { roomId, userId, nickname, avatar, nicknameColor, chatTextColor } = req.body;
    const fileName = req.file.filename;

    try {
        const chat = new Chat({
            roomId,
            userId,
            nickname,
            avatar,
            message: fileName,
            nicknameColor,
            chatTextColor,
        });

        // Limit the number of messages in the room
        await limitMessagesInRoom(roomId);

        await chat.save();
        res.status(201).json(chat);
    } catch (err) {
        console.error('Error in sendImageMessage:', err);
        res.status(500).json({ error: err.message });
    }
};
