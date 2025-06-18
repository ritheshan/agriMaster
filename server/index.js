import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/user.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());
app.use(cookieParser());

await connectDB();

app.use('/api/auth', authRoutes);  // ✅ NOTE THE SLASH
app.use('/api/me', userRoutes);    // ✅



app.use((req, res, next) => {
  console.log(`❌ No route matched: ${req.method} ${req.originalUrl}`);
  res.status(403).json({ error: "Forbidden — route not matched" });
});

app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});