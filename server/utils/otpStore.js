const otpMap = new Map();

export const storeOTP = (phone, otp) => {
  otpMap.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
};

export const verifyOTP = (phone, otp) => {
  const record = otpMap.get(phone);
  if (!record || record.expiresAt < Date.now()) return false;
  return record.otp === otp;
};

export const removeOTP = (phone) => otpMap.delete(phone);
