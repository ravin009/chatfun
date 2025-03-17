const overrideConsole = require('../utils/consoleOverride');
overrideConsole();

const DefaultRoom = require('../models/DefaultRoom');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.getDefaultRoom = async (req, res) => {
    try {
        // Add a delay of 5 seconds (10000 milliseconds)
        await delay(10000);

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
