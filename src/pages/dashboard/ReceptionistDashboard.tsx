import React, { useMemo, useState } from 'react';
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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ReceptionistDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Array<{
    id: string; patient: string; time: string; doctor: string; status: 'scheduled'|'checked_in'|'completed'; phone: string; nic?: string;
  }>>([
    { id: '1', patient: 'Kasun Bandara', time: '10:00 AM', doctor: 'Dr. Milinda Abeykoon', status: 'scheduled', phone: '+94 71 123 4567', nic: '199012301234' },
    { id: '2', patient: 'Nimal Perera', time: '11:30 AM', doctor: 'Dr. Milinda Abeykoon', status: 'checked_in', phone: '+94 77 555 8899', nic: '198506152345' },
    { id: '3', patient: 'Ishara Silva', time: '2:00 PM', doctor: 'Dr. Milinda Abeykoon', status: 'scheduled', phone: '+94 76 234 5678', nic: '199310052678' },
    { id: '4', patient: 'Amaya Fernando', time: '3:15 PM', doctor: 'Dr. Milinda Abeykoon', status: 'scheduled', phone: '+94 72 987 6543', nic: '199708152156' },
  ]);

  const [search, setSearch] = useState('');
  const [vitalsOpen, setVitalsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tempC, setTempC] = useState('');
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [allergies, setAllergies] = useState('');

  // local storage of vitals by appointment id
  const [vitalsMap, setVitalsMap] = useState<Record<string, { tempC: string; bpSys: string; bpDia: string; allergies: string }>>({
    '2': { tempC: '36.9', bpSys: '120', bpDia: '80', allergies: 'None' },
  });

  const filtered = useMemo(() => {
    if (!search) return appointments;
    const s = search.toLowerCase();
    return appointments.filter(a =>
      a.patient.toLowerCase().includes(s) ||
      a.phone.toLowerCase().includes(s) ||
      (a.nic || '').toLowerCase().includes(s)
    );
  }, [appointments, search]);

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

  const openVitalsFor = (appointmentId: string) => {
    setActiveId(appointmentId);
    const existing = vitalsMap[appointmentId];
    setTempC(existing?.tempC || '');
    setBpSys(existing?.bpSys || '');
    setBpDia(existing?.bpDia || '');
    setAllergies(existing?.allergies || '');
    setVitalsOpen(true);
  };

  const handleSaveVitals = () => {
    if (!activeId) return;
    setVitalsMap(prev => ({ ...prev, [activeId]: { tempC, bpSys, bpDia, allergies } }));
    setAppointments(prev => prev.map(a => a.id === activeId ? { ...a, status: 'checked_in' } : a));
    setVitalsOpen(false);
    setActiveId(null);
  };

  const handleRegisterPatient = () => {
    console.log('Register new patient');
    // In a real app, this would open a registration form
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
            Manage today's appointments and patient registrations.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          {/* Statistics Cards */}
          <Box>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      {appointments.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Today
                    </Typography>
                  </Box>
                  <CalendarIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {appointments.filter(a => a.status === 'checked_in').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Checked In
                    </Typography>
                  </Box>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {appointments.filter(a => a.status === 'scheduled').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Waiting
                    </Typography>
                  </Box>
                  <ScheduleIcon color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      3
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      New Patients
                    </Typography>
                  </Box>
                  <PersonAddIcon color="info" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

          {/* Today's Appointments */}
          <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" fontWeight={600}>
                    Today's Appointments
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={handleRegisterPatient}
                  >
                    Register Patient
                  </Button>
                </Box>

                <Box display="flex" gap={2} mb={2}>
                  <TextField
                    placeholder="Search by name, phone or NIC"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Box>

                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Patient</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Doctor</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>NIC</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PersonIcon color="action" />
                              {appointment.patient}
                            </Box>
                          </TableCell>
                          <TableCell>{appointment.time}</TableCell>
                          <TableCell>{appointment.doctor}</TableCell>
                          <TableCell>
                            <Chip
                              label={appointment.status.replace('_', ' ')}
                              color={getStatusColor(appointment.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{appointment.phone}</TableCell>
                          <TableCell>{appointment.nic}</TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              {appointment.status === 'scheduled' && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => openVitalsFor(appointment.id)}
                                >
                                  Check In & Add Vitals
                                </Button>
                              )}
                              {appointment.status === 'checked_in' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => openVitalsFor(appointment.id)}
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
          </Box>

        {/* Vitals Dialog */}
        <Dialog open={vitalsOpen} onClose={() => setVitalsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Patient Vitals</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Temperature (°C)"
                value={tempC}
                onChange={(e) => setTempC(e.target.value)}
                type="number"
                inputProps={{ step: '0.1' }}
              />
              <TextField
                label="BP Systolic (mmHg)"
                value={bpSys}
                onChange={(e) => setBpSys(e.target.value)}
                type="number"
              />
              <TextField
                label="BP Diastolic (mmHg)"
                value={bpDia}
                onChange={(e) => setBpDia(e.target.value)}
                type="number"
              />
              <TextField
                label="Allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g., Penicillin, Peanuts"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVitalsOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveVitals}>Save</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ReceptionistDashboard;
