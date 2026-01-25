import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  LocalPharmacy as PharmacyIcon,
  Science as LabIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import Grid from "@mui/material/Grid";


const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data
  const systemStats = {
    totalPatients: 1247,
    totalAppointments: 89,
    activePrescriptions: 156,
    labTestsCompleted: 45,
  };

  const recentUsers = [
    {
      id: '1',
      name: 'Dr. Milinda Abeykoon',
      email: 'doctor@aanya.com',
      role: 'doctor',
      status: 'active',
      lastLogin: '2024-12-19',
    },
    {
      id: '2',
      name: 'Emma Davis',
      email: 'emma@aanya.com',
      role: 'receptionist',
      status: 'active',
      lastLogin: '2024-12-19',
    },
    {
      id: '3',
      name: 'Kasun Jayawardena',
      email: 'kasun@aanya.com',
      role: 'pharmacist',
      status: 'inactive',
      lastLogin: '2024-12-15',
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'doctor':
        return 'primary';
      case 'nurse':
        return 'secondary';
      case 'receptionist':
        return 'info';
      case 'pharmacist':
        return 'warning';
      case 'lab':
        return 'success';
      case 'patient':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'error';
  };

  const handleEditUser = (userId: string) => {
    console.log('Edit user:', userId);
    // In a real app, this would open an edit dialog
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Delete user:', userId);
    // In a real app, this would show a confirmation dialog
  };

  const handleAddUser = () => {
    console.log('Add new user');
    // In a real app, this would open an add user dialog
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Welcome Section */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome, {user?.full_name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            System overview and user management dashboard.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      {systemStats.totalPatients}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Patients
                    </Typography>
                  </Box>
                  <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {systemStats.totalAppointments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Today's Appointments
                    </Typography>
                  </Box>
                  <CalendarIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {systemStats.activePrescriptions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Prescriptions
                    </Typography>
                  </Box>
                  <PharmacyIcon color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {systemStats.labTestsCompleted}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lab Tests Today
                    </Typography>
                  </Box>
                  <LabIcon color="info" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* User Management */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" fontWeight={600}>
                    User Management
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={handleAddUser}
                  >
                    Add User
                  </Button>
                </Box>

                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Last Login</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>
                                {user.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.role}
                              color={getRoleColor(user.role)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.status}
                              color={getStatusColor(user.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditUser(user.id)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid  item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Actions
                </Typography>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                  <Button
                    variant="contained"
                    startIcon={<PeopleIcon />}
                    fullWidth
                    onClick={() => console.log('View all users - Feature coming soon')}
                  >
                    View All Users
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ReportsIcon />}
                    fullWidth
                    onClick={() => console.log('Generate reports - Feature coming soon')}
                  >
                    Generate Reports
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    fullWidth
                    onClick={() => console.log('System settings - Feature coming soon')}
                  >
                    System Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* System Information */}
          <Grid  item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  System Information
                </Typography>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      System Version:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      v1.0.0
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Database Status:
                    </Typography>
                    <Chip label="Online" color="success" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Last Backup:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      Today 2:00 AM
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Storage Used:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      2.4 GB / 10 GB
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
