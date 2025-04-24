import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { google } from 'googleapis';


const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const getGoogleAuthURL = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    redirect_uri: process.env.GOOGLE_REDIRECT_URI
  });

  res.json({ url });
};

export const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ success: false, message: 'No code provided' });
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    // Check if user already exists
    let user = await User.findOne({ email: googleUser.email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = new User({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.id,
        authProviders: ['google'],
        profilePicture: googleUser.picture,
        profileCompleted: false,
        role: 'user'
      });
    } else {
      if (!user.authProviders.includes('google')) {
        user.authProviders.push('google');
      }
      user.googleId = googleUser.id;
      user.profilePicture = googleUser.picture;
    }

    await user.save();

    // Sign JWT token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax', // or 'None' if frontend is on a different domain with HTTPS
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
res.redirect('http://localhost:5173/dashboard'); // or wherever you want to land
  } catch (err) {
    console.error('Google OAuth Error:', err);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
};

export const sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) return res.status(400).json({ message: 'Phone number required' });

  let user = await User.findOne({ phoneNumber });

  if (!user) {
    // Optional: create user if doesn't exist
    user = new User({ phoneNumber, role: 'user' });
  }

  const otp = user.createVerificationOTP();
  await user.save();  

  // TODO: Integrate with SMS service like Twilio here
  console.log('OTP to send:', otp); // For dev only

  res.status(200).json({ message: 'OTP sent successfully' });
};

export const verifyOtp = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  const user = await User.findOne({ phoneNumber });
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (!user.verifyOTP(otp)) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // ✅ Clear OTP fields
  user.verificationOtp = undefined;
  user.otpExpires = undefined;

  // 🔗 Ensure 'phone' is linked
  if (!user.authProviders?.includes('phone')) {
    user.authProviders = [...(user.authProviders || []), 'phone'];
  }

  await user.save();

  // ✅ Generate token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

res
  .cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // send over HTTPS only in prod
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
  .status(200)
  .json({
    message: 'Login successful',
    user: {
      id: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role,
      name: user.name
    }
  });
};
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-__v');
  res.json(user);
};