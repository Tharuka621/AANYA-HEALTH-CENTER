import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { getAppointmentsWithDetails, mockSlots } from '../../mock/doctorMock';
import { appointmentStatusLabels, appointmentStatusColors, formatTime, formatDate } from '../../utils/doctorUtils';

const AppointmentList: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Get appointments with details using mock data
  const allAppointments = getAppointmentsWithDetails();
  
  // Filter appointments by selected date
  const appointmentsByDate = selectedDate 
    ? allAppointments.filter(app => app.slot_date === selectedDate)
    : allAppointments;

  // Further filter by slot if selected
  const filteredAppointments = selectedSlot
    ? appointmentsByDate.filter(app => app.slot_id === selectedSlot)
    : appointmentsByDate;

  // Get slots for selected date
  const slotsForDate = mockSlots.filter(slot => slot.slot_date === selectedDate);

  const handleViewAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setOpenDialog(true);
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    console.log('Complete appointment:', appointmentId);
    alert('Appointment marked as completed!');
  };

  const handleCancelAppointment = (appointmentId: string) => {
    console.log('Cancel appointment:', appointmentId);
    alert('Appointment cancelled!');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            My Appointments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your appointment schedule
          </Typography>
        </Box>

        {/* Date and Slot Filters */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CalendarIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Select Date
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(''); // Reset slot when date changes
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <ScheduleIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Select Time Slot
                  </Typography>
                </Box>
                <FormControl fullWidth>
                  <Select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">All Slots</MenuItem>
                    {slotsForDate.map((slot) => (
                      <MenuItem key={slot.id} value={slot.id}>
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)} 
                        {!slot.is_active && ' (Inactive)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Summary Cards */}
        <Box display="flex" gap={2} mb={4}>
          <Alert severity="info" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Total Appointments: {filteredAppointments.length}
            </Typography>
          </Alert>
          <Alert severity="warning" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Pending: {filteredAppointments.filter(a => a.status === 'PENDING').length}
            </Typography>
          </Alert>
          <Alert severity="success" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Confirmed: {filteredAppointments.filter(a => a.status === 'CONFIRMED').length}
            </Typography>
          </Alert>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time Slot</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {appointment.patient_name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {appointment.patient_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(appointment.slot_date)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.reason || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} alignItems="center">
                        <Chip
                          label={appointmentStatusLabels[appointment.status]}
                          color={appointmentStatusColors[appointment.status]}
                          size="small"
                        />
                        {appointment.has_visit && (
                          <Chip label="Checked In" size="small" color="success" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{appointment.patient_phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {appointment.status === 'PENDING' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleCompleteAppointment(appointment.id)}
                              title="Mark as Confirmed"
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCancelAppointment(appointment.id)}
                              title="Cancel"
                            >
                              <CancelIcon />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleViewAppointment(appointment)}
                          title="View Details"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box py={4}>
                      <Typography variant="body1" color="text.secondary">
                        No appointments found for the selected date and slot
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Appointment Details Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Appointment Details
          </DialogTitle>
          <DialogContent>
            {selectedAppointment && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Patient Name</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedAppointment.patient_name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedAppointment.patient_phone}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Date</Typography>
                    <Typography variant="body1" fontWeight={600}>{formatDate(selectedAppointment.slot_date)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Time Slot</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatTime(selectedAppointment.start_time)} - {formatTime(selectedAppointment.end_time)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip
                      label={appointmentStatusLabels[selectedAppointment.status as keyof typeof appointmentStatusLabels]}
                      color={appointmentStatusColors[selectedAppointment.status as keyof typeof appointmentStatusColors]}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Check-In Status</Typography>
                    <Chip
                      label={selectedAppointment.has_visit ? 'Checked In' : 'Not Checked In'}
                      color={selectedAppointment.has_visit ? 'success' : 'default'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Reason for Visit</Typography>
                    <Typography variant="body1">{selectedAppointment.reason || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AppointmentList;

