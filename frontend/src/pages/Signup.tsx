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
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  VpnKey as VpnKeyIcon,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSignup } from '../hooks/useAuth';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

type Step = 'signup' | 'verify';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const signup = useSignup();
  const { showError, showSuccess } = useToast();
  const { loading } = useAuth();

  const [currentStep, setCurrentStep] = useState<Step>('signup');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Check how strong the password is for the UI helper.
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    if (criteria.length) score++;
    if (criteria.uppercase) score++;
    if (criteria.lowercase) score++;
    if (criteria.number) score++;
    if (criteria.special) score++;

    if (score <= 2) return { score: (score / 5) * 100, label: 'Weak', color: 'error' };
    if (score === 3) return { score: (score / 5) * 100, label: 'Fair', color: 'warning' };
    if (score === 4) return { score: (score / 5) * 100, label: 'Good', color: 'info' };
    return { score: 100, label: 'Strong', color: 'success' };
  };

  // Show which password rules are met.
  const getPasswordCriteria = (password: string) => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordCriteria = getPasswordCriteria(formData.password);
  // Check every signup field before sending data to the server.
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create the account and move to email verification if needed.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await signup.mutateAsync({
        full_name: formData.full_name.trim(),
        email: formData.email,
        password: formData.password,
      });

      // Move to the next step only if verification is required.
      if (response.requiresVerification) {
        showSuccess('Account created! Please check your email for verification code.');
        setCurrentStep('verify');
      } else {
        showSuccess('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard/patient');
        }, 1000);
      }
    } catch (error: any) {
      showError(error.message || 'Signup failed. Please try again.');
    }
  };

  // Verify the 6-digit code sent to the user's email.
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

    setIsVerifying(true);
    setErrors({});

    try {
      const response = await axios.post(`${API_URL}/auth/verify-email`, {
        email: formData.email,
        otp,
      });

      if (response.data.ok) {
        showSuccess('Email verified successfully!');

        // Save login data after email verification succeeds.
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Send the user to the right dashboard.
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
      setIsVerifying(false);
    }
  };

  // Send the verification code again if the user did not receive it.
  const handleResendOTP = async () => {
    setIsResending(true);
    setErrors({});

    try {
      const response = await axios.post(`${API_URL}/auth/resend-verification`, {
        email: formData.email,
      });

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

  // Update one field and clear its error while typing.
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Show or hide the password text.
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show or hide the confirm password text.
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Show a loading screen while auth state is being checked.
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="md">
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
            borderRadius: 2,
          }}
        >
          {/* Page title and short description. */}
          <Box textAlign="center" mb={4}>
            <Typography component="h1" variant="h4" fontWeight={700} color="primary.main" gutterBottom>
              {currentStep === 'signup' ? 'Create Account' : 'Verify Your Email'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {currentStep === 'signup'
                ? 'Create an account and take the first step toward smarter healthcare.'
                : `We've sent a 6-digit code to ${formData.email}`
              }
            </Typography>
          </Box>

          {/* Show signup errors only on the signup step. */}
          {signup.error && currentStep === 'signup' && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {signup.error.message || 'Signup failed. Please try again.'}
            </Alert>
          )}

          {/* Account creation form. */}
          {currentStep === 'signup' && (
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Grid container spacing={2}>
                {/* Full name field. */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.full_name}
                    onChange={handleInputChange('full_name')}
                    error={!!errors.full_name}
                    helperText={errors.full_name}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    autoComplete="name"
                    autoFocus
                  />
                </Grid>

                {/* Email field with basic email validation. */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    autoComplete="email"
                  />
                </Grid>

                {/* Password field and strength helper. */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    error={!!errors.password}
                    helperText={errors.password}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    autoComplete="new-password"
                  />
                  {formData.password && (
                    // Password rules shown while the user types.
                    <Box mt={1}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Password Strength:
                        </Typography>
                        <Typography variant="caption" fontWeight={600} color={`${passwordStrength.color}.main`}>
                          {passwordStrength.label}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={passwordStrength.score}
                        color={passwordStrength.color as any}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      <List dense sx={{ mt: 1, p: 0 }}>
                        {passwordCriteria.map((criterion, index) => (
                          <ListItem key={index} sx={{ py: 0, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                              {criterion.met ? (
                                <CheckCircle fontSize="small" color="success" />
                              ) : (
                                <Cancel fontSize="small" color="disabled" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={criterion.label}
                              primaryTypographyProps={{
                                variant: 'caption',
                                color: criterion.met ? 'success.main' : 'text.secondary',
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Grid>

                {/* Confirm password field. */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={toggleConfirmPasswordVisibility}
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    autoComplete="new-password"
                  />
                </Grid>
              </Grid>

              {/* Submit button for account creation. */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={signup.isPending}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {signup.isPending ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    Creating Account...
                  </Box>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Link back to login for existing users. */}
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
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
          )}

          {/* Email verification step after signup. */}
          {currentStep === 'verify' && (
            <Box component="form" onSubmit={handleVerifyOTP} sx={{ width: '100%' }}>
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

              {/* Submit button for OTP verification. */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isVerifying || otp.length !== 6}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {isVerifying ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    Verifying...
                  </Box>
                ) : (
                  'Verify Email'
                )}
              </Button>

              {/* Go back or resend the verification code. */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button
                  onClick={() => {
                    setCurrentStep('signup');
                    setOtp('');
                    setErrors({});
                  }}
                  variant="text"
                >
                  Back
                </Button>
                <Button
                  onClick={handleResendOTP}
                  variant="text"
                  disabled={isResending}
                >
                  {isResending ? 'Sending...' : 'Resend Code'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Signup;
