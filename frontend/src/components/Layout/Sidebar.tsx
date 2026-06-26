import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  LocalPharmacy as PharmacyIcon,
  Science as LabIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  PersonAdd as PersonAddIcon,
  Assessment as ReportsIcon,
  MedicalServices as MedicalIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useLogout } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

const drawerWidth = 280;

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileToggle }) => {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    logout.mutate();
    navigate('/login');
  };

  const getMenuItems = (role: UserRole): MenuItem[] => {
    const baseItems: MenuItem[] = [
      { icon: DashboardIcon, label: 'Dashboard', path: `/dashboard/${role}` }
    ];

    switch (role) {
      case 'admin':
        return [
          ...baseItems,
          { icon: PeopleIcon, label: 'User Management', path: '/dashboard/admin/users' },
          { icon: CalendarIcon, label: 'Appointments', path: '/dashboard/admin/appointments' },
          { icon: LabIcon, label: 'Lab Tests', path: '/dashboard/admin/lab-tests' },
          { icon: DescriptionIcon, label: 'Prescriptions', path: '/dashboard/admin/prescriptions' },
          { icon: PharmacyIcon, label: 'Pharmacy', path: '/dashboard/admin/pharmacy' },
          { icon: PaymentIcon, label: 'Billing', path: '/dashboard/admin/billing' },
          { icon: ReportsIcon, label: 'Reports', path: '/dashboard/admin/reports' },
          { icon: SettingsIcon, label: 'Settings', path: '/dashboard/admin/settings' }
        ];

      case 'doctor':
        return [
          ...baseItems,
          { icon: PersonAddIcon, label: 'Patients', path: '/dashboard/doctor/patients' },
          { icon: CalendarIcon, label: 'Appointments', path: '/dashboard/doctor/appointments' },
          { icon: LabIcon, label: 'Lab Tests', path: '/dashboard/doctor/lab-tests' },
          { icon: SettingsIcon, label: 'Settings', path: '/dashboard/doctor/settings' }
        ];

      case 'receptionist':
        return [
          ...baseItems,
          { icon: PersonAddIcon, label: 'Patients', path: '/dashboard/receptionist/patients' },
          { icon: CalendarIcon, label: 'Appointments', path: '/dashboard/receptionist/appointments' },
          { icon: PaymentIcon, label: 'Billing', path: '/dashboard/receptionist/billing' },
          { icon: SettingsIcon, label: 'Settings', path: '/dashboard/receptionist/settings' }
        ];

      case 'pharmacist':
        return [
          ...baseItems,
          { icon: PharmacyIcon, label: 'Pharmacy', path: '/dashboard/pharmacist/pharmacy' },
          { icon: DescriptionIcon, label: 'Prescriptions', path: '/dashboard/pharmacist/prescriptions' },
          { icon: ReportsIcon, label: 'Inventory Reports', path: '/dashboard/pharmacist/reports' },
          { icon: SettingsIcon, label: 'Settings', path: '/dashboard/pharmacist/settings' }
        ];

      case 'lab':
        return [
          ...baseItems,
          { icon: LabIcon, label: 'Lab Tests', path: '/dashboard/lab/lab-tests' },
          { icon: ReportsIcon, label: 'Lab Reports', path: '/dashboard/lab/reports' },
          { icon: SettingsIcon, label: 'Settings', path: '/dashboard/lab/settings' }
        ];

      case 'patient':
        return [
          ...baseItems,
          { icon: CalendarIcon, label: 'Appointments', path: '/dashboard/patient/appointments' },
          { icon: DescriptionIcon, label: 'Prescriptions', path: '/dashboard/patient/prescriptions' },
          { icon: LabIcon, label: 'Lab Reports', path: '/dashboard/patient/lab-reports' },
          { icon: PersonIcon, label: 'My Profile', path: '/dashboard/patient/profile' },
          { icon: SettingsIcon, label: 'Settings', path: '/dashboard/patient/settings' }
        ];

      default:
        return baseItems;
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.path;

    return (
      <ListItem key={item.path} disablePadding>
        <ListItemButton
          component={RouterLink}
          to={item.path}
          selected={isActive}
          onClick={() => { if (isMobile) onMobileToggle(); }}
          sx={{
            pl: 2,
            py: 1.2,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '& .MuiListItemIcon-root': {
                color: 'primary.contrastText',
              },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <item.icon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem' }} />
        </ListItemButton>
      </ListItem>
    );
  };

  if (!user) return null;

  const menuItems = getMenuItems(user.role);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <MedicalIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ fontSize: '1rem' }}>
              AANYA
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Health Center
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 1.5, px: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: 'primary.light', fontWeight: 700, width: 34, height: 34, fontSize: '0.85rem' }}>
            {user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user.role === 'doctor' ? `Dr. ${user.full_name}` : user.full_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" textTransform="capitalize" noWrap>
              {user.role.replace('_', ' ')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List disablePadding>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>

      {/* Logout */}
      <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <ListItemButton
          onClick={handleLogout}
          disabled={logout.isPending}
          sx={{
            borderRadius: 1,
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'error.contrastText',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon fontSize="small" color="inherit" />
          </ListItemIcon>
          <ListItemText primary={logout.isPending ? 'Logging out...' : 'Logout'} primaryTypographyProps={{ fontSize: '0.9rem' }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile: Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop: Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;