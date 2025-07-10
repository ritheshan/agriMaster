import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { google } from "googleapis";
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const getGoogleAuthURL = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  });

  res.json({ url });
};

export const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res
      .status(400)
      .json({ success: false, message: "No code provided" });
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
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
        authProviders: ["google"],
        profilePicture: googleUser.picture,
        profileCompleted: false,
        role: "user",
      });
    } else {
      if (!user.authProviders.includes("google")) {
        user.authProviders.push("google");
      }
      user.googleId = googleUser.id;
      user.profilePicture = googleUser.picture;
    }

    await user.save();

    // Sign JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax", // or 'None' if frontend is on a different domain with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.redirect("http://localhost:5173/dashboard"); // or wherever you want to land
  } catch (err) {
    console.error("Google OAuth Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Google authentication failed" });
  }
};

export const sendOtp = async (req, res) => {
  try {
    console.log("📩 Incoming OTP request:", req.body);

    const { phoneNumber } = req.body;

    // Ensure phone number exists and is properly formatted with international code
    if (!phoneNumber) {
      console.log("❌ Missing phone number");
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Normalize the phone number - make sure it has a + prefix and proper format
    let normalizedPhone = phoneNumber.trim().replace(/[^\d+]/g, "");

    // Ensure it has the + prefix
    if (!normalizedPhone.startsWith("+")) {
      // If it starts with 91 (India), add the + prefix
      if (normalizedPhone.startsWith("91")) {
        normalizedPhone = "+" + normalizedPhone;
      } else {
        // Assume India country code if not present
        normalizedPhone = "+91" + normalizedPhone.replace(/^0+/, "");
      }
    }

    // Final validation - must be +<country code><number> format with 10-15 digits total
    if (!/^\+\d{10,15}$/.test(normalizedPhone)) {
      console.log("❌ Invalid phone number format:", normalizedPhone);
      return res
        .status(400)
        .json({
          message:
            "Valid phone number with country code required (e.g. +911234567890)",
        });
    }

    console.log("✅ Normalized phone number:", normalizedPhone);

    // Find or create user
    let user = await User.findOne({ phoneNumber: normalizedPhone });
    if (!user) {
      console.log("Creating new user for phone:", normalizedPhone);
      user = new User({
        phoneNumber: normalizedPhone,
        role: "user",
        authProviders: ["phone"],
      });
    }

    // Create hashed OTP & set expiry
    console.log("Generating OTP for user:", user.phoneNumber);
    const otp = user.createVerificationOTP(); // ✅ Model method generates and saves hashed OTP
    console.log("Generated OTP (plaintext for sending):", otp);

    await user.save();
    console.log("User saved successfully with new OTP");

    // Check if Twilio is configured
    const twilioConfigured =
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER;

    // Development mode: Log the OTP but don't send SMS if Twilio isn't configured
    if (!twilioConfigured) {
      console.log("⚠️ Twilio not configured, using development mode");
      console.log("✅ DEV MODE OTP:", otp);

      // Return success response with dev mode indicator
      return res.status(200).json({
        message: "OTP sent successfully (DEV MODE - check server logs for OTP)",
        devMode: true,
        phoneNumber: normalizedPhone,
      });
    }

    // Production mode: Send OTP via SMS using Twilio
    try {
      console.log("Sending SMS via Twilio to:", normalizedPhone);
      await client.messages.create({
        body: `Your AgriMaster verification code is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: normalizedPhone,
      });

      console.log("✅ SMS sent successfully via Twilio");
      return res.status(200).json({
        message: "OTP sent successfully",
        phoneNumber: normalizedPhone,
      });
    } catch (twilioError) {
      console.error("❌ Twilio SMS sending error:", twilioError);

      // Fall back to dev mode if Twilio fails
      console.log("⚠️ Falling back to dev mode due to Twilio error");
      console.log("✅ DEV MODE OTP:", otp);

      return res.status(200).json({
        message:
          "OTP sent successfully (DEV MODE due to SMS failure - check server logs)",
        devMode: true,
        phoneNumber: normalizedPhone,
      });
    }
  } catch (err) {
    console.error("❌ Error in sendOtp:", err);
    return res
      .status(500)
      .json({ message: "Server error while sending OTP", error: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    console.log("📩 Incoming OTP verification request:", req.body);
    const { phoneNumber, otp } = req.body;

    // Input validation
    if (!phoneNumber) {
      console.log("❌ Missing phone number in verification request");
      return res.status(400).json({ message: "Phone number is required" });
    }

    if (!otp) {
      console.log("❌ Missing OTP code in verification request");
      return res.status(400).json({ message: "Verification code is required" });
    }

    // Normalize phone number format to match our storage format
    let normalizedPhone = phoneNumber.trim().replace(/[^\d+]/g, "");
    if (!normalizedPhone.startsWith("+")) {
      normalizedPhone = normalizedPhone.startsWith("91")
        ? "+" + normalizedPhone
        : "+91" + normalizedPhone.replace(/^0+/, "");
    }

    console.log("🔍 Looking for user with phone:", normalizedPhone);
    const user = await User.findOne({ phoneNumber: normalizedPhone });

    if (!user) {
      console.log("❌ No user found with phone:", normalizedPhone);
      return res
        .status(404)
        .json({ message: "User not found with this phone number" });
    }

    console.log("✅ User found, verifying OTP");
    if (!user.verifyOTP(otp)) {
      console.log("❌ Invalid or expired OTP");
      return res.status(400).json({
        message:
          "Invalid or expired verification code. Please try again or request a new code.",
      });
    }

    console.log("✅ OTP verified successfully");

    // Clear OTP fields after successful verification
    user.verificationOtp = undefined;
    user.otpExpires = undefined;

    // Ensure 'phone' is in the auth providers list
    if (!user.authProviders?.includes("phone")) {
      user.authProviders = [...(user.authProviders || []), "phone"];
    }

    await user.save();
    console.log("✅ User updated after OTP verification");

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    console.log("✅ JWT token generated");

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // send over HTTPS only in prod
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        message: "Login successful",
        user: {
          id: user._id,
          phoneNumber: user.phoneNumber,
          role: user.role,
          name: user.name,
        },
      });
  } catch (error) {
    console.error("❌ Error in verifyOtp:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in getMe:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
