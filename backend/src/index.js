const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
if (!globalThis.crypto) {
  globalThis.crypto = require('crypto');
}
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const errorHandler = require('./middleware/errorHandler');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
// Load env vars

dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Standard Middleware (Must be before security middleware)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost', 'http://localhost:80'];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (
    allowedOrigins.includes(origin) || 
    allowedOrigins.includes('*') || 
    allowedOrigins.includes('all') ||
    origin.endsWith('.vercel.app') || // Automatically allow all Vercel domains
    origin.endsWith('.onrender.com')  // Automatically allow all Render domains
  ) {
    return true;
  }
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json());

// Security Middleware
app.use(helmet());
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  next();
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/practice', practiceRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});
app.use(errorHandler); 
// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
});
// Start the BullMQ submission worker
require('./workers/submissionWorker');

require('./sockets')(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
