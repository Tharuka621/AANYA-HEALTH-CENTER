import React, { useState } from 'react';
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'checked_in' | 'completed' | 'cancelled';
  reason: string;
  vitals?: {
    temperature: string;
    blood_pressure: string;
    pulse: string;
    weight: string;
  };
}

const AppointmentList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Mock data - replace with API call
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      patient_name: 'Kasun Bandara',
      patient_phone: '+94 71 123 4567',
      doctor_name: 'Dr. Milinda Abeykoon',
      appointment_date: '2026-01-23',
      appointment_time: '10:00 AM',
      status: 'scheduled',
      reason: 'Regular checkup',
    },
    {
      id: '2',
      patient_name: 'Nimal Perera',
      patient_phone: '+94 77 555 8899',
      doctor_name: 'Dr. Milinda Abeykoon',
      appointment_date: '2026-01-23',
      appointment_time: '11:30 AM',
      status: 'checked_in',
      reason: 'Follow-up consultation',
      vitals: {
        temperature: '36.8',
        blood_pressure: '120/80',
        pulse: '72',
        weight: '68',
      },
    },
    {
      id: '3',
      patient_name: 'Ishara Silva',
      patient_phone: '+94 76 234 5678',
      doctor_name: 'Dr. Milinda Abeykoon',
      appointment_date: '2026-01-23',
      appointment_time: '2:00 PM',
      status: 'scheduled',
      reason: 'Blood test results review',
    },
    {
      id: '4',
      patient_name: 'Amaya Fernando',
      patient_phone: '+94 72 987 6543',
      doctor_name: 'Dr. Milinda Abeykoon',
      appointment_date: '2026-01-23',
      appointment_time: '3:15 PM',
      status: 'completed',
      reason: 'Vaccination',
    },
  ]);

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    patient_name: '',
    patient_phone: '',
    doctor_name: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
  });

  // Vitals form state
  const [vitalsForm, setVitalsForm] = useState({
    temperature: '',
    blood_pressure: '',
    pulse: '',
    weight: '',
  });

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      appointment.patient_phone.includes(search) ||
      appointment.doctor_name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (
    status: string
  ): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'checked_in':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleScheduleAppointment = () => {
    // TODO: API call to schedule appointment
    console.log('Schedule appointment:', scheduleForm);
    setScheduleOpen(false);
    // Reset form
    setScheduleForm({
      patient_name: '',
      patient_phone: '',
      doctor_name: '',
      appointment_date: '',
      appointment_time: '',
      reason: '',
    });
  };

  const handleCheckIn = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setVitalsForm({
      temperature: appointment.vitals?.temperature || '',
      blood_pressure: appointment.vitals?.blood_pressure || '',
      pulse: appointment.vitals?.pulse || '',
      weight: appointment.vitals?.weight || '',
    });
    setCheckInOpen(true);
  };

  const handleSaveCheckIn = () => {
    if (selectedAppointment) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? { ...apt, status: 'checked_in' as const, vitals: vitalsForm }
            : apt
        )
      );
    }
    setCheckInOpen(false);
    setSelectedAppointment(null);
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' as const } : apt))
    );
  };

  const todayAppointments = appointments.filter(
    (apt) => apt.appointment_date === '2026-01-23'
  ).length;
  const checkedInCount = appointments.filter((apt) => apt.status === 'checked_in').length;
  const scheduledCount = appointments.filter((apt) => apt.status === 'scheduled').length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Appointment Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Schedule and manage patient appointments
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setScheduleOpen(true)}
            size="large"
          >
            Schedule Appointment
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {todayAppointments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today's Appointments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {checkedInCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Checked In
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {scheduledCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Scheduled
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {appointments.filter((apt) => apt.status === 'completed').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Appointment List */}
        <Card>
          <CardContent>
            <Box display="flex" gap={2} mb={3}>
              <TextField
                fullWidth
                placeholder="Search by patient name, phone, or doctor"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="checked_in">Checked In</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {appointment.patient_name}
                        </Typography>
                      </TableCell>
                      <TableCell>{appointment.patient_phone}</TableCell>
                      <TableCell>{appointment.doctor_name}</TableCell>
                      <TableCell>{appointment.appointment_date}</TableCell>
                      <TableCell>{appointment.appointment_time}</TableCell>
                      <TableCell>{appointment.reason}</TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status.replace('_', ' ')}
                          size="small"
                          color={getStatusColor(appointment.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          {appointment.status === 'scheduled' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleCheckIn(appointment)}
                              >
                                Check In
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => handleCancelAppointment(appointment.id)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {appointment.status === 'checked_in' && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleCheckIn(appointment)}
                            >
                              Update Vitals
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Schedule Appointment Dialog */}
        <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Patient Name"
                    value={scheduleForm.patient_name}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, patient_name: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Patient Phone"
                    value={scheduleForm.patient_phone}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, patient_phone: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Doctor"
                    value={scheduleForm.doctor_name}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, doctor_name: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Appointment Date"
                    type="date"
                    value={scheduleForm.appointment_date}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, appointment_date: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Appointment Time"
                    type="time"
                    value={scheduleForm.appointment_time}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, appointment_time: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Visit"
                    value={scheduleForm.reason}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, reason: e.target.value })}
                    multiline
                    rows={3}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleScheduleAppointment}>
              Schedule Appointment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Check In Dialog with Vitals */}
        <Dialog open={checkInOpen} onClose={() => setCheckInOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Patient Check-In & Vitals</DialogTitle>
          <DialogContent>
            {selectedAppointment && (
              <Box sx={{ pt: 2 }}>
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary">
                    Patient
                  </Typography>
                  <Typography variant="h6">{selectedAppointment.patient_name}</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Temperature (°C)"
                      value={vitalsForm.temperature}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: e.target.value })}
                      type="number"
                      inputProps={{ step: '0.1' }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Blood Pressure"
                      value={vitalsForm.blood_pressure}
                      onChange={(e) =>
                        setVitalsForm({ ...vitalsForm, blood_pressure: e.target.value })
                      }
                      placeholder="120/80"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Pulse (bpm)"
                      value={vitalsForm.pulse}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, pulse: e.target.value })}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Weight (kg)"
                      value={vitalsForm.weight}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, weight: e.target.value })}
                      type="number"
                      inputProps={{ step: '0.1' }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCheckInOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveCheckIn}>
              Save & Check In
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AppointmentList;
