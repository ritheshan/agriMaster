const otpMap = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

export const storeOTP = (phone) => {
  const otp = generateOTP();
  otpMap.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
   // Simulate sending OTP
  console.log(`OTP for ${phoneNumber}: ${otp}`);
};

export const verifyOTP = (phone, otp) => {
  const record = otpMap.get(phone);
  if (!record || record.expiresAt < Date.now()) return false;
  otpMap.delete(phone); // one-time use
  return record.otp === otp;

};


