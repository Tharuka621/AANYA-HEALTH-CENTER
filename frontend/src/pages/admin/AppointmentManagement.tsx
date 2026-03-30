import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';
import { CalendarToday as CalendarIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { axiosInstance } from '../../services/api';

interface AdminAppointment {
  id: number;
  appointment_no: string;
  patient_name: string;
  patient_phone: string | null;
  doctor_name: string | null;
  slot_date: string | null;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  status: string;
}

const fmtDate = (value: string | null) => {
  if (!value) return '—';
  return format(new Date(value), 'dd/MM/yyyy');
};

const fmtTime = (value: string | null) => {
  if (!value) return '—';
  return new Date(`2000-01-01T${value}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const getStatusColor = (status: string): 'primary' | 'success' | 'error' | 'warning' | 'info' | 'default' => {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'primary';
    case 'checked_in':
      return 'info';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/admin/appointments');
      setAppointments(response.data.appointments || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const stats = useMemo(() => ({
    total: appointments.length,
    scheduled: appointments.filter((item) => item.status === 'scheduled').length,
    checkedIn: appointments.filter((item) => item.status === 'checked_in').length,
    completed: appointments.filter((item) => item.status === 'completed').length,
  }), [appointments]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Appointment Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Live appointment data from the database
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAppointments} disabled={loading}>
            Refresh
          </Button>
        </Box>

        <Grid container spacing={2} mb={3}>
          {[
            { label: 'Total', value: stats.total },
            { label: 'Scheduled', value: stats.scheduled },
            { label: 'Checked In', value: stats.checkedIn },
            { label: 'Completed', value: stats.completed },
          ].map((item) => (
            <Grid item xs={6} md={3} key={item.label}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="h4" fontWeight={700}>{item.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
          ) : appointments.length === 0 ? (
            <Box py={8} textAlign="center">
              <CalendarIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No appointments found</Typography>
            </Box>
          ) : (
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
                    <TableCell>Appointment No.</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {appointment.patient_name.split(' ').map((name) => name[0]).join('').slice(0, 2)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {appointment.patient_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{appointment.doctor_name ? `Dr. ${appointment.doctor_name}` : '—'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{fmtDate(appointment.slot_date)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fmtTime(appointment.start_time)} - {fmtTime(appointment.end_time)}
                        </Typography>
                      </TableCell>
                      <TableCell>{appointment.reason || '—'}</TableCell>
                      <TableCell>
                        <Chip label={appointment.status.replace('_', ' ')} color={getStatusColor(appointment.status)} size="small" />
                      </TableCell>
                      <TableCell>{appointment.patient_phone || '—'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{appointment.appointment_no}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>
    </Container>
  );
};

export default AppointmentManagement;

