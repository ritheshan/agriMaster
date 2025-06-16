import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { storeOTP, verifyOTP } from '../utils/otpStore.js';


const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

import User from '../models/User.js';

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