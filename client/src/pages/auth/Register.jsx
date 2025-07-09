import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Phone entry, 2 = OTP verification, 3 = Profile completion
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form handling for different steps
  const {
    register: registerPhone,
    handleSubmit: handleSubmitPhone,
    formState: { errors: phoneErrors }
  } = useForm();
  
  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors }
  } = useForm();
  
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    watch
  } = useForm({
    defaultValues: {
      role: 'user',
      cropsInterested: []
    }
  });
  
  // Handler for phone number submission
  const onSubmitPhone = async (data) => {
    setIsLoading(true);
    try {
      // Format phone number to add '+' prefix if not present
      let formattedPhone = data.phoneNumber;
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      
      const response = await authService.sendOtp(formattedPhone);
      
      if (response.status === 200) {
        setPhoneNumber(formattedPhone);
        setStep(2);
        toast.success('OTP sent to your phone!');
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler for OTP verification
  const onSubmitOtp = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyOtp(phoneNumber, data.otp);
      
      if (response.status === 200) {
        // Store the token if it's in the response
        const token = response.data.token;
        if (token) {
          localStorage.setItem('token', token);
        }
        
        setStep(3);
        toast.success('OTP verified successfully. Complete your profile to continue.');
      } else {
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler for profile completion
  const onSubmitProfile = async (data) => {
    setIsLoading(true);
    try {
      // Combine phone number with profile data
      const userData = {
        ...data,
        phoneNumber
      };
      
      // Handle location data
      if (data.pincode) {
        userData.location = {
          pincode: data.pincode
        };
        delete userData.pincode;
      }
      
      const response = await authService.register(userData);
      
      if (response.data.success) {
        toast.success('Registration successful! Please log in.');
        navigate('/login');
      } else {
        toast.error(response.data.message || 'Failed to complete registration');
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      toast.error(error.response?.data?.message || 'Failed to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler for OTP resend
  const resendOtp = async () => {
    try {
      const response = await authService.sendOtp(phoneNumber);
      
      if (response.status === 200) {
        toast.success('New OTP sent to your phone!');
      } else {
        toast.error(response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };
  
  // Common crop types in India
  const cropOptions = [
    'Rice', 'Wheat', 'Maize', 'Bajra', 'Jowar',
    'Cotton', 'Sugarcane', 'Pulses', 'Vegetables', 'Fruits',
    'Spices', 'Oilseeds', 'Tea', 'Coffee', 'Jute'
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <img 
            src="/src/assets/logo.svg" 
            alt="AgriMaster Logo"
            className="mx-auto h-16 w-auto" 
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Step 1: Phone Number Input */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleSubmitPhone(onSubmitPhone)}>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    className={`appearance-none block w-full px-3 py-2 border ${phoneErrors.phoneNumber ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder="Enter your phone number (e.g., +919876543210)"
                    {...registerPhone('phoneNumber', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^\+?\d{10,15}$/,
                        message: 'Please enter a valid phone number (10-15 digits)'
                      }
                    })}
                  />
                </div>
                {phoneErrors.phoneNumber && (
                  <p className="mt-2 text-sm text-red-600">{phoneErrors.phoneNumber.message}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={handleSubmitOtp(onSubmitOtp)}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    type="text"
                    className={`appearance-none block w-full px-3 py-2 border ${otpErrors.otp ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder="Enter the 6-digit code"
                    {...registerOtp('otp', { 
                      required: 'Verification code is required',
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: 'Please enter a valid 6-digit code'
                      }
                    })}
                  />
                </div>
                {otpErrors.otp && (
                  <p className="mt-2 text-sm text-red-600">{otpErrors.otp.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Change phone number
                  </button>
                </div>
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Resend code
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Profile Completion */}
          {step === 3 && (
            <form className="space-y-6" onSubmit={handleSubmitProfile(onSubmitProfile)}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    type="text"
                    className={`appearance-none block w-full px-3 py-2 border ${profileErrors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    {...registerProfile('name', { 
                      required: 'Full name is required',
                      maxLength: { value: 50, message: 'Name is too long' }
                    })}
                  />
                </div>
                {profileErrors.name && (
                  <p className="mt-2 text-sm text-red-600">{profileErrors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    type="text"
                    className={`appearance-none block w-full px-3 py-2 border ${profileErrors.username ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    {...registerProfile('username', { 
                      required: 'Username is required',
                      minLength: { value: 3, message: 'Username must be at least 3 characters' },
                      maxLength: { value: 20, message: 'Username must be at most 20 characters' }
                    })}
                  />
                </div>
                {profileErrors.username && (
                  <p className="mt-2 text-sm text-red-600">{profileErrors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                  Pincode
                </label>
                <div className="mt-1">
                  <input
                    id="pincode"
                    type="text"
                    className={`appearance-none block w-full px-3 py-2 border ${profileErrors.pincode ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    {...registerProfile('pincode', { 
                      required: 'Pincode is required',
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: 'Please enter a valid 6-digit pincode'
                      }
                    })}
                  />
                </div>
                {profileErrors.pincode && (
                  <p className="mt-2 text-sm text-red-600">{profileErrors.pincode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <div className="mt-1 space-y-2">
                  <div className="flex items-center">
                    <input
                      id="role-user"
                      type="radio"
                      value="user"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      {...registerProfile('role')}
                    />
                    <label htmlFor="role-user" className="ml-3 block text-sm font-medium text-gray-700">
                      Farmer
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="role-expert"
                      type="radio"
                      value="expert"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      {...registerProfile('role')}
                    />
                    <label htmlFor="role-expert" className="ml-3 block text-sm font-medium text-gray-700">
                      Agriculture Expert
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Crops Interested In
                </label>
                <div className="mt-1 grid grid-cols-2 gap-y-2">
                  {cropOptions.map((crop) => (
                    <div key={crop} className="flex items-center">
                      <input
                        id={`crop-${crop}`}
                        type="checkbox"
                        value={crop}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        {...registerProfile('cropsInterested')}
                      />
                      <label htmlFor={`crop-${crop}`} className="ml-2 block text-sm text-gray-700">
                        {crop}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Completing Registration...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Google Sign-In */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/api/auth/google"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                  </g>
                </svg>
                Sign up with Google
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
