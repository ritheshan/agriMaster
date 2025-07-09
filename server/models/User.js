import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    match: [/^\+?\d{10,15}$/, 'Please provide a valid phone number']
  },

  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address']
  },

  username: {
    type: String,
    unique: true,
    sparse: true, // This allows null/undefined values
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username must be at most 20 characters'],
    // No required validation - it's optional for phone login
  },
  googleId: {
  type: String,
  unique: true,
  sparse: true
},
authProviders: {
  type: [String], // 'phone', 'google', 'local'
  default: []
},

  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't include password in query results by default
    required: function () {
      // Password required for local login or admin/expert roles
      return this.authProviders?.includes('local') || 
             this.role === 'admin' || 
             this.role === 'expert';
    }
  },

  role: {
    type: String,
    enum: ['user', 'expert', 'admin'],
    default: 'user'
  },

  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name must be at most 50 characters']
  },

  profilePicture: {
    type: String,
    default: '/profile.png'
  },

  location: {
    lat: {
      type: Number,
      required: false
    },
    lng: {
      type: Number,
      required: false
    },
    pincode: {
      type: String,
      trim: true
    }
  },

  cropsInterested: {
    type: [String],
    default: []
  },

  cropRecords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CropRecord'
  }],

  profileCompleted: {
    type: Boolean,
    default: false
  },

  verificationOtp: String,         // 🔐 Hashed OTP
  otpExpires: Date,                // ⏱️ Expiration time for OTP

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 🔐 Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  // Skip if no password or it's not modified
  if (!this.password || !this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

// ✅ Password comparison method
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

// 🔑 OTP generation method (adds to document)
userSchema.methods.createVerificationOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

  this.verificationOtp = crypto.createHash('sha256').update(otp).digest('hex');
  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min expiry

  return otp; // Return plain OTP to send via SMS
};

// ✅ OTP verification method (optional helper)
userSchema.methods.verifyOTP = function (enteredOtp) {
  const hashed = crypto.createHash('sha256').update(enteredOtp).digest('hex');
  return (
    this.verificationOtp === hashed &&
    this.otpExpires &&
    this.otpExpires > Date.now()
  );
};

const User = mongoose.model('User', userSchema);
export default User;