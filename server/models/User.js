const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: true,
        unique: true,
        minlength: 1,
        maxlength: 30,
        match: /^[^\s]+(\s+[^\s]+)*$/,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 1024,
    },
    uuid: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, index: true },
    rating: { type: Number, default: 0 },
    profilePicture: { type: String },
    avatar: { type: String },
    maritalStatus: { type: String, default: 'Single' }, // Default value
    dateOfBirth: { type: Date, default: new Date('2001-01-01') }, // Default value
    gender: { type: String, default: 'Female' }, // Default value
    country: { type: String },
    bio: { type: String },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    nicknameColor: { type: String, default: '#129dfa' },
    chatTextColor: { type: String, default: '#fa9112' },
    privacySetting: { type: String, default: 'all' },
    isOnline: { type: Boolean, default: false },
    roomId: { type: String, default: null },
    roles: { type: [String], default: ['User'] },
    blockedDevices: [{ type: String }],
    isReadOnly: { type: Boolean, default: false },
    chatMessageCount: { type: Number, default: 0 },
    privateMessageCount: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

UserSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        if (error.keyPattern.email) {
            next(new Error('Email is already registered.'));
        } else if (error.keyPattern.nickname) {
            next(new Error('Nickname is already taken.'));
        } else {
            next(new Error('Duplicate key error.'));
        }
    } else {
        next(error);
    }
});

module.exports = mongoose.model('User', UserSchema);
