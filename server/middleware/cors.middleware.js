/**
 * Special CORS middleware for troubleshooting CORS issues
 */
export const corsMiddleware = (req, res, next) => {
  console.log(`CORS middleware handling ${req.method} request to ${req.originalUrl}`);
  console.log(`Origin: ${req.headers.origin}`);
  
  // NOTE: You must choose EITHER credentials mode with specific origin OR '*' without credentials
  // You cannot use both credentials:true AND Access-Control-Allow-Origin: '*'
  
  // For credentials mode:
  const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://127.0.0.1:5500'  // Added for testing with the HTML file
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    // No credentials mode - allows any origin
    res.header('Access-Control-Allow-Origin', '*');
    // Don't set credentials to true here
  }
  
  // Essential headers
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('Responding to OPTIONS request');
    return res.status(204).end();
  }
  
  next();
};
