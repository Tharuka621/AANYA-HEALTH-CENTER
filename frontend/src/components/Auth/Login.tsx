import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLogin } from '../../hooks/useAuth';

interface ErrorDetails {
  message: string;
  type: 'invalid_credentials' | 'account_disabled' | 'field_error' | 'server_error' | 'network_error';
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{email?: string, password?: string}>({});
  
  const loginMutation = useLogin();
  const navigate = useNavigate();

  const validateFields = () => {
    const errors: {email?: string, password?: string} = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    setFieldErrors({});

    // Validate fields first
    if (!validateFields()) {
      return;
    }

    setLoading(true);

    try {
      const result = await loginMutation.mutateAsync({ email, password });
      console.log('Login successful:', result);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Full error object:', err);
      console.error('Error keys:', Object.keys(err));
      
      // Get error message from various possible sources
      let errMessage = '';
      let statusCode = null;
      
      // Try to extract message from different error structures
      if (err?.message) {
        errMessage = err.message;
      } 
      if (err?.response?.data?.message) {
        errMessage = err.response.data.message;
      } 
      if (err?.response?.status) {
        statusCode = err.response.status;
      }
      if (typeof err === 'string') {
        errMessage = err;
      }
      
      // Fallback message
      if (!errMessage) {
        errMessage = 'An error occurred during login';
      }
      
      console.log('Extracted - Message:', errMessage, 'Status:', statusCode);
      
      // Classify the error
      let errorDetails: ErrorDetails;
      
      const msgLower = errMessage.toLowerCase();
      
      if (msgLower.includes('disabled') || msgLower.includes('account is disabled')) {
        errorDetails = {
          message: 'Your account has been disabled. Please contact the administrator.',
          type: 'account_disabled'
        };
      } else if (
        msgLower.includes('invalid email or password') ||
        msgLower.includes('invalid credentials') ||
        msgLower.includes('incorrect') ||
        statusCode === 401
      ) {
        errorDetails = {
          message: 'Incorrect email or password. Please check and try again.',
          type: 'invalid_credentials'
        };
      } else if (msgLower.includes('network') || msgLower.includes('failed to fetch')) {
        errorDetails = {
          message: 'Network error. Please check your connection and try again.',
          type: 'network_error'
        };
      } else if (msgLower.includes('server') || statusCode === 500) {
        errorDetails = {
          message: 'Server error. Please try again later.',
          type: 'server_error'
        };
      } else {
        errorDetails = {
          message: errMessage || 'Login failed. Please try again.',
          type: 'field_error'
        };
      }
      
      console.log('Setting error details:', errorDetails);
      setError(errorDetails);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'admin@aanya.com', password: 'admin123', role: 'Administrator' },
    { email: 'doctor@aanya.com', password: 'doctor123', role: 'Doctor' },
    { email: 'receptionist@aanya.com', password: 'reception123', role: 'Receptionist' },
    { email: 'pharmacist@aanya.com', password: 'pharma123', role: 'Pharmacist' },
    { email: 'labtech@aanya.com', password: 'lab123', role: 'Lab Technician' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">AANYA Health Center</h2>
          <p className="text-gray-600">Management System</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Global Error Alert */}
          {error && (
            <div className={`p-4 rounded-lg flex gap-3 ${
              error.type === 'invalid_credentials' || error.type === 'account_disabled'
                ? 'bg-red-50 border border-red-200'
                : error.type === 'network_error' || error.type === 'server_error'
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                error.type === 'invalid_credentials' || error.type === 'account_disabled'
                  ? 'text-red-600'
                  : error.type === 'network_error' || error.type === 'server_error'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`} />
              <p className={`text-sm font-medium ${
                error.type === 'invalid_credentials' || error.type === 'account_disabled'
                  ? 'text-red-800'
                  : error.type === 'network_error' || error.type === 'server_error'
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
                {error.message}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  fieldErrors.email ? 'text-red-400' : 'text-gray-400'
                }`} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`pl-10 appearance-none relative block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.email
                      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  fieldErrors.password ? 'text-red-400' : 'text-gray-400'
                }`} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`pl-10 pr-10 appearance-none relative block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.password
                      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {fieldErrors.password}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="mt-8">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">Demo Accounts</p>
          </div>
          <div className="grid gap-2 text-xs">
            {demoAccounts.map((account, index) => (
              <div 
                key={index}
                className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{account.role}</span>
                  <span className="text-gray-500">{account.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;