import React, { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import AppointmentBooking from '../../components/Patient/AppointmentBooking';
import { useAppointmentsByPatient } from '../../hooks/useAppointments';
import { axiosInstance } from '../../services/api';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const bookingSectionId = 'patient-appointment-booking';

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labReports, setLabReports] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Appointments are sourced via React Query hook; prescriptions/labs are loaded separately below.
  const { data: appointmentsData, isLoading: loadingAppointments, refetch: refetchAppointments } = useAppointmentsByPatient(user?.id || '');
  const appointments = appointmentsData?.data || [];

  // Filter upcoming appointments (scheduled status and future dates)
  const upcomingAppointments = appointments.filter((apt: any) => {
    const aptDate = new Date(apt.slot_date || apt.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return apt.status === 'scheduled' && aptDate >= today;
  });

  // Loads additional dashboard sections (prescriptions + lab reports).
  const fetchPatientData = async () => {
    setLoadingData(true);
    try {
      const [prescRes, labRes] = await Promise.all([
        axiosInstance.get('/prescriptions/patient/prescriptions').catch(() => ({ data: { prescriptions: [] } })),
        axiosInstance.get('/lab/patient/lab-orders').catch(() => ({ data: { data: [] } }))
      ]);
      setPrescriptions(prescRes.data?.prescriptions || []);
      setLabReports(labRes.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch patient data', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Refetch appointments when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      refetchAppointments();
      fetchPatientData();
    }
  }, [user?.id, refetchAppointments]);

  const handleBookAppointment = () => {
    const bookingSection = document.getElementById(bookingSectionId);
    bookingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDownloadReport = async (resultUrl: string) => {
    if (!resultUrl) return;
    
    // Construct the full URL once
    const host = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
    const baseUrl = host.replace(/\/api$/, "");
    const fullUrl = (resultUrl.startsWith("http") || resultUrl.startsWith("blob:")) 
      ? resultUrl 
      : `${baseUrl}${resultUrl}`;

    try {
      
      if (fullUrl.startsWith("blob:")) {
        window.open(fullUrl, "_blank", "noopener,noreferrer");
        return;
      }

      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      const fileName = resultUrl.split("/").pop() || "lab-report.pdf";
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed, falling back to window.open", error);
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'default';
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
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'TBD';
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return 'Invalid Time';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Welcome Section */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome back, {user?.full_name || 'Patient'}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's an overview of your health information and upcoming appointments.
          </Typography>
        </Box>

        {/* Book Appointment Section */}
        <Box mb={3} id={bookingSectionId}>
          <AppointmentBooking />
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

                {loadingAppointments ? (
                  <Box display="flex" justifyContent="center" py={3}>
                    <CircularProgress />
                  </Box>
                ) : upcomingAppointments.length > 0 ? (
                  <List>
                    {upcomingAppointments.map((appointment: any, index: number) => (
                      <React.Fragment key={appointment.id}>
                        <ListItem>
                          <ListItemIcon>
                            <TimeIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {appointment.doctor_name || 'System Admin'}
                                </Typography>
                                <Chip
                                  label={appointment.status}
                                  size="small"
                                  color={getStatusColor(appointment.status)}
                                />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" color="text.secondary" component="span" display="block">
                                  {formatDate(appointment.slot_date || appointment.appointment_date)} at {formatTime(appointment.start_time || appointment.appointment_time)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" component="span" display="block">
                                  Appointment #{appointment.appointmentNumber || appointment.appointment_no} - {appointment.reason || 'General consultation'}
                                </Typography>
                                {appointment.estimated_arrival_time && (
                                  <Box display="inline-flex" alignItems="center" gap={0.5} mt={0.5}>
                                    <TimeIcon sx={{ fontSize: 14, color: 'success.main' }} />
                                    <Typography variant="caption" color="success.main" fontWeight={700} component="span">
                                      Arrive by: {appointment.estimated_arrival_time}
                                    </Typography>
                                    {appointment.queue_position && (
                                      <Chip
                                        label={`Queue #${appointment.queue_position}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ ml: 0.5, height: 18, fontSize: '0.65rem' }}
                                      />
                                    )}
                                  </Box>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                        {index < upcomingAppointments.length - 1 && <Divider />}
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
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Recent Prescriptions
                  </Typography>
                  <PrescriptionIcon color="primary" />
                </Box>
                <Divider sx={{ mb: 2 }} />

                {loadingData ? (
                  <Box display="flex" justifyContent="center" py={3}>
                    <CircularProgress />
                  </Box>
                ) : prescriptions.length > 0 ? (
                  <List>
                    {prescriptions.slice(0, 4).map((prescription, index) => (
                      <React.Fragment key={prescription.id}>
                        <ListItem>
                          <ListItemIcon>
                            <PrescriptionIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {prescription.doctor_name}
                                </Typography>
                                <Chip
                                  label={`APT-${String(prescription.visit_id || 0).padStart(4, "0")}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" color="text.secondary" component="span" display="block">
                                  Issued: {formatDate(prescription.created_at)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" component="span" display="block">
                                  {prescription.instructions?.substring(0, 30)}
                                  {prescription.instructions?.length > 30 ? "..." : ""}
                                </Typography>
                              </>
                            }
                          />
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate("/dashboard/patient/prescriptions")}
                          >
                            <ViewIcon />
                          </IconButton>
                        </ListItem>
                        {index < Math.min(prescriptions.length, 4) - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">No recent prescriptions found.</Alert>
                )}
                {prescriptions.length > 4 && (
                  <Box mt={2} display="flex" justifyContent="center">
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => navigate("/dashboard/patient/prescriptions")}
                    >
                      View All Prescriptions
                    </Button>
                  </Box>
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

                {loadingData ? (
                  <Box display="flex" justifyContent="center" py={3}>
                    <CircularProgress />
                  </Box>
                ) : labReports.length > 0 ? (
                  <List>
                    {labReports.slice(0, 4).map((report, index) => (
                      <React.Fragment key={report.id}>
                        <ListItem>
                          <ListItemIcon>
                            <LabIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {report.test_names || report.test_name || "General Lab Test"}
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
                                Ordered: {formatDate(report.requested_date)}
                              </Typography>
                            }
                          />
                          <Box display="flex" gap={1}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate("/dashboard/patient/lab-reports")}
                            >
                              <ViewIcon />
                            </IconButton>
                            {report.result_url && (
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleDownloadReport(report.result_url)}
                              >
                                <DownloadIcon />
                              </IconButton>
                            )}
                          </Box>
                        </ListItem>
                        {index < Math.min(labReports.length, 4) - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">No lab reports available.</Alert>
                )}
                {labReports.length > 4 && (
                  <Box mt={2} display="flex" justifyContent="center">
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => navigate("/dashboard/patient/lab-reports")}
                    >
                      View All Lab Reports
                    </Button>
                  </Box>
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
            onClick={() => navigate('/dashboard/patient/profile')}
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

      </Box>
    </Container>
  );
};

export default PatientDashboard;
