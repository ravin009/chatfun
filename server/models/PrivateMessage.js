const mongoose = require('mongoose');

const PrivateMessageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true, maxlength: 25000 },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('PrivateMessage', PrivateMessageSchema);
