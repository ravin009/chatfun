const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    roomId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    nickname: { type: String, required: true },
    avatar: { type: String, required: true },
    message: { type: String, required: true },
    nicknameColor: { type: String, default: '#000000' }, // Add nickname color
    chatTextColor: { type: String, default: '#000000' }, // Add chat text color
    createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('Chat', ChatSchema);
