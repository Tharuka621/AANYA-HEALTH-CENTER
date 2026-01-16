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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const AppointmentManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_name: '',
    doctor_name: 'Dr. Milinda Abeykoon',
    date: '',
    time: '',
    reason: '',
    status: 'scheduled',
  });

  // Mock appointments data
  const appointments = [
    {
      id: '1',
      patient: 'Kasun Bandara',
      doctor: 'Dr. Milinda Abeykoon',
      date: '2024-12-20',
      time: '10:00 AM',
      reason: 'පරීක්ෂාව (Checkup)',
      status: 'scheduled',
      phone: '+94 71 123 4567',
    },
    {
      id: '2',
      patient: 'Nimal Perera',
      doctor: 'Dr. Milinda Abeykoon',
      date: '2024-12-20',
      time: '11:30 AM',
      reason: 'රුධිර පීඩනය පරීක්ෂා',
      status: 'completed',
      phone: '+94 77 555 8899',
    },
    {
      id: '3',
      patient: 'Ishara Silva',
      doctor: 'Dr. Milinda Abeykoon',
      date: '2024-12-21',
      time: '2:00 PM',
      reason: 'මdhumeha උපදේශනය',
      status: 'cancelled',
      phone: '+94 76 234 5678',
    },
    {
      id: '4',
      patient: 'Amaya Fernando',
      doctor: 'Dr. Milinda Abeykoon',
      date: '2024-12-21',
      time: '3:30 PM',
      reason: 'වාර්ෂික ආරෝగ్య පරීක්ෂාව',
      status: 'scheduled',
      phone: '+94 72 987 6543',
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

  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setFormData({
      patient_name: '',
  doctor_name: 'Dr. Milinda Abeykoon',
      date: '',
      time: '',
      reason: '',
      status: 'scheduled',
    });
    setOpenDialog(true);
  };

  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    setFormData({
      patient_name: appointment.patient,
      doctor_name: appointment.doctor,
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
    });
    setOpenDialog(true);
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    console.log('Delete appointment:', appointmentId);
    // In a real app, this would call the API
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    console.log('Complete appointment:', appointmentId);
    // In a real app, this would call the API
  };

  const handleCancelAppointment = (appointmentId: string) => {
    console.log('Cancel appointment:', appointmentId);
    // In a real app, this would call the API
  };

  const handleSaveAppointment = () => {
    console.log('Save appointment:', formData);
    setOpenDialog(false);
    // In a real app, this would call the API
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            Appointment Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAppointment}
          >
            Schedule Appointment
          </Button>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Doctor</TableCell>
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
                  <TableCell>{appointment.doctor}</TableCell>
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
                        color="primary"
                        onClick={() => handleEditAppointment(appointment)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteAppointment(appointment.id)}
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

        {/* Add/Edit Appointment Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Patient Name"
                value={formData.patient_name}
                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Doctor</InputLabel>
                <Select
                  value={formData.doctor_name}
                  label="Doctor"
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                >
                  <MenuItem value="Dr. Milinda Abeykoon">Dr. Milinda Abeykoon</MenuItem>
                </Select>
              </FormControl>
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
                multiline
                rows={2}
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
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveAppointment} variant="contained">
              {editingAppointment ? 'Update' : 'Schedule'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AppointmentManagement;

