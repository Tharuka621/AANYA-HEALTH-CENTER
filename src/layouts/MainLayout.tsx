import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { MedicalServices as MedicalIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../components/Layout/Footer';

const MainLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Skip to content link for accessibility */}
      <Box
        component="a"
        href="#main"
        sx={{
          position: 'absolute',
          top: 2,
          left: 2,
          zIndex: 9999,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          px: 2,
          py: 1,
          borderRadius: 1,
          textDecoration: 'none',
          fontSize: '0.875rem',
          opacity: 0,
          pointerEvents: 'none',
          '&:focus': {
            opacity: 1,
            pointerEvents: 'auto',
          },
        }}
      >
        Skip to content
      </Box>

      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper', color: 'text.primary', width: '100%' }}>
        <Container maxWidth="lg">
          <Toolbar>
            <Box display="flex" alignItems="center" gap={2} sx={{ flexGrow: 1 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <MedicalIcon color="primary" />
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  AANYA
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Health Center
              </Typography>
            </Box>

            <Box display="flex" gap={2}>
              <Button
                component={RouterLink}
                to="/home"
                color="inherit"
                sx={{ textTransform: 'none' }}
              >
                Home
              </Button>
              <Button
                component={RouterLink}
                to="/about"
                color="inherit"
                sx={{ textTransform: 'none' }}
              >
                About
              </Button>
              <Button
                component={RouterLink}
                to="/contact"
                color="inherit"
                sx={{ textTransform: 'none' }}
              >
                Contact
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                sx={{ textTransform: 'none' }}
              >
                Sign Up
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box component="main" id="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default MainLayout;
