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
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { axiosInstance } from '../../services/api';

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

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const usersResponse = await axiosInstance.get('/admin/users');
      const users = usersResponse.data.users || [];
      
      setStats({
        totalUsers: users.length,
        totalPatients: users.filter((u: any) => u.role === 'PATIENT').length,
        totalDoctors: users.filter((u: any) => u.role === 'DOCTOR').length,
        todayAppointments: 0, // Can fetch from appointments endpoint
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
      title: 'Pending Appointments',
      value: stats.pendingAppointments,
      total: stats.pendingAppointments + stats.completedAppointments,
      icon: <CalendarIcon />,
      color: 'warning',
    },
    {
      title: 'Completed Appointments',
      value: stats.completedAppointments,
      total: stats.pendingAppointments + stats.completedAppointments,
      icon: <CalendarIcon />,
      color: 'success',
    },
    {
      title: 'Active Prescriptions',
      value: stats.activePrescriptions,
      icon: <PharmacyIcon />,
      color: 'primary',
    },
    {
      title: 'Pending Lab Tests',
      value: stats.pendingLabTests,
      icon: <LabIcon />,
      color: 'info',
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
      <Box mb={4}>
        <Typography variant="h4" fontWeight={600} gutterBottom color="text.primary">
          Welcome back, {user?.full_name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
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
        {activityCards.map((activity, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
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
                  </Box>
                </Box>
                {activity.total && (
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Progress
                      </Typography>
                      <Typography variant="caption" fontWeight={700} color={`${activity.color}.main`}>
                        {Math.round((activity.value / activity.total) * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={activity.total > 0 ? (activity.value / activity.total) * 100 : 0}
                      color={activity.color as 'warning' | 'success' | 'primary' | 'info'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Quick Actions
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { 
              borderColor: 'primary.main',
              boxShadow: 1,
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  width: 56, 
                  height: 56,
                }}>
                  <PeopleIcon sx={{ fontSize: 28, color: 'white' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    User Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage system users, roles, and permissions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { 
              borderColor: 'success.main',
              boxShadow: 1,
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ 
                  bgcolor: 'success.main', 
                  width: 56, 
                  height: 56,
                }}>
                  <CalendarIcon sx={{ fontSize: 28, color: 'white' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Appointment Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View and manage all appointments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { 
              borderColor: 'warning.main',
              boxShadow: 1,
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ 
                  bgcolor: 'warning.main', 
                  width: 56, 
                  height: 56,
                }}>
                  <PharmacyIcon sx={{ fontSize: 28, color: 'white' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Pharmacy Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage medicines and prescriptions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { 
              borderColor: 'info.main',
              boxShadow: 1,
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ 
                  bgcolor: 'info.main', 
                  width: 56, 
                  height: 56,
                }}>
                  <LabIcon sx={{ fontSize: 28, color: 'white' }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Lab Test Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitor and manage lab tests
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
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
