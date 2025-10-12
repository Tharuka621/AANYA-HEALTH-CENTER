import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';

const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden', // Prevent content overflow
      }}>
        <Header />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
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
