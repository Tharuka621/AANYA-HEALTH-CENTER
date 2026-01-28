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
  Divider,
  Avatar,
  IconButton,
  Collapse,
  Tooltip,
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
  MonitorHeart as VitalSignsIcon,
  Assessment as ReportsIcon,
  MedicalServices as MedicalIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useLogout } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  children?: MenuItem[];
}

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const handleLogout = () => {
    logout.mutate();
    navigate('/login');
  };

  const toggleItem = (path: string) => {
    setOpenItems(prev => 
      prev.includes(path) 
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
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
          { icon: LabIcon, label: 'Lab Tests', path: '/dashboard/doctor/lab-tests' }
        ];
      
      case 'nurse':
        return [
          ...baseItems,
          { icon: PersonAddIcon, label: 'Patients', path: '/dashboard/nurse/patients' },
          { icon: CalendarIcon, label: 'Appointments', path: '/dashboard/nurse/appointments' },
          { icon: VitalSignsIcon, label: 'Vital Signs', path: '/dashboard/nurse/vital-signs' }
        ];
      
      case 'receptionist':
        return [
          ...baseItems,
          { icon: PersonAddIcon, label: 'Patients', path: '/dashboard/receptionist/patients' },
          { icon: CalendarIcon, label: 'Appointments', path: '/dashboard/receptionist/appointments' },
          { icon: PaymentIcon, label: 'Billing', path: '/dashboard/receptionist/billing' }
        ];
      
      case 'pharmacist':
        return [
          ...baseItems,
          { icon: PharmacyIcon, label: 'Pharmacy', path: '/dashboard/pharmacist/pharmacy' },
          { icon: DescriptionIcon, label: 'Prescriptions', path: '/dashboard/pharmacist/prescriptions' },
          { icon: ReportsIcon, label: 'Inventory Reports', path: '/dashboard/pharmacist/reports' }
        ];
      
      case 'lab':
        return [
          ...baseItems,
          { icon: LabIcon, label: 'Lab Tests', path: '/dashboard/lab/lab-tests' },
          { icon: ReportsIcon, label: 'Lab Reports', path: '/dashboard/lab/reports' }
        ];
      
      case 'patient':
        return [
          ...baseItems,
          { icon: CalendarIcon, label: 'Appointments', path: '/dashboard/patient/appointments' },
          { icon: DescriptionIcon, label: 'Prescriptions', path: '/dashboard/patient/prescriptions' },
          { icon: LabIcon, label: 'Lab Reports', path: '/dashboard/patient/lab-reports' },
          { icon: PersonIcon, label: 'My Profile', path: '/dashboard/patient/profile' }
        ];
      
      default:
        return baseItems;
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isActive = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.includes(item.path);

    return (
      <ListItem key={item.path} disablePadding>
        <ListItemButton
          component={RouterLink}
          to={item.path}
          selected={isActive}
          sx={{
            pl: 2 + level * 2,
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
          <ListItemIcon>
            <item.icon />
          </ListItemIcon>
          <ListItemText primary={item.label} />
          {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>
    );
  };

  if (!user) return null;

  const menuItems = getMenuItems(user.role);
  const drawerWidth = 280;

  return (
    <Drawer
      variant="permanent"
      sx={{
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
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <MedicalIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              AANYA
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Health Center
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.light' }}>
            {user.role === 'doctor' 
              ? 'MA' 
              : user.full_name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {user.role === 'doctor' ? 'Dr. Milinda Abeykoon' : user.full_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" textTransform="capitalize">
              {user.role.replace('_', ' ')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>

      {/* Logout */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <ListItemButton
          onClick={handleLogout}
          disabled={logout.isPending}
          sx={{
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'error.contrastText',
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon color="inherit" />
          </ListItemIcon>
          <ListItemText primary={logout.isPending ? 'Logging out...' : 'Logout'} />
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

export default Sidebar;