import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Lock as LockIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import axios from 'axios';

type Step = 'email' | 'otp' | 'newPassword';

const ForgotPassword: React.FC = () => {
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      
      if (response.data.ok) {
        showSuccess('OTP has been sent to your email address');
        setCurrentStep('otp');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      showError(message);
      setErrors({ email: message });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      setErrors({ otp: 'OTP is required' });
      return;
    }
    
    if (otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      
      if (response.data.ok) {
        showSuccess('OTP verified successfully');
        setCurrentStep('newPassword');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid OTP. Please try again.';
      showError(message);
      setErrors({ otp: message });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });
      
      if (response.data.ok) {
        showSuccess('Password has been reset successfully! Please login with your new password.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password. Please try again.';
      showError(message);
      setErrors({ newPassword: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'otp') {
      setCurrentStep('email');
      setOtp('');
    } else if (currentStep === 'newPassword') {
      setCurrentStep('otp');
      setNewPassword('');
      setConfirmPassword('');
    }
    setErrors({});
  };

  // Render Step 1: Email Input
  const renderEmailStep = () => (
    <Box component="form" onSubmit={handleSendOTP} sx={{ width: '100%' }}>
      <Box textAlign="center" mb={4}>
        <Typography component="h1" variant="h4" fontWeight={700} color="primary.main" gutterBottom>
          Forgot Password?
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter your email address and we'll send you an OTP to reset your password
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setErrors({});
        }}
        error={!!errors.email}
        helperText={errors.email}
        margin="normal"
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="action" />
            </InputAdornment>
          ),
        }}
        autoComplete="email"
        autoFocus
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2, py: 1.5 }}
      >
        {isLoading ? (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={20} color="inherit" />
            Sending OTP...
          </Box>
        ) : (
          'Send OTP'
        )}
      </Button>

      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>

      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Remember your password?{' '}
          <Link
            component={RouterLink}
            to="/login"
            variant="body2"
            color="primary"
            fontWeight={600}
            underline="hover"
          >
            Sign in here
          </Link>
        </Typography>
      </Box>
    </Box>
  );

  // Render Step 2: OTP Verification
  const renderOTPStep = () => (
    <Box component="form" onSubmit={handleVerifyOTP} sx={{ width: '100%' }}>
      <Box textAlign="center" mb={4}>
        <Typography component="h1" variant="h4" fontWeight={700} color="primary.main" gutterBottom>
          Verify OTP
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter the 6-digit OTP sent to
        </Typography>
        <Typography variant="body1" fontWeight={600} color="primary.main">
          {email}
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="Enter OTP"
        type="text"
        value={otp}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
          setOtp(value);
          setErrors({});
        }}
        error={!!errors.otp}
        helperText={errors.otp || 'Please enter the 6-digit OTP from your email'}
        margin="normal"
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <VpnKeyIcon color="action" />
            </InputAdornment>
          ),
        }}
        inputProps={{
          maxLength: 6,
          pattern: '[0-9]{6}',
          inputMode: 'numeric',
        }}
        autoFocus
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading || otp.length !== 6}
        sx={{ mt: 3, mb: 2, py: 1.5 }}
      >
        {isLoading ? (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={20} color="inherit" />
            Verifying...
          </Box>
        ) : (
          'Verify OTP'
        )}
      </Button>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="text"
        >
          Back
        </Button>
        <Button
          onClick={() => {
            setOtp('');
            handleSendOTP(new Event('submit') as any);
          }}
          variant="text"
          disabled={isLoading}
        >
          Resend OTP
        </Button>
      </Box>
    </Box>
  );

  // Render Step 3: New Password
  const renderNewPasswordStep = () => (
    <Box component="form" onSubmit={handleResetPassword} sx={{ width: '100%' }}>
      <Box textAlign="center" mb={4}>
        <Typography component="h1" variant="h4" fontWeight={700} color="primary.main" gutterBottom>
          Set New Password
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create a strong password for your account
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.target.value);
          setErrors({});
        }}
        error={!!errors.newPassword}
        helperText={errors.newPassword || 'Password must be at least 6 characters'}
        margin="normal"
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="action" />
            </InputAdornment>
          ),
        }}
        autoFocus
      />

      <TextField
        fullWidth
        label="Confirm New Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          setErrors({});
        }}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        margin="normal"
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2, py: 1.5 }}
      >
        {isLoading ? (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={20} color="inherit" />
            Resetting Password...
          </Box>
        ) : (
          'Reset Password'
        )}
      </Button>

      <Box display="flex" justifyContent="flex-start">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="text"
        >
          Back
        </Button>
      </Box>
    </Box>
  );

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          {currentStep === 'email' && renderEmailStep()}
          {currentStep === 'otp' && renderOTPStep()}
          {currentStep === 'newPassword' && renderNewPasswordStep()}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;