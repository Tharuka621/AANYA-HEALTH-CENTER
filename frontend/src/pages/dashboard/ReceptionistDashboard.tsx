import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  AccessTime as TimeIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// Database-aligned interfaces
interface Appointment {
  id: string;
  appointment_number: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  date: string;
  time_slot: string;
  status: 'SCHEDULED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  phone: string;
  nic: string;
}

const ReceptionistDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  // Time slots available
  const timeSlots = [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
  ];

  // Filter states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor] = useState('D001'); // Only Dr. Milinda Abeykoon
  const [selectedSlot, setSelectedSlot] = useState('09:00-10:00');
  const [searchQuery, setSearchQuery] = useState('');

  // Utility function to mask NIC (e.g., 199012301234 -> 1990******234)
  const maskNIC = (nic: string) => {
    if (nic.length < 8) return nic;
    return nic.substring(0, 4) + '******' + nic.substring(nic.length - 3);
  };

  // Mock appointments with appointment numbers (dummy data only)
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'APT001',
      appointment_number: 'APT-2026-001',
      patient_id: 'P001',
      patient_name: 'Kasun Bandara',
      doctor_id: 'D001',
      doctor_name: 'Dr. Milinda Abeykoon',
      date: '2026-01-26',
      time_slot: '09:00-10:00',
      status: 'SCHEDULED',
      phone: '+94 71 123 4567',
      nic: '199012301234',
    },
    {
      id: 'APT002',
      appointment_number: 'APT-2026-002',
      patient_id: 'P002',
      patient_name: 'Nimal Perera',
      doctor_id: 'D001',
      doctor_name: 'Dr. Milinda Abeykoon',
      date: '2026-01-26',
      time_slot: '09:00-10:00',
      status: 'CHECKED_IN',
      phone: '+94 77 555 8899',
      nic: '198506152345',
    },
    {
      id: 'APT003',
      appointment_number: 'APT-2026-003',
      patient_id: 'P003',
      patient_name: 'Ishara Silva',
      doctor_id: 'D001',
      doctor_name: 'Dr. Milinda Abeykoon',
      date: '2026-01-26',
      time_slot: '10:00-11:00',
      status: 'SCHEDULED',
      phone: '+94 76 234 5678',
      nic: '199310052678',
    },
    {
      id: 'APT004',
      appointment_number: 'APT-2026-004',
      patient_id: 'P004',
      patient_name: 'Amaya Fernando',
      doctor_id: 'D001',
      doctor_name: 'Dr. Milinda Abeykoon',
      date: '2026-01-26',
      time_slot: '14:00-15:00',
      status: 'SCHEDULED',
      phone: '+94 72 987 6543',
      nic: '199708152156',
    },
    {
      id: 'APT005',
      appointment_number: 'APT-2026-005',
      patient_id: 'P005',
      patient_name: 'Saman Kumara',
      doctor_id: 'D001',
      doctor_name: 'Dr. Milinda Abeykoon',
      date: '2026-01-28',
      time_slot: '14:00-15:00',
      status: 'SCHEDULED',
      phone: '+94 75 111 2233',
      nic: '199205103456',
    },
    {
      id: 'APT006',
      appointment_number: 'APT-2026-006',
      patient_id: 'P006',
      patient_name: 'Dilini Jayasinghe',
      doctor_id: 'D001',
      doctor_name: 'Dr. Milinda Abeykoon',
      date: '2026-01-28',
      time_slot: '09:00-10:00',
      status: 'SCHEDULED',
      phone: '+94 76 444 5555',
      nic: '199501203678',
    },
  ]);

  // Filter appointments by date, doctor, slot, and search query
  const filteredAppointments = useMemo(() => {
    return appointments.filter(
      apt =>
        apt.date === selectedDate &&
        apt.doctor_id === selectedDoctor &&
        apt.time_slot === selectedSlot &&
        (searchQuery === '' ||
          apt.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.appointment_number.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [appointments, selectedDate, selectedDoctor, selectedSlot, searchQuery]);

  // Calculate summary stats for selected date
  const dailyStats = useMemo(() => {
    const todayAppts = appointments.filter(apt => apt.date === selectedDate);
    return {
      total: todayAppts.length,
      checkedIn: todayAppts.filter(a => a.status === 'CHECKED_IN').length,
      waiting: todayAppts.filter(a => a.status === 'SCHEDULED').length,
      completed: todayAppts.filter(a => a.status === 'COMPLETED').length,
    };
  }, [appointments, selectedDate]);

  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Vitals form state
  const [vitalsForm, setVitalsForm] = useState({
    temperature: '',
    systolic_bp: '',
    diastolic_bp: '',
    pulse: '',
    sugar_level: '',
    notes: '',
  });

  // Patient registration form state
  const [patientForm, setPatientForm] = useState({
    nic: '',
    full_name: '',
    phone: '',
    gender: 'MALE',
    date_of_birth: '',
    address: '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CHECKED_IN':
        return 'success';
      case 'SCHEDULED':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleCheckIn = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setVitalsForm({
      temperature: '',
      systolic_bp: '',
      diastolic_bp: '',
      pulse: '',
      sugar_level: '',
      notes: '',
    });
    setVitalsDialogOpen(true);
  };

  const handleUpdateVitals = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    // In real app, would load existing vitals
    setVitalsForm({
      temperature: '37.0',
      systolic_bp: '120',
      diastolic_bp: '80',
      pulse: '72',
      sugar_level: '95',
      notes: 'Normal',
    });
    setVitalsDialogOpen(true);
  };

  const handleSaveVitals = () => {
    if (!selectedAppointment) return;

    // Dummy: Create visit record and save vitals (frontend only)
    console.log('Creating visit for appointment:', selectedAppointment.id);
    console.log('Saving vitals:', vitalsForm);

    // Update appointment status to checked_in
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === selectedAppointment.id
          ? { ...apt, status: 'CHECKED_IN' }
          : apt
      )
    );

    setVitalsDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleRegisterPatient = () => {
    setPatientForm({
      nic: '',
      full_name: '',
      phone: '',
      gender: 'MALE',
      date_of_birth: '',
      address: '',
    });
    setRegisterDialogOpen(true);
  };

  const handleSavePatient = () => {
    // Dummy: Save patient to database (frontend only)
    console.log('Registering new patient:', patientForm);
    setRegisterDialogOpen(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 3,
          px: 4,
          boxShadow: 2,
        }}
      >
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 48, height: 48 }}>
                <HospitalIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  AANYA Health - Receptionist
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Box textAlign="right" mr={1}>
                <Typography variant="body1" fontWeight={600}>
                  {user?.full_name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Receptionist
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 40, height: 40 }}>
                <PersonIcon />
              </Avatar>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={logout}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Filter Section */}
        <Card sx={{ mb: 4, boxShadow: 4, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
                Filter & Search Appointments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use filters to find specific appointments or search by patient ID/name
              </Typography>
            </Box>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by Patient ID, Name, or Appointment Number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'background.paper',
                      },
                      '&.Mui-focused': {
                        bgcolor: 'background.paper',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<PersonAddIcon />}
                  onClick={handleRegisterPatient}
                  sx={{ 
                    height: 56,
                    borderRadius: 2,
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                    },
                  }}
                >
                  Register New Patient
                </Button>
              </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Select Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="doctor-select-label">Doctor</InputLabel>
                  <Select
                    labelId="doctor-select-label"
                    id="doctor-select"
                    value={selectedDoctor}
                    label="Doctor"
                    disabled
                    inputProps={{ 'aria-label': 'Select doctor', title: 'Select doctor' }}
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="D001">Dr. Milinda Abeykoon</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="slot-select-label">Time Slot</InputLabel>
                  <Select
                    labelId="slot-select-label"
                    id="slot-select"
                    value={selectedSlot}
                    label="Time Slot"
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    inputProps={{ 'aria-label': 'Select time slot', title: 'Select time slot' }}
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                    }}
                  >
                    {timeSlots.map((slot) => (
                      <MenuItem key={slot} value={slot}>
                        {slot}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              borderLeft: 4, 
              borderColor: 'primary.main', 
              boxShadow: 3,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
              },
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                      Total Appointments
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="primary.main">
                      {dailyStats.total}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(selectedDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                    <CalendarIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              borderLeft: 4, 
              borderColor: 'success.main', 
              boxShadow: 3,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
              },
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                      Checked-in
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="success.main">
                      {dailyStats.checkedIn}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Patients checked in
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56 }}>
                    <CheckCircleIcon sx={{ fontSize: 32, color: 'success.main' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              borderLeft: 4, 
              borderColor: 'warning.main', 
              boxShadow: 3,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
              },
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                      Waiting
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="warning.main">
                      {dailyStats.waiting}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Yet to check-in
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.light', width: 56, height: 56 }}>
                    <ScheduleIcon sx={{ fontSize: 32, color: 'warning.main' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              borderLeft: 4, 
              borderColor: 'info.main', 
              boxShadow: 3,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
              },
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                      In Selected Slot
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="info.main">
                      {filteredAppointments.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedSlot}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.light', width: 56, height: 56 }}>
                    <TimeIcon sx={{ fontSize: 32, color: 'info.main' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Appointments in Selected Slot Table */}
        <Card sx={{ boxShadow: 4, borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white', 
              p: 3,
              borderRadius: '8px 8px 0 0',
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Appointments in {selectedSlot}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    Dr. Milinda Abeykoon - {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Typography>
                </Box>
                <Chip 
                  label={`${filteredAppointments.length} ${filteredAppointments.length === 1 ? 'Appointment' : 'Appointments'}`}
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                />
              </Box>
            </Box>

            {filteredAppointments.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Appointments in This Slot
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Try selecting a different time slot or date
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100', borderBottom: 2, borderColor: 'primary.main' }}>
                      <TableCell><Typography fontWeight={700}>Appointment Number</Typography></TableCell>
                      <TableCell><Typography fontWeight={700}>Patient Name</Typography></TableCell>
                      <TableCell><Typography fontWeight={700}>Phone</Typography></TableCell>
                      <TableCell><Typography fontWeight={700}>NIC</Typography></TableCell>
                      <TableCell><Typography fontWeight={700}>Status</Typography></TableCell>
                      <TableCell><Typography fontWeight={700}>Action</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAppointments.map((appointment) => (
                      <TableRow 
                        key={appointment.id} 
                        hover
                        sx={{
                          '&:hover': {
                            bgcolor: 'grey.50',
                          },
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={appointment.appointment_number}
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontFamily: 'monospace' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}>
                              <PersonIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                            </Avatar>
                            <Typography fontWeight={600}>{appointment.patient_name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{appointment.phone}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={maskNIC(appointment.nic)}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              borderColor: 'grey.400',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={appointment.status.replace('_', ' ')}
                            color={getStatusColor(appointment.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          {appointment.status === 'SCHEDULED' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleCheckIn(appointment)}
                              sx={{ 
                                textTransform: 'none', 
                                fontWeight: 600,
                                borderRadius: 2,
                                boxShadow: 1,
                                '&:hover': {
                                  boxShadow: 3,
                                },
                              }}
                            >
                              Check In & Add Vitals
                            </Button>
                          )}
                          {appointment.status === 'CHECKED_IN' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => handleUpdateVitals(appointment)}
                              sx={{ 
                                textTransform: 'none', 
                                fontWeight: 600,
                                borderRadius: 2,
                                borderWidth: 2,
                                '&:hover': {
                                  borderWidth: 2,
                                },
                              }}
                            >
                              Update Vitals
                            </Button>
                          )}
                          {appointment.status === 'COMPLETED' && (
                            <Chip 
                              label="Completed" 
                              color="info" 
                              size="small" 
                              sx={{ fontWeight: 600 }} 
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Vitals Dialog */}
        <Dialog 
          open={vitalsDialogOpen} 
          onClose={() => setVitalsDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight={700}>
              Patient Vitals - {selectedAppointment?.patient_name}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Temperature (°C)"
                    type="number"
                    inputProps={{ step: '0.1' }}
                    value={vitalsForm.temperature}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pulse (bpm)"
                    type="number"
                    value={vitalsForm.pulse}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, pulse: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Systolic BP (mmHg)"
                    type="number"
                    value={vitalsForm.systolic_bp}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, systolic_bp: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Diastolic BP (mmHg)"
                    type="number"
                    value={vitalsForm.diastolic_bp}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, diastolic_bp: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Sugar Level (mg/dL)"
                    type="number"
                    value={vitalsForm.sugar_level}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, sugar_level: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={vitalsForm.notes}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, notes: e.target.value })}
                    placeholder="Any additional observations..."
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVitalsDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveVitals}>
              Save Vitals
            </Button>
          </DialogActions>
        </Dialog>

        {/* Register Patient Dialog */}
        <Dialog 
          open={registerDialogOpen} 
          onClose={() => setRegisterDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight={700}>
              Register New Patient
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="NIC Number"
                    value={patientForm.nic}
                    onChange={(e) => setPatientForm({ ...patientForm, nic: e.target.value })}
                    placeholder="e.g., 199012301234"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Full Name"
                    value={patientForm.full_name}
                    onChange={(e) => setPatientForm({ ...patientForm, full_name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Phone Number"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                    placeholder="e.g., +94 71 123 4567"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    select
                    label="Gender"
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                    SelectProps={{ 
                      native: true,
                      inputProps: { 'aria-label': 'Select gender', title: 'Select gender' }
                    }}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Date of Birth"
                    type="date"
                    value={patientForm.date_of_birth}
                    onChange={(e) => setPatientForm({ ...patientForm, date_of_birth: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    value={patientForm.address}
                    onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRegisterDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSavePatient}>
              Register Patient
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ReceptionistDashboard;
