import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
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
  Alert,
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
    // Initialize with dummy data
    const dummySlots: TimeSlot[] = [
      {
        id: 1,
        doctor_id: 1,
        slot_date: '2026-01-27',
        start_time: '09:00',
        end_time: '12:00',
        max_appointments: 12,
        is_active: true,
      },
      {
        id: 2,
        doctor_id: 1,
        slot_date: '2026-01-27',
        start_time: '14:00',
        end_time: '17:00',
        max_appointments: 10,
        is_active: true,
      },
      {
        id: 3,
        doctor_id: 1,
        slot_date: '2026-01-28',
        start_time: '09:00',
        end_time: '13:00',
        max_appointments: 15,
        is_active: false,
      },
    ];
    setSlots(dummySlots);
  }, []);

  const handleOpenDialog = (slot?: TimeSlot) => {
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
    setOpenDialog(false);
    setEditingSlot(null);
  };

  const handleSave = () => {
    if (!formData.slot_date || !formData.start_time || !formData.end_time) {
      showError('Please fill in all required fields');
      return;
    }

    if (formData.start_time >= formData.end_time) {
      showError('End time must be after start time');
      return;
    }

    if (editingSlot) {
      // Update existing slot
      setSlots(slots.map(slot =>
        slot.id === editingSlot.id
          ? { ...slot, ...formData }
          : slot
      ));
      showSuccess('Availability slot updated successfully');
    } else {
      // Add new slot
      const newSlot: TimeSlot = {
        id: Math.max(...slots.map(s => s.id), 0) + 1,
        doctor_id: 1,
        ...formData,
      };
      setSlots([...slots, newSlot]);
      showSuccess('Availability slot created successfully');
    }

    handleCloseDialog();
  };

  const handleDelete = (slotId: number) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) {
      return;
    }

    setSlots(slots.filter(slot => slot.id !== slotId));
    showSuccess('Availability slot deleted successfully');
  };

  const handleToggleActive = (slot: TimeSlot) => {
    setSlots(slots.map(s =>
      s.id === slot.id
        ? { ...s, is_active: !s.is_active }
        : s
    ));
    showSuccess('Slot status updated');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
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
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(slot)}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.light'
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleActive(slot)}
                        sx={{
                          color: slot.is_active ? 'warning.main' : 'success.main',
                          '&:hover': {
                            bgcolor: slot.is_active ? 'warning.light' : 'success.light'
                          }
                        }}
                      >
                        <Switch 
                          checked={slot.is_active} 
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(slot.id)}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'error.light'
                          }
                        }}
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
          <Typography variant="h5" fontWeight={700}>
            {editingSlot ? 'Edit Availability Slot' : 'Add New Availability Slot'}
          </Typography>
        </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.slot_date}
                onChange={(e) => setFormData({ ...formData, slot_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                required
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
