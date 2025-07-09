/**
 * Standalone Express server to test CORS issues
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Basic CORS setup
app.use(cors({
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true, // Important for cookies
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Parse JSON body
app.use(express.json());

// CORS test endpoint
app.get('/test', (req, res) => {
  console.log('GET test received');
  res.json({ message: 'CORS GET test successful!' });
});

// OPTIONS endpoint
app.options('/test-post', (req, res) => {
  console.log('OPTIONS request received for test-post');
  res.status(200).end();
});

// POST test endpoint
app.post('/test-post', (req, res) => {
  console.log('POST test received with body:', req.body);
  res.json({ 
    message: 'CORS POST test successful!', 
    receivedData: req.body 
  });
});

// Start server on different port
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Test with:');
  console.log(`curl http://localhost:${PORT}/test`);
  console.log(`curl -X POST -H "Content-Type: application/json" -d '{"test":"data"}' http://localhost:${PORT}/test-post`);
});
