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
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const AppointmentList: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_name: '',
    date: '',
    time: '',
    reason: '',
    status: 'scheduled',
    notes: '',
  });

  // Mock appointments data
  const appointments = [
    {
      id: '1',
      patient: 'John Doe',
      date: '2024-12-20',
      time: '10:00 AM',
      reason: 'Regular checkup',
      status: 'scheduled',
      phone: '+1234567890',
      notes: 'Patient requested morning appointment',
    },
    {
      id: '2',
      patient: 'Alice Smith',
      date: '2024-12-20',
      time: '11:30 AM',
      reason: 'Blood pressure follow-up',
      status: 'completed',
      phone: '+1234567891',
      notes: 'BP medication adjustment needed',
    },
    {
      id: '3',
      patient: 'Bob Johnson',
      date: '2024-12-21',
      time: '2:00 PM',
      reason: 'Diabetes consultation',
      status: 'cancelled',
      phone: '+1234567892',
      notes: 'Patient cancelled due to emergency',
    },
    {
      id: '4',
      patient: 'Emma Wilson',
      date: '2024-12-21',
      time: '3:30 PM',
      reason: 'Annual physical',
      status: 'scheduled',
      phone: '+1234567893',
      notes: 'Annual checkup',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no_show': return 'warning';
      default: return 'default';
    }
  };

  const handleViewAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setFormData({
      patient_name: appointment.patient,
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
      notes: appointment.notes,
    });
    setOpenDialog(true);
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    console.log('Complete appointment:', appointmentId);
    // In a real app, this would call the API
  };

  const handleCancelAppointment = (appointmentId: string) => {
    console.log('Cancel appointment:', appointmentId);
    // In a real app, this would call the API
  };

  const handleAddAppointment = () => {
    console.log('Add new appointment');
    // In a real app, this would navigate to add appointment form
  };

  const handleSaveAppointment = () => {
    console.log('Save appointment:', formData);
    setOpenDialog(false);
    // In a real app, this would call the API
  };

  const todayAppointments = appointments.filter(app => app.date === new Date().toISOString().split('T')[0]);
  const upcomingAppointments = appointments.filter(app => app.status === 'scheduled');

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            My Appointments
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAppointment}
          >
            Schedule Appointment
          </Button>
        </Box>

        {/* Summary Cards */}
        <Box display="flex" gap={2} mb={4}>
          <Alert severity="info" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Today's Appointments: {todayAppointments.length}
            </Typography>
          </Alert>
          <Alert severity="success" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Upcoming Appointments: {upcomingAppointments.length}
            </Typography>
          </Alert>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {appointment.patient.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {appointment.patient}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{appointment.date}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointment.time}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {appointment.reason}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{appointment.phone}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {appointment.status === 'scheduled' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleCompleteAppointment(appointment.id)}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </>
                      )}
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleViewAppointment(appointment)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => console.log('Edit appointment:', appointment.id)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Appointment Details Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Appointment Details
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Patient Name"
                value={formData.patient_name}
                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                margin="normal"
                disabled
              />
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="no_show">No Show</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveAppointment} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AppointmentList;

