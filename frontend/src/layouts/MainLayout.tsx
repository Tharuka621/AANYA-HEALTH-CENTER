import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import aanyaLogo from '../assets/aanya_logo.png';
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
      <AppBar position="sticky" elevation={1} sx={{ backgroundColor: 'background.paper', color: 'text.primary', width: '100%', zIndex: (theme) => theme.zIndex.appBar }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ minHeight: { xs: '56px !important', sm: '64px !important' } }}>
            <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box component="img" src={aanyaLogo} alt="Aanya logo" sx={{ height: { xs: 34, sm: 44 }, width: { xs: 34, sm: 44 }, borderRadius: 2 }} onError={(e: any) => { e.target.style.display = 'none'; }} />
                <Box>
                  <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                    AANYA
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.8rem' }}>
                    Health Center
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box display="flex" gap={{ xs: 0.5, sm: 1 }} alignItems="center" sx={{ ml: 'auto' }}>
              <Button component={RouterLink} to="/home" color="inherit" sx={{ textTransform: 'none', px: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Home</Button>
              <Button
                component={RouterLink}
                to="/about"
                color="inherit"
                sx={{ textTransform: 'none', px: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'inline-flex' } }}
              >
                About
              </Button>
              <Button
                component={RouterLink}
                to="/contact"
                color="inherit"
                sx={{ textTransform: 'none', px: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Contact
              </Button>
              <Button component={RouterLink} to="/login" variant="outlined" sx={{ textTransform: 'none', borderColor: '#0891b2', color: '#0891b2', px: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Login</Button>
              <Button component={RouterLink} to="/signup" variant="contained" sx={{ textTransform: 'none', background: 'linear-gradient(135deg,#0891b2 0%,#06b6d4 100%)', px: { xs: 1, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Sign Up</Button>
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
