import React, { useState, useMemo, useEffect } from 'react';
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
  LinearProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';
import {
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  AccessTime as TimeIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  LocalActivity as TicketIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';

// Database-aligned interfaces
interface Appointment {
  id: string;
  appointment_no: string;
  patient_id: string;
  patient_name: string;
  status: 'scheduled' | 'checked_in' | 'completed' | 'cancelled';
  phone: string;
  nic: string;
  reason: string;
  temperature?: number;
  pulse?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  weight?: number;
  sugar_level?: number;
  vital_notes?: string;
}

const ReceptionistDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();

  // Filter states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [slots, setSlots] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch slots for selected date
  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await api.appointments.getReceptionistSlots(selectedDate);
      if (res.success) {
        setSlots(res.data);
        if (res.data.length > 0) {
          // If previous selection is still there, keep it, otherwise pick first
          const stillExists = res.data.find((s: any) => s.id === selectedSlotId);
          if (!stillExists) {
            setSelectedSlotId(res.data[0].id);
          }
        } else {
          setSelectedSlotId(null);
        }
      }
    } catch (err) {
      showError('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointments for selected slot
  const fetchAppointments = async (slotId: string) => {
    try {
      const res = await api.appointments.getSlotAppointments(slotId);
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      showError('Failed to load appointments');
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedDate]);

  useEffect(() => {
    if (selectedSlotId) {
      fetchAppointments(selectedSlotId);
    } else {
      setAppointments([]);
    }
  }, [selectedSlotId]);

  // Utility function to mask NIC
  const maskNIC = (nic: string) => {
    if (!nic) return 'N/A';
    if (nic.length < 8) return nic;
    return nic.substring(0, 4) + '******' + nic.substring(nic.length - 3);
  };

  // Filter appointments by search query
  const filteredAppointments = useMemo(() => {
    return appointments.filter(
      apt =>
        searchQuery === '' ||
        apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.appointment_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.nic.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [appointments, searchQuery]);

  // Daily stats for selected date
  const dailyStats = useMemo(() => {
    return {
      total: Array.isArray(slots) ? slots.reduce((acc, s) => acc + (Number(s.booked_count) || 0), 0) : 0,
      slots: slots.length,
      activeSlots: slots.filter(s => s.is_active).length,
      availableCount: Array.isArray(slots) ? slots.filter(s => (Number(s.max_appointments) || 0) > (Number(s.booked_count) || 0)).length : 0,
      checkedInCount: appointments.filter(a => a.status === 'checked_in').length,
    };
  }, [slots, appointments]);

  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Vitals form state
  const [vitalsForm, setVitalsForm] = useState({
    temperature: '',
    systolic_bp: '',
    diastolic_bp: '',
    pulse: '',
    weight: '',
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
    email: '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_in':
        return 'success';
      case 'scheduled':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleCheckIn = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setVitalsForm({
      temperature: appointment.temperature?.toString() || '',
      systolic_bp: appointment.systolic_bp?.toString() || '',
      diastolic_bp: appointment.diastolic_bp?.toString() || '',
      pulse: appointment.pulse?.toString() || '',
      weight: appointment.weight?.toString() || '',
      sugar_level: appointment.sugar_level?.toString() || '',
      notes: appointment.vital_notes || '',
    });
    setVitalsDialogOpen(true);
  };

  const handleSaveVitals = async () => {
    if (!selectedAppointment) return;

    const res = await api.appointments.checkIn(selectedAppointment.id, vitalsForm);
    if (res.success) {
      showSuccess('Patient checked in and vitals saved');
      setVitalsDialogOpen(false);
      fetchAppointments(selectedSlotId!);
      fetchSlots(); // Refresh counts
    } else {
      showError(res.message);
    }
  };

  const handleSavePatient = async () => {
    if (!selectedSlotId) {
      showError('Please select a time slot first');
      return;
    }

    const slot = slots.find(s => s.id === selectedSlotId);
    const data = {
      patientInfo: patientForm,
      slotId: selectedSlotId,
      doctorId: slot.doctor_id,
      vitals: vitalsForm,
      reason: 'Walk-in'
    };

    const res = await api.appointments.registerWalkIn(data);
    if (res.success) {
      showSuccess('Walk-in patient registered and checked in');
      setRegisterDialogOpen(false);
      fetchSlots();
      fetchAppointments(selectedSlotId);
    } else {
      showError(res.message);
    }
  };

  const handleUpdateVitals = (appointment: Appointment) => {
    handleCheckIn(appointment);
  };

  const handleRegisterPatient = () => {
    setPatientForm({
      nic: '',
      full_name: '',
      phone: '',
      gender: 'MALE',
      date_of_birth: '',
      address: '',
      email: '',
    });
    setRegisterDialogOpen(true);
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

      {loading && <LinearProgress sx={{ position: 'sticky', top: 0, zIndex: 1000 }} />}

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Left Side: Time Slots & Summary */}
          <Grid item xs={12} lg={4}>
            {/* Filter Card */}
            <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
                  Schedule Date
                </Typography>
                <DatePicker
                  label="Select Date"
                  format="dd/MM/yyyy"
                  value={parseISO(selectedDate)}
                  onChange={(newValue) => {
                    if (newValue) {
                      setSelectedDate(format(newValue, 'yyyy-MM-dd'));
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'grey.50',
                          borderRadius: 2,
                        },
                      }
                    }
                  }}
                />

                <Box sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={handleRegisterPatient}
                    size="large"
                    sx={{ borderRadius: 2, height: 48 }}
                  >
                    Register Walk-in
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Time Slots List */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, px: 1 }}>
              Time Slots ({slots.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {slots.length === 0 ? (
                <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', border: '1px dashed grey.300' }}>
                  <Typography color="text.secondary">No slots for this date</Typography>
                </Card>
              ) : (
                slots.map((slot) => (
                  <Card
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    sx={{
                      cursor: 'pointer',
                      transition: '0.2s',
                      borderRadius: 2,
                      border: 2,
                      borderColor: selectedSlotId === slot.id ? 'primary.main' : 'transparent',
                      bgcolor: selectedSlotId === slot.id ? 'primary.50' : 'background.paper',
                      '&:hover': {
                        transform: 'translateX(4px)',
                        boxShadow: 2,
                        borderColor: selectedSlotId === slot.id ? 'primary.main' : 'primary.light',
                      }
                    }}
                  >
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <TimeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                          <Typography fontWeight={700}>
                            {slot.start_time} - {slot.end_time}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonIcon sx={{ fontSize: 16 }} />
                          {slot.doctor_name}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${slot.booked_count || 0}/${slot.max_appointments}`}
                        size="small"
                        color={slot.booked_count >= slot.max_appointments ? "error" : "primary"}
                        variant={selectedSlotId === slot.id ? "contained" : "outlined"}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                  </Card>
                ))
              )}
            </Box>
          </Grid>

          {/* Right Side: Appointments Table */}
          <Grid item xs={12} lg={8}>
            {/* Search Header */}
            <Card sx={{ mb: 3, boxShadow: 1, borderRadius: 2 }}>
              <CardContent sx={{ py: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Search by Patient ID, Name, or NIC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </CardContent>
            </Card>

            {/* Daily Stats Summary */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Card sx={{ bgcolor: 'primary.50', color: 'primary.main', borderRadius: 2 }}>
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Booked</Typography>
                    <Typography variant="h5" fontWeight={700}>{dailyStats.total}</Typography>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ bgcolor: 'success.50', color: 'success.main', borderRadius: 2 }}>
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Checked-in</Typography>
                    <Typography variant="h5" fontWeight={700}>{dailyStats.checkedInCount}</Typography>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ bgcolor: 'info.50', color: 'info.main', borderRadius: 2 }}>
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Active Slots</Typography>
                    <Typography variant="h5" fontWeight={700}>{dailyStats.activeSlots}</Typography>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ bgcolor: 'warning.50', color: 'warning.main', borderRadius: 2 }}>
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Available</Typography>
                    <Typography variant="h5" fontWeight={700}>{dailyStats.availableCount}</Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* Patient List Card */}
            <Card sx={{ boxShadow: 4, borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{
                bgcolor: 'primary.main',
                color: 'white',
                px: 3,
                py: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {selectedSlotId ? "Slot Appointments" : "Select a time slot to view patients"}
                  </Typography>
                  {selectedSlotId && (
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {slots.find(s => s.id === selectedSlotId)?.start_time} - {slots.find(s => s.id === selectedSlotId)?.end_time}
                    </Typography>
                  )}
                </Box>
                {selectedSlotId && (
                  <Chip
                    label={`${filteredAppointments.length} Patients`}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
                  />
                )}
              </Box>

              {selectedSlotId ? (
                filteredAppointments.length === 0 ? (
                  <Box sx={{ p: 8, textAlign: 'center' }}>
                    <ScheduleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">No appointments for this slot</Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>No.</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Patient Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>NIC</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAppointments.map((apt) => (
                          <TableRow key={apt.id} hover>
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              {apt.appointment_no}
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={600}>{apt.patient_name}</Typography>
                              <Typography variant="caption" color="text.secondary">{apt.phone}</Typography>
                            </TableCell>
                            <TableCell>{maskNIC(apt.nic)}</TableCell>
                            <TableCell>
                              <Chip
                                label={apt.status.replace('_', ' ')}
                                size="small"
                                color={getStatusColor(apt.status)}
                                sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>
                              {apt.status === 'scheduled' ? (
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleCheckIn(apt)}
                                  sx={{ borderRadius: 1.5 }}
                                >
                                  Check In
                                </Button>
                              ) : (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleUpdateVitals(apt)}
                                  sx={{ borderRadius: 1.5 }}
                                >
                                  Vitals
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              ) : (
                <Box sx={{ p: 10, textAlign: 'center' }}>
                  <HospitalIcon sx={{ fontSize: 64, color: 'primary.light', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary">
                    Select a time slot from the left side to see the waiting list
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Vitals Dialog */}
      <Dialog
        open={vitalsDialogOpen}
        onClose={() => setVitalsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700} component="div">
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
                  value={vitalsForm.temperature}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  type="number"
                  value={vitalsForm.weight}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, weight: e.target.value })}
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
          <Typography variant="h6" fontWeight={700} component="div">
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
                <DatePicker
                  label="Date of Birth"
                  format="dd/MM/yyyy"
                  value={patientForm.date_of_birth ? parseISO(patientForm.date_of_birth) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      setPatientForm({ ...patientForm, date_of_birth: format(newValue, 'yyyy-MM-dd') });
                    }
                  }}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email (Optional)"
                  type="email"
                  value={patientForm.email}
                  onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
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
    </Box>
  );
};

export default ReceptionistDashboard;
