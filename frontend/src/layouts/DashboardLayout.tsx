import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Hide sidebar for receptionist role
  const showSidebar = user?.role !== 'receptionist';

  const handleMobileToggle = () => {
    setMobileOpen(prev => !prev);
  };

  // Determine main content padding based on screen size
  const mainPadding = isMobile ? 1.5 : (showSidebar ? 3 : 0);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default', overflow: 'hidden' }}>
      {showSidebar && (
        <Sidebar mobileOpen={mobileOpen} onMobileToggle={handleMobileToggle} />
      )}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}>
        {/* Header is shown for ALL roles */}
        <Header onMenuToggle={showSidebar ? handleMobileToggle : undefined} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: mainPadding,
            backgroundColor: 'background.default',
            overflow: 'auto',
            width: '100%',
          }}
          role="main"
          aria-label="Dashboard main content"
        >
          {children ?? <Outlet />}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
