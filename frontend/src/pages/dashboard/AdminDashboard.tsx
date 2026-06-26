import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  LocalPharmacy as PharmacyIcon,
  Science as LabIcon,
  TrendingUp as TrendingUpIcon,
  PersonAdd as PersonAddIcon,
  Description as PrescriptionIcon,
  ReceiptLong as BillingIcon,
  Assessment as ReportsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { axiosInstance } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  activePrescriptions: number;
  pendingLabTests: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Aggregated numbers displayed in summary/stat cards.
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    activePrescriptions: 0,
    pendingLabTests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Pulls the latest admin KPI snapshot from the backend.
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/dashboard-stats');
      setStats(response.data.stats || {
        totalUsers: 0,
        totalPatients: 0,
        totalDoctors: 0,
        todayAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        activePrescriptions: 0,
        pendingLabTests: 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Primary KPI cards shown at the top of the dashboard.
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: <PersonAddIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bgColor: '#e8f5e9',
    },
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#0288d1',
      bgColor: '#e1f5fe',
    },
    {
      title: 'Appointments Today',
      value: stats.todayAppointments,
      icon: <CalendarIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      bgColor: '#fff3e0',
    },
  ];

  const activityCards = [
    {
      title: 'Today Appointments',
      value: stats.todayAppointments,
      total: Math.max(stats.pendingAppointments + stats.completedAppointments, 1),
      icon: <CalendarIcon />,
      color: 'info',
      helperText: 'Scheduled for today',
    },
    {
      title: 'Pending Appointments',
      value: stats.pendingAppointments,
      total: Math.max(stats.pendingAppointments + stats.completedAppointments, 1),
      icon: <CalendarIcon />,
      color: 'warning',
      helperText: 'Waiting check-in/completion',
    },
    {
      title: 'Completed Appointments',
      value: stats.completedAppointments,
      total: Math.max(stats.pendingAppointments + stats.completedAppointments, 1),
      icon: <CalendarIcon />,
      color: 'success',
      helperText: 'Closed successfully',
    },
    {
      title: 'Active Prescriptions',
      value: stats.activePrescriptions,
      total: Math.max(stats.totalPatients, 1),
      icon: <PharmacyIcon />,
      color: 'primary',
      helperText: 'Relative to patient base',
    },
    {
      title: 'Pending Lab Tests',
      value: stats.pendingLabTests,
      total: Math.max(stats.totalPatients, 1),
      icon: <LabIcon />,
      color: 'info',
      helperText: 'Awaiting completion',
    },
  ];

  // Navigation shortcuts into each admin management module.
  const quickActionCards = [
    {
      title: 'Appointment Management',
      description: 'View and manage all appointments',
      icon: <CalendarIcon sx={{ fontSize: 28, color: 'white' }} />,
      avatarColor: 'success.main',
      hoverBorder: 'success.main',
      path: '/dashboard/admin/appointments',
    },
    {
      title: 'Lab Test Management',
      description: 'Monitor and manage lab tests',
      icon: <LabIcon sx={{ fontSize: 28, color: 'white' }} />,
      avatarColor: 'info.main',
      hoverBorder: 'info.main',
      path: '/dashboard/admin/lab-tests',
    },
    {
      title: 'Prescription Management',
      description: 'Manage doctor prescriptions and status',
      icon: <PrescriptionIcon sx={{ fontSize: 28, color: 'white' }} />,
      avatarColor: 'primary.main',
      hoverBorder: 'primary.main',
      path: '/dashboard/admin/prescriptions',
    },
    {
      title: 'Pharmacy Management',
      description: 'Manage medicines and pharmacy workflows',
      icon: <PharmacyIcon sx={{ fontSize: 28, color: 'white' }} />,
      avatarColor: 'warning.main',
      hoverBorder: 'warning.main',
      path: '/dashboard/admin/pharmacy',
    },
    {
      title: 'Billing Management',
      description: 'Track invoices, payments, and billing',
      icon: <BillingIcon sx={{ fontSize: 28, color: 'white' }} />,
      avatarColor: 'secondary.main',
      hoverBorder: 'secondary.main',
      path: '/dashboard/admin/billing',
    },
    {
      title: 'Reports Management',
      description: 'Generate and review operational reports',
      icon: <ReportsIcon sx={{ fontSize: 28, color: 'white' }} />,
      avatarColor: 'error.main',
      hoverBorder: 'error.main',
      path: '/dashboard/admin/reports',
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight={600} gutterBottom color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
          Welcome back, {user?.full_name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Here's what's happening with your health center today.
        </Typography>
      </Box>

      {/* Main Stats */}
      <Grid container spacing={3} mb={4}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                '&:hover': { 
                  borderColor: stat.color,
                  boxShadow: 2,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color={stat.color}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: stat.bgColor, 
                    width: 56, 
                    height: 56,
                  }}>
                    {React.cloneElement(stat.icon, { sx: { color: stat.color, fontSize: 28 } })}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Activity Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Today's Activity
          </Typography>
        </Grid>
        {activityCards.map((activity, index) => {
          const progressPercent = Math.min(
            100,
            Math.round((activity.value / Math.max(activity.total, 1)) * 100)
          );

          return (
          <Grid item xs={12} sm={6} md={4} lg={index === 0 ? 4 : 2} key={index}>
            <Card sx={{ 
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: 6,
              }
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ 
                    bgcolor: `${activity.color}.light`,
                    width: 48,
                    height: 48,
                  }}>
                    {React.cloneElement(activity.icon, { color: activity.color, sx: { fontSize: 24 } })}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      {activity.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {activity.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.helperText}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Progress
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color={`${activity.color}.main`}>
                      {progressPercent}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressPercent}
                    color={activity.color as 'warning' | 'success' | 'primary' | 'info'}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
        })}
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Quick Actions
          </Typography>
        </Grid>
        {quickActionCards.map((action) => (
          <Grid item xs={12} md={6} lg={4} key={action.title}>
            <Card
              onClick={() => navigate(action.path)}
              sx={{
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: action.hoverBorder,
                  boxShadow: 2,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: action.avatarColor, width: 56, height: 56 }}>
                    {action.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* System Status */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12}>
          <Card sx={{ 
            border: '1px solid',
            borderColor: 'success.main',
            bgcolor: 'success.lighter',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ 
                    bgcolor: 'success.main', 
                    width: 56, 
                    height: 56,
                  }}>
                    <TrendingUpIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      System Status
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All systems operational
                    </Typography>
                  </Box>
                </Box>
                <Chip 
                  label="Healthy" 
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
