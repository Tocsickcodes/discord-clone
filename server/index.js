require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Init Middleware
app.use(express.json());
app.use(cors());

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));

// Socket.io Logic
const users = {}; // userId: socketId

io.on('connection', (socket) => {
    console.log('New WS Connection...');

    socket.on('join', async (userId) => {
        users[userId] = socket.id;
        socket.userId = userId;
        await User.findByIdAndUpdate(userId, { status: 'online' });
        io.emit('presence', { userId, status: 'online' });
    });

    socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            content
        });

        await newMessage.save();

        const recipientSocket = users[receiverId];
        if (recipientSocket) {
            io.to(recipientSocket).emit('message', newMessage);
        }
        // Also send back to sender for sync (or rely on local state, but usually good to sync ID/timestamp)
        socket.emit('message', newMessage);
    });

    socket.on('typing', ({ senderId, receiverId, isTyping }) => {
        const recipientSocket = users[receiverId];
        if (recipientSocket) {
            io.to(recipientSocket).emit('typing', { senderId, isTyping });
        }
    });

    socket.on('disconnect', async () => {
        if (socket.userId) {
            delete users[socket.userId];
            await User.findByIdAndUpdate(socket.userId, { status: 'offline' });
            io.emit('presence', { userId: socket.userId, status: 'offline' });
        }
        console.log('User joined...');
    });
});

// Connect Database and Start Server
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (err) {
        console.error('Failed to start server:', err.message);
    }
};

startServer();
