// ✅ FILE: server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');
const admin = require('./firebaseAdmin'); // ✅ Firebase Admin SDK

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const matchRoutes = require('./routes/matchRoutes');
const presenceRoute = require('./routes/presenceRoute');

// Express and HTTP setup
const app = express();
const server = http.createServer(app);

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ PeerJS server setup (WebRTC signaling)
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/',
});
app.use('/peerjs', peerServer); // WebRTC signaling endpoint

// ✅ MongoDB connection test
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit if DB fails to connect
  });

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/presence', presenceRoute);

// ✅ Firebase Realtime DB write test (optional endpoint)
app.post('/api/message', async (req, res) => {
  const { userId, message } = req.body;
  try {
    await admin.database().ref(`messages/${userId}`).push({
      text: message,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });
    res.status(200).send({ success: true, message: 'Message stored!' });
  } catch (error) {
    console.error('❌ Firebase DB error:', error);
    res.status(500).send({ success: false, error: 'Database error' });
  }
});

// ✅ Socket.IO setup for Omegle-style + PeerJS signaling
const io = new Server(server, {
  cors: { origin: '*' },
});

const waitingUsers = [];

io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  // 🔁 Random match queue (Omegle-style)
  socket.on('join-random', () => {
    if (waitingUsers.length > 0) {
      const peerSocket = waitingUsers.pop();
      socket.emit('match-found', { peerId: peerSocket });
      io.to(peerSocket).emit('match-found', { peerId: socket.id });
      console.log(`🔗 Matched ${socket.id} <--> ${peerSocket}`);
    } else {
      waitingUsers.push(socket.id);
      console.log(`🕓 Added to waiting queue: ${socket.id}`);
    }
  });

  // 🔁 PeerJS join-room event
  socket.on('join-room', ({ roomId, peerId }) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', peerId);
    console.log(`📞 Peer ${peerId} joined room ${roomId}`);
  });

  // 📴 Handle disconnect
  socket.on('disconnect', () => {
    const index = waitingUsers.indexOf(socket.id);
    if (index !== -1) {
      waitingUsers.splice(index, 1);
      console.log(`🔌 Removed from queue: ${socket.id}`);
    }
  });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
