import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ReceptionistDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data
  const todayAppointments = [
    {
      id: '1',
      patient: 'John Doe',
      time: '10:00 AM',
      doctor: 'Dr. Sarah Wilson',
      status: 'scheduled',
      phone: '+1234567890',
    },
    {
      id: '2',
      patient: 'Alice Smith',
      time: '11:30 AM',
      doctor: 'Dr. Sarah Wilson',
      status: 'checked_in',
      phone: '+1234567891',
    },
    {
      id: '3',
      patient: 'Bob Johnson',
      time: '2:00 PM',
      doctor: 'Dr. Sarah Wilson',
      status: 'scheduled',
      phone: '+1234567892',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_in':
        return 'success';
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleCheckIn = (appointmentId: string) => {
    console.log('Check in appointment:', appointmentId);
    // In a real app, this would call the API
  };

  const handleRegisterPatient = () => {
    console.log('Register new patient');
    // In a real app, this would open a registration form
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
            Manage today's appointments and patient registrations.
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
                      12
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Today
                    </Typography>
                  </Box>
                  <CalendarIcon color="primary" sx={{ fontSize: 40 }} />
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
                      8
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Checked In
                    </Typography>
                  </Box>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
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
                      4
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Waiting
                    </Typography>
                  </Box>
                  <ScheduleIcon color="warning" sx={{ fontSize: 40 }} />
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
                      3
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      New Patients
                    </Typography>
                  </Box>
                  <PersonAddIcon color="info" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Today's Appointments */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" fontWeight={600}>
                    Today's Appointments
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={handleRegisterPatient}
                  >
                    Register Patient
                  </Button>
                </Box>

                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Patient</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Doctor</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {todayAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PersonIcon color="action" />
                              {appointment.patient}
                            </Box>
                          </TableCell>
                          <TableCell>{appointment.time}</TableCell>
                          <TableCell>{appointment.doctor}</TableCell>
                          <TableCell>
                            <Chip
                              label={appointment.status.replace('_', ' ')}
                              color={getStatusColor(appointment.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{appointment.phone}</TableCell>
                          <TableCell>
                            {appointment.status === 'scheduled' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => handleCheckIn(appointment.id)}
                              >
                                Check In
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ReceptionistDashboard;
