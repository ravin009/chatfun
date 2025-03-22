const overrideConsole = require('../utils/consoleOverride');
overrideConsole();

const PrivateMessage = require('../models/PrivateMessage');
const User = require('../models/User');

exports.sendPrivateMessage = async (req, res) => {
    const { recipientId, message } = req.body;
    const senderId = req.user.id;

    if (message.length > 250) {
        return res.status(400).json({ error: 'Message exceeds 250 characters limit' });
    }

    try {
        const sender = await User.findById(senderId);
        if (sender.isBanned) {
            return res.status(403).json({ error: 'You are banned from sending private messages.' });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }

        // Check if the sender is blocked by the recipient
        if (recipient.blockedUsers.includes(senderId)) {
            return res.status(403).json({ error: 'You are blocked by this user and cannot send private messages.' });
        }

        const privateMessage = new PrivateMessage({ senderId, recipientId, message });
        await privateMessage.save();

        // Increment the rating for the sender
        sender.privateMessageCount = (sender.privateMessageCount || 0) + 1;
        sender.rating += 1;
        await sender.save();

        // Check the number of messages between the sender and recipient
        const messageCount = await PrivateMessage.countDocuments({
            $or: [
                { senderId, recipientId },
                { senderId: recipientId, recipientId: senderId }
            ]
        });

        // If the message count exceeds 70, delete the oldest message
        if (messageCount > 70) {
            const oldestMessage = await PrivateMessage.findOne({
                $or: [
                    { senderId, recipientId },
                    { senderId: recipientId, recipientId: senderId }
                ]
            }).sort({ createdAt: 1 });

            if (oldestMessage) {
                await PrivateMessage.deleteOne({ _id: oldestMessage._id });
            }
        }

        res.status(201).json(privateMessage);
    } catch (err) {
        console.error('Error in sendPrivateMessage:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

exports.getPrivateMessages = async (req, res) => {
    const userId = req.user.id;

    try {
        const privateMessages = await PrivateMessage.find({
            $or: [{ senderId: userId }, { recipientId: userId }]
        })
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(70) // Limit to the latest 70 messages
            .populate('senderId', 'nickname avatar')
            .populate('recipientId', 'nickname avatar');

        res.json(privateMessages.reverse()); // Reverse to get the oldest first
    } catch (err) {
        console.error('Error in getPrivateMessages:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

exports.markAsRead = async (req, res) => {
    const { messageId } = req.params;

    try {
        const message = await PrivateMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        message.isRead = true;
        await message.save();
        res.json(message);
    } catch (err) {
        console.error('Error in markAsRead:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};
