const express = require('express');
const { getDefaultRoom } = require('../controllers/defaultRoomController');
const router = express.Router();

router.get('/', getDefaultRoom);

module.exports = router;
