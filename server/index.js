import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js'; // Make sure the `.js` extension is included
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

const app = express();
dotenv.config();

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
await connectDB(); // top-level await is allowed in ES modules



app.use('/auth', authRoutes);
app.use('/me', userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
