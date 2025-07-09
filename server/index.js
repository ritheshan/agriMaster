import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import fieldRoutes from './routes/field.routes.js';
import cropRoutes from './routes/crop.routes.js';
import weatherRoutes from './routes/weather.routes.js';
import communityRoutes from './routes/community.routes.js';
import mlRoutes from './routes/ml.routes.js';

// Initialize cron jobs
import './utils/cron.js';

dotenv.config(); // ✅ Already present
const app = express();

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ], // Allow requests from the frontend URL
    credentials: true, // Allow cookies to be sent
  })
);
app.use(express.json());
// Import Twilio client
import twilio from 'twilio';
console.log('🧪 TWILIO ENV LOADED:', process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
export const twilioClient = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null;

// CRITICAL NOTE: You cannot use both credentials:true AND origin:'*' - they are incompatible
// Using specific allowed origins with credentials:true

// Add debug endpoints directly to index.js
app.get('/api/cors-test', (req, res) => {
  console.log('GET test received with origin:', req.headers.origin);
  res.json({ success: true, message: 'CORS test successful!' });
});

app.post('/api/cors-test-post', (req, res) => {
  console.log('POST test received with origin:', req.headers.origin, 'body:', req.body);
  res.json({ success: true, message: 'POST test successful!', received: req.body });
});

// Rate limiting - with special handling for OPTIONS requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Don't rate limit preflight requests
  skip: (req, res) => req.method === 'OPTIONS'
});

app.use(limiter);

// DEBUG ENDPOINT - test CORS directly
app.options('/api/test-cors', (req, res) => {
  console.log('OPTIONS request received for test endpoint');
  res.status(200).send('CORS OK');
});

app.get('/api/test-cors', (req, res) => {
  console.log('GET request received for test endpoint');
  res.status(200).json({ message: 'CORS is working!' });
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

await connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/me', userRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/ml', mlRoutes);
app.get("/api/ping", (req, res) => {
  res.send("Server is up");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }
  
  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ No route matched: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    error: "Route not found",
    method: req.method,
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Database: ${process.env.MONGO_URI ? 'Connected' : 'Not configured'}`);
});