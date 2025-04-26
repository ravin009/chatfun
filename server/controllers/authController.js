const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp'); // Import the Otp model
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like 'yahoo', 'hotmail', etc.
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
    },
});

exports.register = async (req, res) => {
    let { nickname, email, password } = req.body;

    // Trim nickname and email to remove leading/trailing spaces
    if (typeof nickname === 'string') nickname = nickname.trim();
    if (typeof email === 'string') email = email.trim();

    try {
        const user = new User({ nickname, email, password, uuid: generateUUID() });
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }); // Set to 30 days
        res.status(201).json({ token, user });
    } catch (err) {
        console.error('Error in register:', err);
        if (err.code === 11000) {
            if (err.keyPattern && err.keyPattern.email) {
                return res.status(400).json({ error: 'Email is already registered.' });
            } else if (err.keyPattern && err.keyPattern.nickname) {
                return res.status(400).json({ error: 'Nickname is already taken.' });
            }
        }
        return res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

exports.login = async (req, res) => {
    let { identifier, password } = req.body;

    // Trim identifier to remove leading/trailing spaces
    if (typeof identifier === 'string') identifier = identifier.trim();

    try {
        const user = await User.findOne({ $or: [{ email: identifier }, { nickname: identifier }, { uuid: identifier }] });
        if (!user) {
            console.log('Invalid credentials: user not found');
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        console.log('User found:', user.email);
        console.log('Provided password:', password);
        console.log('Stored hashed password:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Is match:', isMatch);

        if (!isMatch) {
            console.log('Invalid credentials: password does not match');
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        console.log('Password matches');
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }); // Set to 30 days
        res.json({ token, user });
    } catch (err) {
        console.error('Error in login:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('friends', 'nickname avatar')
            .populate('blockedUsers', 'nickname avatar');
        res.json(user);
    } catch (err) {
        console.error('Error in getCurrentUser:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

const generateUUID = () => {
    return 'xxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16).toUpperCase();
    });
};

exports.sendResetPasswordOTP = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();

        // Save OTP to the database
        const otpEntry = new Otp({ email, otp });
        await otpEntry.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is ${otp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ error: 'Error sending email' });
            }
            res.json({ message: 'OTP sent to email' });
        });
    } catch (err) {
        console.error('Error in sendResetPasswordOTP:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const otpEntry = await Otp.findOne({ email, otp });
        if (!otpEntry) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.password = newPassword;
        await user.save();

        // Remove OTP after successful password reset
        await Otp.deleteOne({ email, otp });

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.error('Error in resetPassword:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};
