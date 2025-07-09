/**
 * This is a simplified auth controller with minimal dependencies
 * Used for debugging CORS issues
 */
import express from 'express';
import cors from 'cors';

const app = express();

// CORS configuration - allow specific origins with credentials
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5500'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: 'Content-Type,Authorization'
}));

// JSON parser
app.use(express.json());

// Simple test routes
app.get('/test', (req, res) => {
  console.log('GET /test request received');
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', req.headers);
  
  res.json({ success: true, message: 'GET test successful' });
});

app.post('/test', (req, res) => {
  console.log('POST /test request received');
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  res.json({ success: true, message: 'POST test successful', received: req.body });
});

// Test send-otp route
app.post('/api/auth/send-otp', (req, res) => {
  console.log('POST /api/auth/send-otp request received');
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  // Simple response without any actual OTP functionality
  res.json({ 
    success: true, 
    message: 'OTP sent successfully (simulated)',
    debug: {
      receivedPhone: req.body.phoneNumber,
      timestamp: new Date().toISOString()
    }
  });
});

// Start server on different port
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Debug server running on http://localhost:${PORT}`);
  console.log('Test with:');
  console.log(`curl http://localhost:${PORT}/test`);
  console.log(`curl -X POST -H "Content-Type: application/json" -d '{"test":"data"}' http://localhost:${PORT}/test`);
  console.log(`curl -X POST -H "Content-Type: application/json" -d '{"phoneNumber":"+1234567890"}' http://localhost:${PORT}/api/auth/send-otp`);
});
