import React, { useState } from 'react';
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
  IconButton,
  Fab,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Description as PrescriptionIcon,
  Science as LabIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
// import { useAppointmentsByPatient, usePrescriptionsByPatient, useLabTestsByPatient } from '../../hooks';
import Modal from '../../components/common/Modal';
import AppointmentModal from '../../components/common/AppointmentModal';
import { User } from '../../types';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);

  // Mock data - in a real app, these would come from the API
  const mockAppointments = [
    {
      id: '1',
      appointment_date: '2024-12-22',
      appointment_time: '10:00',
      doctor: { full_name: 'Dr. Sarah Wilson', specialization: 'General Medicine' },
      status: 'scheduled',
      reason: 'Regular checkup',
    },
    {
      id: '2',
      appointment_date: '2024-12-25',
      appointment_time: '14:30',
      doctor: { full_name: 'Dr. Sarah Wilson', specialization: 'General Medicine' },
      status: 'scheduled',
      reason: 'Follow-up consultation',
    },
  ];

  const mockPrescriptions = [
    {
      id: '1',
      issued_date: '2024-12-15',
      doctor: { full_name: 'Dr. Sarah Wilson' },
      medicines: [
        { medicine_name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
        { medicine_name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
      ],
      status: 'active',
    },
    {
      id: '2',
      issued_date: '2024-12-10',
      doctor: { full_name: 'Dr. Sarah Wilson' },
      medicines: [
        { medicine_name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' },
      ],
      status: 'dispensed',
    },
  ];

  const mockLabReports = [
    {
      id: '1',
      test_name: 'Complete Blood Count',
      completed_date: '2024-12-16',
      status: 'completed',
      report_url: '/reports/cbc-report-001.pdf',
    },
    {
      id: '2',
      test_name: 'Lipid Profile',
      completed_date: '2024-12-14',
      status: 'completed',
      report_url: '/reports/lipid-report-001.pdf',
    },
  ];

  const handleBookAppointment = () => {
    // Mock doctor for booking
    const mockDoctor: User = {
      id: '1',
      email: 'dr.sarah@aanya.com',
      full_name: 'Dr. Sarah Wilson',
      role: 'doctor',
      phone: '+1234567891',
      created_at: '2024-01-01T00:00:00Z'
    };
    setSelectedDoctor(mockDoctor);
    setAppointmentModalOpen(true);
  };

  const handleAppointmentConfirm = (appointmentData: any) => {
    console.log('Appointment booked:', appointmentData);
    setAppointmentModalOpen(false);
    setSelectedDoctor(null);
    // In a real app, you would call the API to create the appointment
  };

  const handleAppointmentCancel = () => {
    setAppointmentModalOpen(false);
    setSelectedDoctor(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'active':
        return 'warning';
      case 'dispensed':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Welcome Section */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome back, {user?.full_name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's an overview of your health information and upcoming appointments.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Upcoming Appointments */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Upcoming Appointments
                  </Typography>
                  <CalendarIcon color="primary" />
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {mockAppointments.length > 0 ? (
                  <List>
                    {mockAppointments.map((appointment, index) => (
                      <React.Fragment key={appointment.id}>
                        <ListItem>
                          <ListItemIcon>
                            <TimeIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {appointment.doctor.full_name}
                                </Typography>
                                <Chip
                                  label={appointment.status}
                                  size="small"
                                  color={getStatusColor(appointment.status)}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {appointment.doctor.specialization} - {appointment.reason}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < mockAppointments.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No upcoming appointments scheduled.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Prescriptions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Recent Prescriptions
                  </Typography>
                  <PrescriptionIcon color="primary" />
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {mockPrescriptions.length > 0 ? (
                  <List>
                    {mockPrescriptions.map((prescription, index) => (
                      <React.Fragment key={prescription.id}>
                        <ListItem>
                          <ListItemIcon>
                            <PrescriptionIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {prescription.doctor.full_name}
                                </Typography>
                                <Chip
                                  label={prescription.status}
                                  size="small"
                                  color={getStatusColor(prescription.status)}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Issued: {formatDate(prescription.issued_date)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {prescription.medicines.length} medicine(s) prescribed
                                </Typography>
                              </Box>
                            }
                          />
                          <IconButton size="small" color="primary">
                            <DownloadIcon />
                          </IconButton>
                        </ListItem>
                        {index < mockPrescriptions.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No recent prescriptions found.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Lab Reports */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Lab Reports
                  </Typography>
                  <LabIcon color="primary" />
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {mockLabReports.length > 0 ? (
                  <List>
                    {mockLabReports.map((report, index) => (
                      <React.Fragment key={report.id}>
                        <ListItem>
                          <ListItemIcon>
                            <LabIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {report.test_name}
                                </Typography>
                                <Chip
                                  label={report.status}
                                  size="small"
                                  color={getStatusColor(report.status)}
                                />
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                Completed: {formatDate(report.completed_date)}
                              </Typography>
                            }
                          />
                          <Box display="flex" gap={1}>
                            <IconButton size="small" color="primary">
                              <ViewIcon />
                            </IconButton>
                            <IconButton size="small" color="primary">
                              <DownloadIcon />
                            </IconButton>
                          </Box>
                        </ListItem>
                        {index < mockLabReports.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No lab reports available.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box mt={4} display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<CalendarIcon />}
            onClick={handleBookAppointment}
          >
            Book New Appointment
          </Button>
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={() => console.log('View Profile - Feature coming soon')}
          >
            View Profile
          </Button>
          <Button
            variant="outlined"
            startIcon={<HospitalIcon />}
            onClick={() => console.log('Medical History - Feature coming soon')}
          >
            Medical History
          </Button>
        </Box>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="book appointment"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={handleBookAppointment}
        >
          <AddIcon />
        </Fab>

        {/* Appointment Modal */}
        <Modal
          open={appointmentModalOpen}
          onClose={handleAppointmentCancel}
          maxWidth="md"
          title="Book Appointment"
        >
          {selectedDoctor && (
            <AppointmentModal
              doctor={selectedDoctor}
              onConfirm={handleAppointmentConfirm}
              onCancel={handleAppointmentCancel}
            />
          )}
        </Modal>
      </Box>
    </Container>
  );
};

export default PatientDashboard;
