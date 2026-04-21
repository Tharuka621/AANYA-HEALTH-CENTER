import React, { useState, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';
import {
  Box,
  Button,
  Typography,
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
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { axiosInstance } from '../../services/api';
import { useToast } from '../common/Toast';

interface TimeSlot {
  id: number;
  doctor_id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_appointments: number;
  is_active: boolean;
}

const AvailabilityManager: React.FC = () => {
  // Slot list and dialog state used by the availability table and form.
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    slot_date: '',
    start_time: '',
    end_time: '',
    max_appointments: 10,
    is_active: true,
  });

  useEffect(() => {
    // Load existing slots once when the page opens.
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    // Read all availability slots for the logged-in doctor.
    try {
      setLoading(true);
      const response = await axiosInstance.get('/appointments/doctor/slots');
      setSlots(response.data);
    } catch (error: any) {
      console.error('Error fetching slots:', error);
      showError(error.response?.data?.message || 'Failed to fetch availability slots');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (slot?: TimeSlot) => {
    // If a slot is provided, open dialog in edit mode. Otherwise, create mode.
    if (slot) {
      setEditingSlot(slot);
      setFormData({
        slot_date: slot.slot_date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        max_appointments: slot.max_appointments,
        is_active: slot.is_active,
      });
    } else {
      setEditingSlot(null);
      setFormData({
        slot_date: '',
        start_time: '',
        end_time: '',
        max_appointments: 10,
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    // Close the form dialog and clear editing context.
    setOpenDialog(false);
    setEditingSlot(null);
  };

  const handleSave = async () => {
    // Basic required-field validation before any API call.
    if (!formData.slot_date || !formData.start_time || !formData.end_time) {
      showError('Please fill in all required fields');
      return;
    }

    //  a slot must end after it starts.
    if (formData.start_time >= formData.end_time) {
      showError('End time must be after start time');
      return;
    }

    try {
      setLoading(true);

      if (editingSlot) {
        // Update an existing slot.
        await axiosInstance.put(`/appointments/doctor/slots/${editingSlot.id}`, formData);
        showSuccess('Availability slot updated successfully');
      } else {
        // Create a new slot.
        await axiosInstance.post('/appointments/doctor/slots', formData);
        showSuccess('Availability slot created successfully');
      }

      // Refresh slots list
      await fetchSlots();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving slot:', error);
      showError(error.response?.data?.message || 'Failed to save availability slot');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slotId: number) => {
    // Ask for confirmation before permanent deletion.
    if (!window.confirm('Are you sure you want to delete this slot? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.delete(`/appointments/doctor/slots/${slotId}`);
      showSuccess('Availability slot deleted successfully');

      // Refresh slots list
      await fetchSlots();
    } catch (error: any) {
      console.error('Error deleting slot:', error);
      showError(error.response?.data?.message || 'Failed to delete availability slot');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (slot: TimeSlot) => {
    // Quickly enable/disable a slot from the table.
    try {
      setLoading(true);
      await axiosInstance.put(`/appointments/doctor/slots/${slot.id}`, {
        ...slot,
        is_active: !slot.is_active,
      });
      showSuccess(`Slot ${!slot.is_active ? 'activated' : 'deactivated'} successfully`);

      // Refresh slots list
      await fetchSlots();
    } catch (error: any) {
      console.error('Error updating slot status:', error);
      showError(error.response?.data?.message || 'Failed to update slot status');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    // Display dates in day/month/year format for Sri Lanka style UX.
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    // Convert 24h time from API to a readable 12h label.
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Box>
      {/* Action Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="body1" color="text.secondary">
            Manage your weekly schedule and time slots
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
          sx={{
            fontWeight: 600,
            px: 3,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4
            }
          }}
        >
          Add Time Slot
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={48} />
        </Box>
      ) : slots.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'grey.50', borderRadius: 2 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No availability slots configured
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Add your first time slot to start accepting patient appointments
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Slot
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Time Slot</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Capacity</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {slots.map((slot) => (
                <TableRow
                  key={slot.id}
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: 'primary.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'primary.main'
                        }}
                      >
                        <CalendarIcon fontSize="small" />
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDate(slot.slot_date)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {formatTime(slot.start_time)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">-</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatTime(slot.end_time)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${slot.max_appointments} patients`}
                      size="small"
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={slot.is_active ? 'Active' : 'Inactive'}
                      color={slot.is_active ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={0.5} justifyContent="flex-end" alignItems="center">
                      <Switch
                        checked={!!slot.is_active}
                        size="small"
                        onChange={() => handleToggleActive(slot)}
                        color={slot.is_active ? 'warning' : 'success'}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(slot)}
                        sx={{ color: 'primary.main', '&:hover': { bgcolor: 'primary.light' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(slot.id)}
                        sx={{ color: 'error.main', '&:hover': { bgcolor: 'error.light' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          {editingSlot ? 'Edit Availability Slot' : 'Add New Availability Slot'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <DatePicker
              label="Date *"
              format="dd/MM/yyyy"
              value={formData.slot_date ? parseISO(formData.slot_date) : null}
              onChange={(newDate: any) => {
                // Store date in backend-friendly yyyy-MM-dd format.
                if (newDate) {
                  setFormData({ ...formData, slot_date: format(newDate, 'yyyy-MM-dd') });
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal',
                  required: true
                }
              }}
            />
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Maximum Appointments"
              type="number"
              value={formData.max_appointments}
              // Keep capacity as number for backend validation and inserts.
              onChange={(e) => setFormData({ ...formData, max_appointments: parseInt(e.target.value) })}
              margin="normal"
              inputProps={{ min: 1 }}
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" size="large" sx={{ px: 4, fontWeight: 600 }}>
            {editingSlot ? 'Update Slot' : 'Create Slot'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AvailabilityManager;
