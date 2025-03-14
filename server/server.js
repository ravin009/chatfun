const overrideConsole = require('./utils/consoleOverride');
overrideConsole();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const http = require('http');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const User = require('./models/User'); // Import User model
const Room = require('./models/Room'); // Import Room model
const DefaultRoom = require('./models/DefaultRoom');
const connectDB = require('./config/db'); // Import connectDB

dotenv.config(); // Load environment variables

const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

connectDB(); // Call connectDB to connect to MongoDB

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/user', require('./routes/userRoutes')); // Ensure this line exists
app.use('/api/private-messages', require('./routes/privateMessageRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes')); // Register the room routes here
app.use('/api/admin', require('./routes/adminRoutes')); // Ensure this line exists
app.use('/api/default-room', require('./routes/defaultRoomRoutes'));

const emitUserCounts = async (roomId) => {
    const usersInRoom = await User.find({ isOnline: true, roomId });
    const maleCount = usersInRoom.filter(user => user.gender === 'Male').length;
    const femaleCount = usersInRoom.filter(user => user.gender === 'Female').length;
    io.to(roomId).emit('userCounts', { roomId, maleCount, femaleCount });
    io.to(roomId).emit('userList', { roomId, users: usersInRoom }); // Emit the user list
};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('userOnline', async (userId) => {
        socket.userId = userId; // Store userId in socket object
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

        // Check if the room is private and the user is not the creator or owner
        if (room.isPrivate && room.creator.toString() !== userId && room.owner.toString() !== userId) {
            socket.emit('error', { message: 'You do not have access to this private room' });
            return;
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
});

app.use('/uploads', express.static(uploadsDir));

// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory where files will be stored
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

app.post('/api/chat/send-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ fileName: req.file.filename });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
