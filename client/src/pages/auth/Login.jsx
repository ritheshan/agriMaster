import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const Login = () => {
  const { handleLogin } = useAuth();
  const [step, setStep] = useState(1); // 1 = Phone entry, 2 = OTP verification
  const [phoneNumber, setPhoneNumber] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: registerOtp, handleSubmit: handleSubmitOtp, formState: { errors: otpErrors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  
  const onSubmitPhone = async (data) => {
    setIsLoading(true);
    try {
      // Format phone number - ensure it has + prefix
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
      console.error('Login error:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to send OTP. Please try again.');
      } else if (error.request) {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmitOtp = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyOtp(phoneNumber, data.otp);
      
      // The backend returns a token in cookies, and user data in the response
      if (response.status === 200) {
        // Get the token from the response or local storage
        const token = response.data.token || document.cookie.match('(^|;)\\s*token\\s*=\\s*([^;]+)')?.pop();
        
        // Handle the user data
        const userData = response.data.user || {};
        
        // Use the AuthContext to log in the user
        handleLogin(token, userData);
        toast.success('Login successful!');
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
  
  const resendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await authService.sendOtp(phoneNumber);
      
      if (response.status === 200) {
        // Show the OTP if it's returned from the API (development mode)
        if (response.data.otp) {
          // Display the OTP prominently for development testing
          console.log('%c 🔑 DEVELOPMENT OTP: ' + response.data.otp, 'background: #222; color: #bada55; font-size: 16px; padding: 10px;');
          
          toast.info(
            <div className="text-center">
              <div className="text-xl font-bold">DEV MODE: New OTP</div>
              <div className="text-3xl mt-2 bg-gray-100 p-2 rounded">{response.data.otp}</div>
            </div>, 
            {
              autoClose: false, // Keep this notification visible
              closeOnClick: false,
              draggable: false,
              position: "top-center"
            }
          );
          
          // If there was a Twilio error, show it but with lower severity
          if (response.data.twilioError) {
            toast.warning(`Note: SMS not sent (${response.data.twilioError}), but you can use the displayed OTP for testing`);
          }
        } else {
          toast.success('New OTP sent to your phone!');
        }
      } else {
        toast.error(response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };
  
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
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmitPhone)}>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    className={`appearance-none block w-full px-3 py-2 border ${errors.phoneNumber ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    placeholder="Enter your phone number"
                    {...register('phoneNumber', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Please enter a valid 10-digit phone number'
                      }
                    })}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-2 text-sm text-red-600">{errors.phoneNumber.message}</p>
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
          ) : (
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
                    'Verify & Sign In'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
