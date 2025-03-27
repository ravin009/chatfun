const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    roomId: { type: String, required: true, unique: true, minlength: 6, maxlength: 36 },
    isPrivate: { type: Boolean, default: false },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    readOnlyUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Add this line
    backgroundColor: { type: String, default: '#17202A' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Room', RoomSchema);
