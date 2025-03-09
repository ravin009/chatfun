const mongoose = require('mongoose');

const DefaultRoomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('DefaultRoom', DefaultRoomSchema);
