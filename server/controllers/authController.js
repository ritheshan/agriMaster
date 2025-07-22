import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { storeOTP, verifyOTP, removeOTP } from '../utils/otpStore.js';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const sendOTP = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required' });

  const otp = generateOTP();
  storeOTP(phoneNumber, otp);

  // Simulate sending OTP
  console.log(`OTP for ${phoneNumber}: ${otp}`);
  res.status(200).json({ message: 'OTP sent successfully' });
};

export const verifyOTPController = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  if (!verifyOTP(phoneNumber, otp)) return res.status(400).json({ message: 'Invalid or expired OTP' });

  let user = await User.findOne({ phoneNumber });
  if (!user) user = await User.create({ phoneNumber });

  const token = generateToken(user);
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'Strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  removeOTP(phoneNumber);

  res.status(200).json({ token, user: { id: user._id, phoneNumber: user.phoneNumber, role: user.role } });
};