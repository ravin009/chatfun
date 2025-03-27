const User = require('../models/User');
const Room = require('../models/Room');

exports.setReadOnly = async (req, res) => {
    const { userId, enable } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.isReadOnly = enable;
        await user.save();
        res.json(user);
    } catch (err) {
        console.error('Error in setReadOnly:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

exports.setRole = async (req, res) => {
    const { userId, role, action } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (action === 'add') {
            if (!user.roles.includes(role)) {
                user.roles.push(role);
            }
        } else if (action === 'remove') {
            user.roles = user.roles.filter(r => r !== role);
        }
        await user.save();
        res.json(user);
    } catch (err) {
        console.error('Error in setRole:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};
