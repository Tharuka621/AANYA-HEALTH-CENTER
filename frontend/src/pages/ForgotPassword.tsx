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
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useForgotPassword } from '../hooks/useAuth';
import { useToast } from '../components/common/Toast';

const ForgotPassword: React.FC = () => {
  const forgotPassword = useForgotPassword();
  const { showError, showSuccess } = useToast();
  
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await forgotPassword.mutateAsync(email);
      setIsSubmitted(true);
      showSuccess('Password reset instructions have been sent to your email.');
    } catch (error: any) {
      showError(error.message || 'Failed to send reset email. Please try again.');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  if (isSubmitted) {
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
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'success.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <EmailIcon sx={{ fontSize: 40, color: 'success.main' }} />
            </Box>

            <Typography component="h1" variant="h4" fontWeight={700} color="primary.main" gutterBottom>
              Check Your Email
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              We've sent password reset instructions to:
            </Typography>

            <Typography variant="body1" fontWeight={600} color="primary.main" gutterBottom>
              {email}
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Please check your email and follow the instructions to reset your password. 
              If you don't see the email, check your spam folder.
            </Typography>

            <Box display="flex" gap={2} mt={3}>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
              >
                Back to Login
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
              >
                Try Different Email
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

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
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography component="h1" variant="h4" fontWeight={700} color="primary.main" gutterBottom>
              Forgot Password?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your email address and we'll send you instructions to reset your password
            </Typography>
          </Box>

          {/* Error Alert */}
          {forgotPassword.error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {forgotPassword.error.message || 'Failed to send reset email. Please try again.'}
            </Alert>
          )}

          {/* Reset Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={handleEmailChange}
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
              disabled={forgotPassword.isPending}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {forgotPassword.isPending ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} color="inherit" />
                  Sending...
                </Box>
              ) : (
                'Send Reset Instructions'
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
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;

