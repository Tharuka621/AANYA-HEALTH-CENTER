import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Description as PrescriptionIcon,
  Science as LabIcon,
  AccessTime as TimeIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data
  const todayPatients = [
    {
      id: '1',
      name: 'John Doe',
      time: '10:00 AM',
      reason: 'Regular checkup',
      status: 'scheduled',
    },
    {
      id: '2',
      name: 'Alice Smith',
      time: '11:30 AM',
      reason: 'Blood pressure follow-up',
      status: 'checked_in',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      time: '2:00 PM',
      reason: 'Diabetes consultation',
      status: 'scheduled',
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

  const handleViewPatient = (patientId: string) => {
    console.log('View patient:', patientId);
    // In a real app, this would navigate to patient details
  };

  const handleCreatePrescription = (patientId: string) => {
    console.log('Create prescription for patient:', patientId);
    // In a real app, this would open prescription form
  };

  const handleRequestLabTest = (patientId: string) => {
    console.log('Request lab test for patient:', patientId);
    // In a real app, this would open lab test request form
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
            Your patients are waiting. Here's today's schedule and quick actions.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Today's Patients */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Today's Patients
                  </Typography>
                  <CalendarIcon color="primary" />
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  {todayPatients.map((patient, index) => (
                    <React.Fragment key={patient.id}>
                      <ListItem>
                        <ListItemIcon>
                          <TimeIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {patient.name}
                              </Typography>
                              <Chip
                                label={patient.status.replace('_', ' ')}
                                size="small"
                                color={getStatusColor(patient.status)}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {patient.time} - {patient.reason}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewPatient(patient.id)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleCreatePrescription(patient.id)}
                          >
                            Prescribe
                          </Button>
                        </Box>
                      </ListItem>
                      {index < todayPatients.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<PersonIcon />}
                    fullWidth
                    onClick={() => console.log('View all patients - Feature coming soon')}
                  >
                    View All Patients
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PrescriptionIcon />}
                    fullWidth
                    onClick={() => console.log('Create prescription - Feature coming soon')}
                  >
                    Create Prescription
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LabIcon />}
                    fullWidth
                    onClick={() => console.log('Request lab test - Feature coming soon')}
                  >
                    Request Lab Test
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<HospitalIcon />}
                    fullWidth
                    onClick={() => console.log('View medical history - Feature coming soon')}
                  >
                    Medical History
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Today's Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Patients Seen:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      8
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Prescriptions:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      12
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Lab Requests:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      5
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

export default DoctorDashboard;
