const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');

let io;
const onlineUsers = new Map(); // userId -> socket.id

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000' }
  });

  // Authenticate socket using token in handshake auth
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.user.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected', socket.userId);
    onlineUsers.set(socket.userId, socket.id);

    // emit online users list (IDs only)
    io.emit('online-users', Array.from(onlineUsers.keys()));

    socket.on('typing', ({ to, isTyping }) => {
      const toSocket = onlineUsers.get(to);
      if (toSocket) io.to(toSocket).emit('typing', { from: socket.userId, isTyping });
    });

    socket.on('private-message', async ({ to, content }) => {
      try {
        const msg = new Message({ from: socket.userId, to, content });
        await msg.save();
        const payload = {
          _id: msg._id,
          from: msg.from.toString(),
          to: msg.to.toString(),
          content: msg.content,
          createdAt: msg.createdAt
        };
        const toSocket = onlineUsers.get(to);
        if (toSocket) io.to(toSocket).emit('private-message', payload);
        socket.emit('private-message', payload); // echo to sender
      } catch (err) {
        console.error('Error saving message', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected', socket.userId);
      onlineUsers.delete(socket.userId);
      io.emit('online-users', Array.from(onlineUsers.keys()));
    });
  });
}

module.exports = { initSocket };
