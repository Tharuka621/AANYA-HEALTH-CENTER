import React, { useState, useEffect } from 'react';
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
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useLogin();
  const { showError, showSuccess } = useToast();
  const { user, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate(`/dashboard/${user.role}`);
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await login.mutateAsync(formData);
      showSuccess('Login successful! Redirecting...');
      
      // Redirect based on user role
      setTimeout(() => {
        const user = result.user;
        if (user) {
          navigate(`/dashboard/${user.role}`);
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (error: any) {
      showError(error.message || 'Login failed. Please try again.');
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show loading while checking authentication
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
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your Aanya Health Center account
            </Typography>
          </Box>

          {/* Error Alert */}
          {login.error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {login.error.message || 'Login failed. Please try again.'}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
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

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      onClick={togglePasswordVisibility}
                      edge="end"
                      size="small"
                      sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  </InputAdornment>
                ),
              }}
              autoComplete="current-password"
            />

            <Box display="flex" justifyContent="flex-end" mt={1}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                color="primary"
                underline="hover"
              >
                Forgot your password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={login.isPending}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {login.isPending ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} color="inherit" />
                  Signing In...
                </Box>
              ) : (
                'Sign In'
              )}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/signup"
                  variant="body2"
                  color="primary"
                  fontWeight={600}
                  underline="hover"
                >
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Demo Credentials */}
        <Paper
          elevation={1}
          sx={{
            p: 3,
            mt: 3,
            backgroundColor: 'background.default',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" gutterBottom color="primary.main">
            Demo Credentials
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Use these credentials to test different user roles:
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <Typography component="li" variant="body2" gutterBottom>
              <strong>Admin:</strong> admin@aanya.com / admin123
            </Typography>
            <Typography component="li" variant="body2" gutterBottom>
              <strong>Doctor:</strong> doctor@aanya.com / doctor123
            </Typography>
            <Typography component="li" variant="body2" gutterBottom>
              <strong>Patient:</strong> patient@aanya.com / patient123
            </Typography>
            <Typography component="li" variant="body2" gutterBottom>
              <strong>Receptionist:</strong> receptionist@aanya.com / reception123
            </Typography>
            <Typography component="li" variant="body2" gutterBottom>
              <strong>Pharmacist:</strong> pharmacist@aanya.com / pharma123
            </Typography>
            <Typography component="li" variant="body2" gutterBottom>
              <strong>Lab Tech:</strong> labtech@aanya.com / lab123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
