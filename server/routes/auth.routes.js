import express from "express";
import {
  sendOtp,
  verifyOtp,
  getMe,
  getGoogleAuthURL,
  handleGoogleCallback,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/me", authMiddleware, getMe);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/google/url", getGoogleAuthURL);
router.get("/google/callback", handleGoogleCallback);

// Test endpoint for debugging
router.post("/test-otp", (req, res) => {
  console.log("Test OTP endpoint hit");
  console.log("Request body:", req.body);
  console.log("Environment variables check:");
  console.log(
    "TWILIO_ACCOUNT_SID:",
    process.env.TWILIO_ACCOUNT_SID ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "TWILIO_AUTH_TOKEN:",
    process.env.TWILIO_AUTH_TOKEN ? "✅ Set" : "❌ Missing"
  );
  console.log(
    "TWILIO_PHONE_NUMBER:",
    process.env.TWILIO_PHONE_NUMBER ? "✅ Set" : "❌ Missing"
  );
  console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Missing");

  res.json({
    message: "Test endpoint working",
    body: req.body,
    env: {
      twilioSid: !!process.env.TWILIO_ACCOUNT_SID,
      twilioToken: !!process.env.TWILIO_AUTH_TOKEN,
      twilioPhone: !!process.env.TWILIO_PHONE_NUMBER,
      jwtSecret: !!process.env.JWT_SECRET,
    },
  });
});

export default router;
