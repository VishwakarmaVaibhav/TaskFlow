const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
  },
});

// Make io accessible via req.app.get('io') in controllers
app.set('io', io);

// Socket connection and room logic
io.on('connection', (socket) => {
  // Client explicitly specifies which user room to join automatically when connecting
  socket.on('join_room', (userId) => {
    socket.join(userId);
  });
});

// Body parser
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
  })
);

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// User search route (mounted separately for clean URLs)
const { protect } = require('./middleware/auth');
const { searchUsers } = require('./controllers/taskController');
app.get('/api/users/search', protect, searchUsers);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('✖ Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n✦ TaskFlow API + Socket.IO running on port ${PORT}`);
  console.log(`✦ Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
