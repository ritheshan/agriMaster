import rateLimit from 'express-rate-limit';

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // limit each IP to 3 OTP requests per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many OTP requests. Please try again after 10 minutes.'
  }
});

export default otpLimiter;