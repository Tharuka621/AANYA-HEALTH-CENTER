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
  IconButton,
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

  // Redirect if already logged in - TEMPORARILY DISABLED FOR DEBUGGING
  // useEffect(() => {
  //   if (!loading && user && user.role) {
  //     const normalizedRole = user.role.toLowerCase();
  //     const roleRouteMap: Record<string, string> = {
  //       'patient': 'patient',
  //       'doctor': 'doctor',
  //       'nurse': 'nurse',
  //       'receptionist': 'receptionist',
  //       'pharmacist': 'pharmacist',
  //       'lab': 'lab',
  //       'lab technician': 'lab',
  //       'admin': 'admin',
  //       'administrator': 'admin'
  //     };
  //     const dashboardRoute = roleRouteMap[normalizedRole] || normalizedRole;
  //     navigate(`/dashboard/${dashboardRoute}`, { replace: true });
  //   }
  // }, [user, loading, navigate]);

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
      console.log('Login result:', result);
      console.log('User:', result.user);
      console.log('User role:', result.user?.role);
      
      showSuccess('Login successful! Redirecting...');
      
      // Redirect based on user role (normalized to lowercase)
      setTimeout(() => {
        const user = result.user;
        if (user && user.role) {
          const normalizedRole = user.role.toLowerCase();
          console.log('Normalized role:', normalizedRole);
          
          // Map role names to dashboard routes
          const roleRouteMap: Record<string, string> = {
            'patient': 'patient',
            'doctor': 'doctor',
            'receptionist': 'receptionist',
            'pharmacist': 'pharmacist',
            'lab': 'lab',
            'lab_tech': 'lab',
            'lab technician': 'lab',
            'admin': 'admin',
            'administrator': 'admin'
          };
          
          const dashboardRoute = roleRouteMap[normalizedRole] || normalizedRole;
          console.log('Dashboard route:', dashboardRoute);
          console.log('Navigating to:', `/dashboard/${dashboardRoute}`);
          
          navigate(`/dashboard/${dashboardRoute}`, { replace: true });
        } else {
          console.error('No user or role in result');
          navigate('/home', { replace: true });
        }
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);
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
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography
              component="h1"
              variant="h4"
              fontWeight={700}
              color="primary.main"
              gutterBottom
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your Aanya Health Center account
            </Typography>
          </Box>

          {/* Error Alert */}
          {login.error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {login.error.message || "Login failed. Please try again."}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
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
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange("password")}
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
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      size="small"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
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
                "Sign In"
              )}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
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
      </Box>
    </Container>
  );
};

export default Login;
