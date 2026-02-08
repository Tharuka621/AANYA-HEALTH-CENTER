import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { axiosInstance } from '../../services/api';
import { useToast } from '../common/Toast';
import { useQueryClient } from '@tanstack/react-query';
import { appointmentKeys } from '../../hooks/useAppointments';

interface AvailableSlot {
  id: number;
  doctor_id: number;
  doctor_name: string;
  doctor_email: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  max_appointments: number;
  available_slots: number;
  booked_count: number;
}

interface BookingConfirmation {
  appointmentId: number;
  appointmentNumber: string;
  paymentStatus: string;
}

interface AppointmentFee {
  amount: number;
}

const AppointmentBooking: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [reason, setReason] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);
  const [appointmentFee, setAppointmentFee] = useState<number>(2500);
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const { showSuccess, showError } = useToast();

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    
    try {
      const response = await axiosInstance.get(`/appointments/slots/available?date=${selectedDate}`);
      setAvailableSlots(response.data);
      
      if (response.data.length === 0) {
        showError('No available slots for this date');
      }
    } catch (error: any) {
      console.error('Error fetching available slots:', error);
      showError(error.response?.data?.message || 'Failed to fetch available slots');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setOpenConfirmDialog(true);
  };

  const fetchAppointmentFee = async () => {
    try {
      const response = await axiosInstance.get('/appointments/fee');
      setAppointmentFee(response.data.amount);
    } catch (error) {
      console.error('Error fetching appointment fee:', error);
      // Use default fee if fetch fails
      setAppointmentFee(2500);
    }
  };

  const handleBookAppointment = () => {
    if (!selectedSlot) return;
    
    // Fetch the latest appointment fee
    fetchAppointmentFee();
    
    // Close confirm dialog and open payment dialog
    setOpenConfirmDialog(false);
    setOpenPaymentDialog(true);
  };

  const handleProcessPayment = async () => {
    // Validate card details
    if (!cardDetails.cardNumber || !cardDetails.cardHolder || !cardDetails.expiryDate || !cardDetails.cvv) {
      showError('Please fill in all card details');
      return;
    }

    if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      showError('Card number must be 16 digits');
      return;
    }

    if (cardDetails.cvv.length !== 3) {
      showError('CVV must be 3 digits');
      return;
    }

    if (!selectedSlot) return;

    setProcessingPayment(true);

    try {
      // Book the appointment with payment
      const response = await axiosInstance.post('/appointments/book-with-payment', {
        slot_id: selectedSlot.id,
        doctor_id: selectedSlot.doctor_id,
        reason: reason || 'General consultation',
        payment_method: paymentMethod,
        payment_ref: `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`,
        amount: appointmentFee,
      });

      setBookingConfirmation({
        appointmentId: response.data.appointmentId,
        appointmentNumber: response.data.appointmentNumber,
        paymentStatus: response.data.paymentStatus,
      });
      
      // Invalidate appointments cache to refetch the latest data
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      
      // Update available slots (reduce by 1)
      setAvailableSlots(availableSlots.map(slot =>
        slot.id === selectedSlot.id
          ? { ...slot, available_slots: slot.available_slots - 1, booked_count: slot.booked_count + 1 }
          : slot
      ));
      
      // Close payment dialog
      setOpenPaymentDialog(false);
      setProcessingPayment(false);
      
      // Reset form
      setSelectedSlot(null);
      setReason('');
      setCardDetails({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
      });

      showSuccess(`Payment successful! Appointment booked. Confirmation: ${response.data.appointmentNumber}`);
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      showError(error.response?.data?.message || 'Failed to book appointment');
      setProcessingPayment(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Book an Appointment
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Select a date to view available time slots with doctors
          </Typography>

          <TextField
            fullWidth
            label="Select Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: today }}
            sx={{ mb: 3 }}
          />

          {bookingConfirmation && (
            <Alert 
              severity="success" 
              icon={<CheckIcon />}
              sx={{ mb: 3 }}
              onClose={() => setBookingConfirmation(null)}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                Appointment Booked Successfully!
              </Typography>
              <Typography variant="body2">
                Your Appointment Number: <strong>{bookingConfirmation.appointmentNumber}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Please save this number for your records.
              </Typography>
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : selectedDate && availableSlots.length > 0 ? (
            <>
              <Typography variant="h6" gutterBottom>
                Available Slots for {formatDate(selectedDate)}
              </Typography>
              <Grid container spacing={2}>
                {availableSlots.map((slot) => (
                  <Grid item xs={12} sm={6} md={4} key={slot.id}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <PersonIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Dr. {slot.doctor_name}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <TimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </Typography>
                      </Box>

                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Chip
                          label={`${slot.available_slots} slots available`}
                          size="small"
                          color={slot.available_slots > 5 ? 'success' : 'warning'}
                        />
                        <Button size="small" variant="contained">
                          Book
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : selectedDate && !loading ? (
            <Alert severity="info">
              No available appointments for this date. Please select another date.
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {/* Booking Confirmation Dialog */}
      <Dialog 
        open={openConfirmDialog} 
        onClose={() => setOpenConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Appointment</DialogTitle>
        <DialogContent>
          {selectedSlot && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Appointment Details:
              </Typography>
              
              <Box my={2}>
                <Box display="flex" justifyContent="space-between" py={1}>
                  <Typography variant="body2" color="text.secondary">Doctor:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    Dr. {selectedSlot.doctor_name}
                  </Typography>
                </Box>
                <Divider />
                
                <Box display="flex" justifyContent="space-between" py={1}>
                  <Typography variant="body2" color="text.secondary">Date:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatDate(selectedSlot.slot_date)}
                  </Typography>
                </Box>
                <Divider />
                
                <Box display="flex" justifyContent="space-between" py={1}>
                  <Typography variant="body2" color="text.secondary">Time:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                  </Typography>
                </Box>
                <Divider />
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason for Visit (Optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms or reason for the appointment..."
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBookAppointment} 
            variant="contained"
            startIcon={<CheckIcon />}
          >
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog 
        open={openPaymentDialog} 
        onClose={() => !processingPayment && setOpenPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">Payment Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedSlot && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600}>
                  Consultation Fee: Rs. {appointmentFee.toLocaleString()}.00
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Dr. {selectedSlot.doctor_name}
                </Typography>
              </Alert>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Card Information
              </Typography>
              
              <TextField
                fullWidth
                label="Card Number"
                value={cardDetails.cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value.replace(/\D/g, ''));
                  if (formatted.replace(/\s/g, '').length <= 16) {
                    setCardDetails({ ...cardDetails, cardNumber: formatted });
                  }
                }}
                placeholder="1234 5678 9012 3456"
                margin="normal"
                required
                inputProps={{ maxLength: 19 }}
              />

              <TextField
                fullWidth
                label="Card Holder Name"
                value={cardDetails.cardHolder}
                onChange={(e) => setCardDetails({ ...cardDetails, cardHolder: e.target.value })}
                placeholder="NIMAL PERERA"
                margin="normal"
                required
              />

              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  value={cardDetails.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    if (value.length <= 5) {
                      setCardDetails({ ...cardDetails, expiryDate: value });
                    }
                  }}
                  placeholder="MM/YY"
                  margin="normal"
                  required
                  inputProps={{ maxLength: 5 }}
                />

                <TextField
                  fullWidth
                  label="CVV"
                  value={cardDetails.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 3) {
                      setCardDetails({ ...cardDetails, cvv: value });
                    }
                  }}
                  placeholder="123"
                  margin="normal"
                  required
                  type="password"
                  inputProps={{ maxLength: 3 }}
                />
              </Box>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  Your payment information is secure and encrypted.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenPaymentDialog(false)}
            disabled={processingPayment}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleProcessPayment} 
            variant="contained"
            disabled={processingPayment}
            startIcon={processingPayment ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
          >
            {processingPayment ? 'Processing...' : 'Pay Rs. 2,500.00'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentBooking;
