const DefaultRoom = require('../models/DefaultRoom');

exports.getDefaultRoom = async (req, res) => {
    try {
        const defaultRoom = await DefaultRoom.findOne();
        if (!defaultRoom) {
            return res.status(404).json({ error: 'Default room not found' });
        }
        res.json(defaultRoom);
    } catch (err) {
        console.error('Error fetching default room:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};
