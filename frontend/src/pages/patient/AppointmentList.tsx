import React, { useState } from 'react';
import { format } from 'date-fns';
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
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  EventAvailable as SlotIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../contexts/AuthContext';
import { useAppointmentsByPatient, useCancelAppointment, useUpdateAppointment } from '../../hooks/useAppointments';
import { axiosInstance } from '../../services/api';
import { useToast } from '../../components/common/Toast';

interface AvailableSlot {
  id: number;
  doctor_name: string;
  start_time: string;
  end_time: string;
  available_slots: number;
}

const AppointmentList: React.FC = () => {
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Form state
  const [reason, setReason] = useState('');

  // Reschedule state
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { data: appointmentsData, isLoading, isError } = useAppointmentsByPatient(user?.id || '');
  const updateAppointment = useUpdateAppointment();
  const cancelAppointment = useCancelAppointment();

  const rawAppointments = appointmentsData?.data || [];

  const appointments = rawAppointments.map((app: any) => ({
    id: app.id,
    slot_id: app.slot_id,
    date: app.slot_date ? format(new Date(app.slot_date), 'dd/MM/yyyy') : 'N/A',
    time: app.start_time ? app.start_time.substring(0, 5) : 'TBD',
    reason: app.reason || 'N/A',
    status: app.status || 'scheduled',
    doctor: app.doctor_name || 'Assigned Doctor',
    notes: app.notes || '',
    appointmentNumber: app.appointmentNumber || `APT${String(app.id).padStart(6, '0')}`,
    queue_position: app.queue_position || 1,
    estimated_arrival_time: app.estimated_arrival_time || null,
    minutes_per_patient: app.minutes_per_patient || null,
  }));

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no_show': return 'warning';
      default: return 'default';
    }
  };

  const fetchSlotsForDate = async (date: Date) => {
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSlotsError('');
    setSelectedSlotId(null);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await axiosInstance.get(`/appointments/slots/available?date=${dateStr}`);
      const slots: AvailableSlot[] = res.data;
      setAvailableSlots(slots);
      if (slots.length === 0) {
        setSlotsError('No available slots for this date. Please choose another date.');
      }
    } catch {
      setSlotsError('Failed to load available slots. Please try again.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleOpenEdit = (appointment: any) => {
    setSelectedAppointment(appointment);
    setReason(appointment.reason === 'N/A' ? '' : appointment.reason);
    setRescheduleDate(null);
    setAvailableSlots([]);
    setSelectedSlotId(null);
    setSlotsError('');
    setViewOnly(false);
    setOpenDialog(true);
  };

  const handleOpenView = (appointment: any) => {
    setSelectedAppointment(appointment);
    setReason(appointment.reason === 'N/A' ? '' : appointment.reason);
    setRescheduleDate(null);
    setAvailableSlots([]);
    setSelectedSlotId(null);
    setSlotsError('');
    setViewOnly(true);
    setOpenDialog(true);
  };

  const handleOpenBook = () => {
    setSelectedAppointment(null);
    setReason('');
    setRescheduleDate(null);
    setAvailableSlots([]);
    setSelectedSlotId(null);
    setSlotsError('');
    setViewOnly(false);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
  };

  const handleDateChange = (newDate: Date | null) => {
    setRescheduleDate(newDate);
    if (newDate) {
      fetchSlotsForDate(newDate);
    } else {
      setAvailableSlots([]);
      setSelectedSlotId(null);
      setSlotsError('');
    }
  };

  const handleSave = () => {
    if (!selectedAppointment) return;

    const updates: Record<string, any> = {};

    // Always include reason if changed
    if (reason.trim()) {
      updates.reason = reason.trim();
    }

    // Include slot_id only if a new slot was selected
    if (selectedSlotId) {
      updates.slot_id = selectedSlotId;
    }

    if (Object.keys(updates).length === 0) {
      showError('No changes made. Please update the reason or select a new time slot.');
      return;
    }

    updateAppointment.mutate(
      { id: selectedAppointment.id, updates },
      {
        onSuccess: () => {
          showSuccess('Appointment updated successfully!');
          handleClose();
        },
        onError: (err: any) => {
          showError(err?.response?.data?.message || 'Failed to update appointment. Please try again.');
        },
      }
    );
  };

  const handleCancel = (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelAppointment.mutate(appointmentId, {
        onSuccess: () => showSuccess('Appointment cancelled.'),
        onError: () => showError('Failed to cancel appointment.'),
      });
    }
  };

  const upcomingCount = appointments.filter((a: any) =>
    ['scheduled', 'confirmed'].includes(a.status.toLowerCase())
  ).length;
  const completedCount = appointments.filter((a: any) =>
    a.status.toLowerCase() === 'completed'
  ).length;

  const filteredAppointments = appointments.filter((app: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      app.appointmentNumber.toLowerCase().includes(searchLower) ||
      app.doctor.toLowerCase().includes(searchLower) ||
      app.reason.toLowerCase().includes(searchLower) ||
      app.date.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">Failed to load appointments. Please check your connection.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            My Appointments
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenBook}>
            Book Appointment
          </Button>
        </Box>

        {/* Summary Cards */}
        <Box display="flex" gap={2} mb={4}>
          <Alert severity="info" sx={{ flex: 1 }}>
            <Typography variant="body2">Upcoming Appointments: {upcomingCount}</Typography>
          </Alert>
          <Alert severity="success" sx={{ flex: 1 }}>
            <Typography variant="body2">Completed Appointments: {completedCount}</Typography>
          </Alert>
        </Box>

        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Search appointments by doctor, reason, or number..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }
            }}
          />
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Appt. No.</TableCell>
                <TableCell>Date &amp; Time</TableCell>
                <TableCell>Arrive By</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {searchTerm ? `No appointments matching "${searchTerm}"` : 'No appointments found.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment: any) => (
                  <TableRow key={appointment.id}>
                    {/* Appointment Number + Queue */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ fontFamily: 'monospace' }}>
                          {appointment.appointmentNumber}
                        </Typography>
                        <Chip
                          label={`#${appointment.queue_position} in queue`}
                          size="small"
                          variant="outlined"
                          color="default"
                          sx={{ mt: 0.5, fontSize: '0.68rem' }}
                        />
                      </Box>
                    </TableCell>
                    {/* Date & Slot Time */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {appointment.date}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Slot: {appointment.time}
                        </Typography>
                      </Box>
                    </TableCell>
                    {/* Estimated Arrive By */}
                    <TableCell>
                      {appointment.estimated_arrival_time ? (
                        <Box>
                          <Typography variant="body2" fontWeight={700} color="success.main">
                            {appointment.estimated_arrival_time}
                          </Typography>
                          {appointment.minutes_per_patient && (
                            <Typography variant="caption" color="text.secondary">
                              ~{appointment.minutes_per_patient} min/patient
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
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
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          color="info"
                          title="View"
                          onClick={() => handleOpenView(appointment)}
                        >
                          <ViewIcon />
                        </IconButton>
                        {appointment.status.toLowerCase() === 'scheduled' && (
                          <>
                            <IconButton
                              size="small"
                              color="primary"
                              title="Edit / Reschedule"
                              onClick={() => handleOpenEdit(appointment)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              title="Cancel"
                              onClick={() => handleCancel(appointment.id)}
                            >
                              <CancelIcon />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Edit / View / Book Dialog */}
        <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {!selectedAppointment ? 'Book New Appointment' : viewOnly ? 'Appointment Details' : 'Modify Appointment'}
          </DialogTitle>

          <DialogContent>
            <Box sx={{ pt: 1 }}>
              {/* Current appointment info */}
              {selectedAppointment && (
                <Box mb={2} p={2} bgcolor="action.hover" borderRadius={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Current Appointment
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong> {selectedAppointment.date} &nbsp;|&nbsp;
                    <strong>Time:</strong> {selectedAppointment.time}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Doctor:</strong> {selectedAppointment.doctor}
                  </Typography>
                </Box>
              )}

              {/* Reschedule section (edit mode only) */}
              {selectedAppointment && !viewOnly && (
                <Box mb={2}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <SlotIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Reschedule (Optional)
                    </Typography>
                  </Box>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Select New Date"
                      value={rescheduleDate}
                      onChange={handleDateChange}
                      minDate={new Date()}
                      slotProps={{
                        textField: { fullWidth: true, size: 'small' },
                      }}
                    />
                  </LocalizationProvider>

                  {loadingSlots && (
                    <Box display="flex" alignItems="center" gap={1} mt={2}>
                      <CircularProgress size={18} />
                      <Typography variant="body2" color="text.secondary">Loading available slots…</Typography>
                    </Box>
                  )}

                  {!loadingSlots && slotsError && (
                    <Alert severity="warning" sx={{ mt: 1 }}>{slotsError}</Alert>
                  )}

                  {!loadingSlots && availableSlots.length > 0 && (
                    <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                      <InputLabel>Select New Time Slot</InputLabel>
                      <Select
                        value={selectedSlotId ?? ''}
                        label="Select New Time Slot"
                        onChange={(e) => setSelectedSlotId(Number(e.target.value))}
                      >
                        {availableSlots.map((slot) => (
                          <MenuItem key={slot.id} value={slot.id}>
                            Dr. {slot.doctor_name} &nbsp;|&nbsp;
                            {slot.start_time.substring(0, 5)} – {slot.end_time.substring(0, 5)}
                            &nbsp;
                            <Chip
                              label={`${slot.available_slots} left`}
                              size="small"
                              color={slot.available_slots > 3 ? 'success' : 'warning'}
                              sx={{ ml: 1 }}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              )}

              {/* Reason field */}
              <TextField
                fullWidth
                label="Reason for Visit"
                multiline
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                margin="normal"
                disabled={viewOnly}
                placeholder="Describe your symptoms or reason for the visit…"
              />

              {/* Status badge (view only) */}
              {selectedAppointment && (
                <Box mt={1}>
                  <Chip
                    label={selectedAppointment.status}
                    color={getStatusColor(selectedAppointment.status)}
                    size="small"
                  />
                </Box>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} color="inherit">
              {viewOnly ? 'Close' : 'Cancel'}
            </Button>
            {!viewOnly && selectedAppointment && (
              <Button
                onClick={handleSave}
                variant="contained"
                disabled={updateAppointment.isPending}
                startIcon={updateAppointment.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
              >
                {updateAppointment.isPending ? 'Saving…' : 'Update Appointment'}
              </Button>
            )}
            {!selectedAppointment && (
              <Button variant="contained" onClick={handleClose}>
                Go to Booking
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AppointmentList;
