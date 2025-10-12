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
  Add as AddIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

const AppointmentList: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    reason: '',
    status: 'scheduled',
  });

  // Mock appointments data
  const appointments = [
    {
      id: '1',
      date: '2024-12-20',
      time: '10:00 AM',
      reason: 'Regular checkup',
      status: 'scheduled',
      doctor: 'Dr. Sarah Wilson',
      notes: 'Annual physical examination',
    },
    {
      id: '2',
      date: '2024-12-15',
      time: '11:30 AM',
      reason: 'Blood pressure follow-up',
      status: 'completed',
      doctor: 'Dr. Sarah Wilson',
      notes: 'BP medication adjustment',
    },
    {
      id: '3',
      date: '2024-12-25',
      time: '2:00 PM',
      reason: 'Diabetes consultation',
      status: 'scheduled',
      doctor: 'Dr. Sarah Wilson',
      notes: 'Diabetes management review',
    },
    {
      id: '4',
      date: '2024-12-10',
      time: '3:30 PM',
      reason: 'Follow-up visit',
      status: 'cancelled',
      doctor: 'Dr. Sarah Wilson',
      notes: 'Patient cancelled due to emergency',
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

  const handleBookAppointment = () => {
    setSelectedAppointment(null);
    setFormData({
      date: '',
      time: '',
      reason: '',
      status: 'scheduled',
    });
    setOpenDialog(true);
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setFormData({
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
    });
    setOpenDialog(true);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    console.log('Cancel appointment:', appointmentId);
    // In a real app, this would call the API
  };

  const handleViewAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setFormData({
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
    });
    setOpenDialog(true);
  };

  const handleSaveAppointment = () => {
    console.log('Save appointment:', formData);
    setOpenDialog(false);
    // In a real app, this would call the API
  };

  const upcomingAppointments = appointments.filter(app => app.status === 'scheduled');
  const completedAppointments = appointments.filter(app => app.status === 'completed');

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
            onClick={handleBookAppointment}
          >
            Book Appointment
          </Button>
        </Box>

        {/* Summary Cards */}
        <Box display="flex" gap={2} mb={4}>
          <Alert severity="info" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Upcoming Appointments: {upcomingAppointments.length}
            </Typography>
          </Alert>
          <Alert severity="success" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Completed Appointments: {completedAppointments.length}
            </Typography>
          </Alert>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {appointment.date}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointment.time}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{appointment.doctor}</TableCell>
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
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {appointment.notes}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {appointment.status === 'scheduled' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          <CancelIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleViewAppointment(appointment)}
                      >
                        <ViewIcon />
                      </IconButton>
                      {appointment.status === 'scheduled' && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
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
            {selectedAppointment ? 'Appointment Details' : 'Book New Appointment'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
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
                label="Reason for Visit"
                multiline
                rows={2}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                margin="normal"
              />
              {selectedAppointment && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled
                  >
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="no_show">No Show</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveAppointment} variant="contained">
              {selectedAppointment ? 'Close' : 'Book Appointment'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AppointmentList;

