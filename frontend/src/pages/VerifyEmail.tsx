import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  VpnKey as VpnKeyIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import axios from 'axios';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showError, showSuccess } = useToast();
  
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleVerify = async (e: React.FormEvent) => {
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
      const response = await axios.post(`${API_URL}/auth/verify-email`, { email, otp });
      
      if (response.data.ok) {
        showSuccess('Email verified successfully!');
        
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Navigate to appropriate dashboard
        setTimeout(() => {
          const role = response.data.user.role?.toLowerCase();
          if (role === 'patient') {
            navigate('/patient/dashboard');
          } else {
            navigate(`/${role}/dashboard`);
          }
        }, 1000);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid OTP. Please try again.';
      showError(message);
      setErrors({ otp: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrors({});

    try {
      const response = await axios.post(`${API_URL}/auth/resend-verification`, { email });
      
      if (response.data.ok) {
        showSuccess('Verification code sent! Please check your email.');
        setOtp('');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend code.';
      showError(message);
    } finally {
      setIsResending(false);
    }
  };

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
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <EmailIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Typography component="h1" variant="h4" fontWeight={700} color="primary.main" gutterBottom>
              Verify Your Email
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We've sent a 6-digit code to
            </Typography>
            <Typography variant="body1" fontWeight={600} color="primary.main">
              {email}
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleVerify} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Enter Verification Code"
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
                setErrors({});
              }}
              error={!!errors.otp}
              helperText={errors.otp || 'Enter the 6-digit code from your email'}
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
                'Verify Email'
              )}
            </Button>

            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                onClick={handleResend}
                variant="text"
                disabled={isResending}
              >
                {isResending ? 'Sending...' : 'Resend Code'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmail;
