const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const User = require('./models/User');
const Room = require('./models/Room');
const DefaultRoom = require('./models/DefaultRoom');
const connectDB = require('./config/db');
const socket = require('./socket');

dotenv.config();

const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const app = express();
const server = http.createServer(app);
const io = socket.init(server);

app.use(cors());
app.use(express.json());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

connectDB();

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/private-messages', require('./routes/privateMessageRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/default-room', require('./routes/defaultRoomRoutes'));

const emitUserCounts = async (roomId) => {
    const usersInRoom = await User.find({ isOnline: true, roomId });
    const maleCount = usersInRoom.filter(user => user.gender === 'Male').length;
    const femaleCount = usersInRoom.filter(user => user.gender === 'Female').length;
    io.to(roomId).emit('userCounts', { roomId, maleCount, femaleCount });
    io.to(roomId).emit('userList', { roomId, users: usersInRoom });
};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('userOnline', async (userId) => {
        socket.userId = userId; // Assign userId to socket for targeted emits
        await User.findByIdAndUpdate(userId, { isOnline: true });
        io.emit('userStatusChanged', { userId, isOnline: true });
        const user = await User.findById(userId);
        if (user.roomId) {
            emitUserCounts(user.roomId);
        }
    });

    socket.on('userOffline', async (userId) => {
        await User.findByIdAndUpdate(userId, { isOnline: false, roomId: null });
        io.emit('userStatusChanged', { userId, isOnline: false });
        const user = await User.findById(userId);
        if (user.roomId) {
            emitUserCounts(user.roomId);
        }
    });

    socket.on('message', (message) => {
        io.to(message.roomId).emit('message', message);
    });

    socket.on('privateMessage', (message) => {
        try {
            if (message && message.recipientId) {
                io.emit('privateMessage', message);
                io.to(message.recipientId).emit('privateMessageNotification', message);
            } else {
                console.error('Recipient ID is null or undefined. Private message not sent.');
            }
        } catch (error) {
            console.error('Error handling private message:', error);
        }
    });

    socket.on('joinRoom', async ({ userId, roomId }) => {
        const room = await Room.findOne({ roomId });
        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        if (room.isPrivate) {
            const userIdStr = userId.toString();
            const isOwnerOrCreator = room.creator.toString() === userIdStr || room.owner.toString() === userIdStr;
            const isAccessedUser = room.accessedUsers.some(id => id.toString() === userIdStr);

            if (!isOwnerOrCreator && !isAccessedUser) {
                socket.emit('error', { message: 'You do not have access to this private room' });
                return;
            }
        }

        socket.join(roomId);
        socket.userId = userId;
        socket.roomId = roomId;

        await User.findByIdAndUpdate(userId, { isOnline: true, roomId });
        io.to(roomId).emit('userStatusChanged', { userId, isOnline: true });

        emitUserCounts(roomId);
    });

    socket.on('leaveRoom', async ({ userId, roomId }) => {
        socket.leave(roomId);
        await User.findByIdAndUpdate(userId, { isOnline: false, roomId: null });
        io.to(roomId).emit('userStatusChanged', { userId, isOnline: false });

        emitUserCounts(roomId);
    });

    socket.on('disconnect', async () => {
        console.log('Client disconnected');
        const { userId, roomId } = socket;
        if (userId) {
            await User.findByIdAndUpdate(userId, { isOnline: false, roomId: null });
            io.to(roomId).emit('userStatusChanged', { userId, isOnline: false });

            emitUserCounts(roomId);
        }
    });

    // Handle roomInvite event to notify invited user only
    socket.on('roomInvite', async ({ roomId, roomName, invitedUserId }) => {
        try {
            console.log(`roomInvite event: roomId=${roomId}, roomName=${roomName}, invitedUserId=${invitedUserId}`);
            let foundSockets = 0;
            for (let [id, s] of io.of("/").sockets) {
                if (s.userId === invitedUserId) {
                    foundSockets++;
                    s.emit('roomInvite', { roomId, roomName });
                    console.log(`Emitted roomInvite to socket ${id} for user ${invitedUserId}`);
                }
            }
            if (foundSockets === 0) {
                console.log(`No active sockets found for invitedUserId ${invitedUserId}`);
            }
        } catch (err) {
            console.error('Error emitting roomInvite:', err);
        }
    });
});

app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.post('/api/chat/send-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ fileName: req.file.filename });
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server };