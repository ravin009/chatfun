const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
        console.log('Token received:', token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        req.user = await User.findById(decoded.id).select('-password');
        console.log('User found:', req.user);
        if (!req.user) {
            return res.status(401).json({ error: 'Not authorized, user not found' });
        }
        next();
    } catch (err) {
        console.error('Error in protect middleware:', err);
        res.status(401).json({ error: 'Not authorized, token failed' });
    }
};
