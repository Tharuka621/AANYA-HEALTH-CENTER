import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { User } from '../../types';

interface AppointmentModalProps {
  doctor: User;
  onConfirm: (appointmentData: {
    doctor_id: string;
    appointment_date: string;
    appointment_time: string;
    reason: string;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

const timeSlots = [
  // Fixed slot options shown in the time selector.
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  doctor,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    // Collect all validation errors first so users see everything at once.
    const newErrors: Record<string, string> = {};

    if (!selectedDate) {
      newErrors.date = 'Please select a date';
    } else if (selectedDate < new Date()) {
      newErrors.date = 'Please select a future date';
    }

    if (!selectedTime) {
      newErrors.time = 'Please select a time slot';
    }

    if (!reason.trim()) {
      newErrors.reason = 'Please provide a reason for the appointment';
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    // Keep field-level errors in state for inline helper text rendering.
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    // Submit only when the form is valid, then normalize payload for API usage.
    if (validateForm() && selectedDate) {
      onConfirm({
        doctor_id: doctor.id,
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: selectedTime,
        reason: reason.trim(),
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Book Appointment with {doctor.full_name}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please select your preferred date and time for the appointment.
            </Alert>
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Appointment Date"
              value={selectedDate}
              onChange={(newValue) => {
                setSelectedDate(newValue);
                // Remove date error immediately after user picks a valid value.
                if (errors.date) {
                  setErrors(prev => ({ ...prev, date: '' }));
                }
              }}
              minDate={new Date()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.date,
                  helperText: errors.date,
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.time}>
              <InputLabel>Time Slot</InputLabel>
              <Select
                value={selectedTime}
                onChange={(e) => {
                  setSelectedTime(e.target.value);
                  // Clear only this field error to avoid hiding unrelated errors.
                  if (errors.time) {
                    setErrors(prev => ({ ...prev, time: '' }));
                  }
                }}
                label="Time Slot"
              >
                {timeSlots.map((time) => (
                  <MenuItem key={time} value={time}>
                    {time}
                  </MenuItem>
                ))}
              </Select>
              {errors.time && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.time}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reason for Appointment"
              multiline
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                // Real-time feedback: clear reason error once user edits the field.
                if (errors.reason) {
                  setErrors(prev => ({ ...prev, reason: '' }));
                }
              }}
              error={!!errors.reason}
              helperText={errors.reason || 'Please describe the reason for your visit'}
              placeholder="e.g., Regular checkup, specific symptoms, follow-up visit..."
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentModal;

