import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Hide sidebar for receptionist role
  const showSidebar = user?.role !== 'receptionist';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {showSidebar && <Sidebar />}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden', // Prevent content overflow
      }}>
        {showSidebar && <Header />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: showSidebar ? 3 : 0,
            backgroundColor: 'background.default',
            overflow: 'auto', // Allow scrolling for content
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
