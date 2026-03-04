import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Grid, Card,
  CardContent, CircularProgress, InputAdornment, Stack,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { axiosInstance } from '../../services/api';
import { useToast } from '../../components/common/Toast';

interface Appointment {
  id: string;
  appointment_no: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  reason: string;
  status: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  has_visit?: boolean;
}

const statusColors: Record<string, any> = {
  scheduled: 'warning',
  checked_in: 'info',
  completed: 'success',
  cancelled: 'error',
};

const statusLabels: Record<string, string> = {
  scheduled: 'Scheduled',
  checked_in: 'Checked In',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const fmtTime = (t: string) => {
  if (!t) return '';
  try { return new Date(`2000-01-01T${t}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }
  catch { return t; }
};

const AppointmentList: React.FC = () => {
  const { showError } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/appointments/doctor/appointments');
      setAppointments(response.data);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesSearch = !searchQuery ||
        apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.appointment_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patient_phone?.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      const matchesDate = !selectedDate || apt.slot_date === selectedDate;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, searchQuery, statusFilter, selectedDate]);

  // Aggregate stats
  const stats = useMemo(() => ({
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    checkedIn: appointments.filter(a => a.status === 'checked_in').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }), [appointments]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>

        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={800}>My Appointments</Typography>
            <Typography variant="body2" color="text.secondary">All scheduled appointments for your practice</Typography>
          </Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAppointments} disabled={loading}>
            Refresh
          </Button>
        </Box>

        {/* Stats row */}
        <Grid container spacing={2} mb={3}>
          {[
            { label: 'Total', value: stats.total, color: '#1a237e' },
            { label: 'Scheduled', value: stats.scheduled, color: '#e65100' },
            { label: 'Checked In', value: stats.checkedIn, color: '#0277bd' },
            { label: 'Completed', value: stats.completed, color: '#2e7d32' },
          ].map(s => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: s.color, textTransform: 'uppercase' }}>{s.label}</Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters */}
        <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField fullWidth size="small" placeholder="Search by name, phone, appointment no..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth size="small" type="date" label="Filter by date"
                  value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={5}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {['all', 'scheduled', 'checked_in', 'completed', 'cancelled'].map(s => (
                    <Chip key={s} label={s === 'all' ? 'All' : statusLabels[s] || s}
                      variant={statusFilter === s ? 'filled' : 'outlined'}
                      color={statusFilter === s ? 'primary' : 'default'}
                      size="small"
                      onClick={() => setStatusFilter(s)}
                      sx={{ cursor: 'pointer', fontWeight: 600 }} />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Table */}
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
          ) : filteredAppointments.length === 0 ? (
            <Box py={8} textAlign="center">
              <CalendarIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No appointments found</Typography>
              <Typography variant="body2" color="text.disabled">Try adjusting your filters</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Appt No.</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAppointments.map((apt) => (
                    <TableRow key={apt.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', fontSize: '0.85rem', fontWeight: 700 }}>
                            {apt.patient_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{apt.patient_name}</Typography>
                            {apt.patient_phone && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <PhoneIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.secondary">{apt.patient_phone}</Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{apt.slot_date}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fmtTime(apt.start_time)} – {fmtTime(apt.end_time)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {apt.reason || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabels[apt.status] || apt.status}
                          size="small"
                          color={statusColors[apt.status] || 'default'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
                          {apt.appointment_no || `APT-${String(apt.id).padStart(6, '0')}`}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="outlined" startIcon={<ViewIcon />}
                          onClick={() => { setSelectedAppointment(apt); setOpenDialog(true); }}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* Detail Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{selectedAppointment?.patient_name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedAppointment?.appointment_no || `APT-${String(selectedAppointment?.id).padStart(6, '0')}`}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedAppointment && (
              <Grid container spacing={2} sx={{ pt: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Date</Typography>
                  <Typography fontWeight={600}>{selectedAppointment.slot_date}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Time</Typography>
                  <Typography fontWeight={600}>{fmtTime(selectedAppointment.start_time)} – {fmtTime(selectedAppointment.end_time)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography fontWeight={600}>{selectedAppointment.patient_phone || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box mt={0.5}>
                    <Chip label={statusLabels[selectedAppointment.status] || selectedAppointment.status}
                      size="small" color={statusColors[selectedAppointment.status] || 'default'} />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Reason for Visit</Typography>
                  <Typography fontWeight={600}>{selectedAppointment.reason || 'Not specified'}</Typography>
                </Grid>
              </Grid>
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
