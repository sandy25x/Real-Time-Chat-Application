const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve the public directory (your HTML, JS, and CSS)
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle user join
    socket.on('join', (username) => {
        socket.username = username;
        console.log(`${username} joined the chat`);
        socket.broadcast.emit('user-joined', username);
    });

    // Handle message
    socket.on('message', (data) => {
        console.log('Message received:', data);
        io.emit('message', data); // Send the message to all connected clients
    });

    // Handle typing
    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);
    });

    // Handle stop typing
    socket.on('stopTyping', () => {
        socket.broadcast.emit('stopTyping');
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        if (socket.username) {
            console.log(`${socket.username} disconnected`);
            socket.broadcast.emit('user-left', socket.username);
        }
    });
});

// Start server
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
