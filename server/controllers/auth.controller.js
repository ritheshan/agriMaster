import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { google } from 'googleapis';
import { twilioClient } from '../index.js';

// Initialize Twilio client globally



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
  try {
    console.log("Received OTP request:", req.body);
    const { phoneNumber } = req.body;

    if (!phoneNumber || !/^\+\d{10,15}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Valid phone number required' });
    }

    // Find or create user
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      try {
        // Generate a username that will pass validation
        // Make sure it's at least 3 characters (minlength requirement)
        let tempUsername = phoneNumber.replace(/^\+/, '');
        if (tempUsername.length < 3) {
          tempUsername = 'user' + tempUsername; // Ensure at least 3 chars
        }
        
        console.log("Creating new user with phone:", phoneNumber, "and username:", tempUsername);
        
        // Create new user with minimum required fields
        user = new User({ 
          phoneNumber, 
          username: tempUsername,
          name: "User", // Add a default name
          role: 'user',
          authProviders: ['phone'] 
        });
      } catch (error) {
        console.error("Error creating user:", error);
        return res.status(400).json({ message: error.message });
      }
    }

    try {
      // Create hashed OTP & set expiry before saving
      const otp = user.createVerificationOTP();
      
      // Save user - explicitly catch save errors
      try {
        await user.save();
        console.log("User saved successfully");
      } catch (saveError) {
        console.error("Error saving user:", saveError);
        // Check for duplicate key error
        if (saveError.code === 11000) {
          return res.status(400).json({ message: "Username already exists. Try again with a different phone number." });
        }
        return res.status(400).json({ message: saveError.message || "Error saving user" });
      }
      
      // Send SMS using Twilio
      try {
        // Check if Twilio credentials exist
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
          throw new Error("Twilio credentials are missing");
        }
        
        // Log what we're using for debugging
        console.log("Using Twilio number:", process.env.TWILIO_PHONE_NUMBER);
        console.log("Sending to:", phoneNumber);
        
        // Create the message with basic required parameters
        const messageOptions = {
          body: `Your AgriMaster OTP is ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        };
        
        // Send the message
        const result = await twilioClient.messages.create(messageOptions);
        console.log("Twilio message SID:", result.sid);
        console.log("OTP sent successfully to:", phoneNumber);
        return res.status(200).json({ message: "OTP sent successfully" });
      } catch (twilioError) {
        console.error("Twilio error details:", twilioError);
        return res.status(500).json({ message: `Failed to send OTP via SMS: ${twilioError.message}` });
      }
    } catch (error) {
      console.error("OTP generation error:", error.message);
      return res.status(500).json({ message: "Failed to generate OTP" });
    }
  } catch (err) {
    console.error("General error in sendOtp:", err);
    return res.status(500).json({ message: "Failed to process OTP request" });
  }
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
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // None with secure:true for production cross-site
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
  .status(200)
  .json({
    message: 'Login successful',
    token: token, // Include token in response for non-cookie fallback
    user: {
      id: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role,
      name: user.name,
      profilePicture: user.profilePicture,
      profileCompleted: !!user.name // Basic check if profile is completed
    }
  });
};
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-__v');
  res.json(user);
};

/**
 * Register/complete profile for a user
 * Used after OTP verification to collect additional user information
 */
export const register = async (req, res) => {
  try {
    console.log("📝 Register request:", req.body);
    
    const { 
      phoneNumber,      // Required - identifies the user from OTP verification
      name,             // Full name
      username,         // Optional username for login
      email,            // Optional email
      password,         // Optional password for username/password login
      location,         // Location object with lat, lng, pincode
      cropsInterested,  // Array of crops the farmer is interested in
      profilePicture    // Optional profile picture URL
    } = req.body;
    
    // Find the user by phone number (should exist after OTP verification)
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found. Please verify your phone number first." 
      });
    }
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required for registration"
      });
    }
    
    // Update user information
    user.name = name;
    
    // Optional fields - only update if provided
    if (username) {
      // Check if username is already taken by another user
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: user._id } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken"
        });
      }
      
      user.username = username;
    }
    
    if (email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: user._id } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use"
        });
      }
      
      user.email = email;
    }
    
    // Handle password if provided
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters"
        });
      }
      
      user.password = password;
      
      // Add 'local' to auth providers if not already there
      if (!user.authProviders.includes('local')) {
        user.authProviders.push('local');
      }
    }
    
    // Update location if provided
    if (location) {
      user.location = {
        ...user.location || {},
        ...(location.lat && { lat: location.lat }),
        ...(location.lng && { lng: location.lng }),
        ...(location.pincode && { pincode: location.pincode })
      };
    }
    
    // Update crops interested
    if (cropsInterested && Array.isArray(cropsInterested)) {
      user.cropsInterested = cropsInterested;
    }
    
    // Update profile picture if provided
    if (profilePicture) {
      user.profilePicture = profilePicture;
    }
    
    // Set role to farmer
    if (user.role === 'user') {
      user.role = 'user'; // Keep as 'user' or change to 'farmer' if you have such a role
    }
    
    // Mark profile as completed
    user.profileCompleted = true;
    
    // Save user
    await user.save();
    
    // Generate a new token with updated user info
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return response with cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Return sanitized user data (without sensitive fields)
    const userData = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      location: user.location,
      cropsInterested: user.cropsInterested,
      profilePicture: user.profilePicture,
      profileCompleted: true
    };
    
    return res.status(200).json({
      success: true,
      message: "Registration successful!",
      user: userData,
      token // Include token in response for non-cookie fallback
    });
    
  } catch (error) {
    console.error("❌ Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  });
  
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

/**
 * Login with username/email and password
 * Allows login with either username, email, or phone number + password
 */
export const login = async (req, res) => {
  try {
    console.log("🔑 Login request received");
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide both identifier (username, email, or phone) and password" 
      });
    }

    // Find user by username, email, or phone number
    // Include password in the query result using .select('+password')
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier },
        { phoneNumber: identifier }
      ]
    }).select('+password');

    // Check if user exists
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Check if user has a password set
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "No password set for this account. Please use OTP login or set a password."
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Make sure 'local' is added to auth providers
    if (!user.authProviders.includes('local')) {
      user.authProviders.push('local');
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return sanitized user data
    const userData = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profilePicture: user.profilePicture,
      profileCompleted: user.profileCompleted
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userData,
      token // Include token in response for non-cookie fallback
    });
    
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Set or update password for a user
 * Requires authentication
 */
export const setPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user from request (set by authMiddleware)
    const userId = req.user.id;
    
    // Find user with password field
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // If user already has a password, verify current password
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required"
        });
      }
      
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect"
        });
      }
    }
    
    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }
    
    // Set new password
    user.password = newPassword;
    
    // Add 'local' to auth providers if not already there
    if (!user.authProviders.includes('local')) {
      user.authProviders.push('local');
    }
    
    // Save user
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
    
  } catch (error) {
    console.error("❌ Set password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update password. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};