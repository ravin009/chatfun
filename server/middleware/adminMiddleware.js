const User = require('../models/User');

exports.isAdmin = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (user && user.roles.includes('Admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admins only.' });
    }
};
