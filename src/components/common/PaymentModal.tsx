import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  appointmentDetails: {
    doctorName: string;
    date: string;
    time: string;
    reason: string;
  };
  amount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  onPaymentSuccess,
  appointmentDetails,
  amount,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cardNumber.replace(/\s/g, '') || cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!cardName.trim()) {
      newErrors.cardName = 'Please enter cardholder name';
    }

    if (!expiryDate || expiryDate.length < 5) {
      newErrors.expiryDate = 'Please enter valid expiry date (MM/YY)';
    }

    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Please enter valid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      // After showing success, close and call success callback
      setTimeout(() => {
        onPaymentSuccess();
        handleClose();
      }, 2000);
    }, 2000);
  };

  const handleClose = () => {
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
    setErrors({});
    setIsProcessing(false);
    setPaymentSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <CreditCardIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Payment for Appointment
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {paymentSuccess ? (
          <Box textAlign="center" py={4}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={600} color="success.main" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your appointment has been confirmed.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Appointment Summary */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Appointment Details
              </Typography>
              <Typography variant="body2">
                <strong>Doctor:</strong> {appointmentDetails.doctorName}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {appointmentDetails.date}
              </Typography>
              <Typography variant="body2">
                <strong>Time:</strong> {appointmentDetails.time}
              </Typography>
              <Typography variant="body2">
                <strong>Reason:</strong> {appointmentDetails.reason}
              </Typography>
            </Alert>

            {/* Amount */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="h6" fontWeight={600} textAlign="center">
                Amount to Pay: LKR {amount.toFixed(2)}
              </Typography>
            </Box>

            {/* Payment Method */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                label="Payment Method"
              >
                <MenuItem value="credit_card">Credit Card</MenuItem>
                <MenuItem value="debit_card">Debit Card</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ mb: 3 }} />

            {/* Payment Form */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  value={cardNumber}
                  onChange={(e) => {
                    setCardNumber(formatCardNumber(e.target.value));
                    if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: '' }));
                  }}
                  error={!!errors.cardNumber}
                  helperText={errors.cardNumber}
                  placeholder="1234 5678 9012 3456"
                  inputProps={{ maxLength: 19 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  value={cardName}
                  onChange={(e) => {
                    setCardName(e.target.value);
                    if (errors.cardName) setErrors(prev => ({ ...prev, cardName: '' }));
                  }}
                  error={!!errors.cardName}
                  helperText={errors.cardName}
                  placeholder="JOHN DOE"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  value={expiryDate}
                  onChange={(e) => {
                    setExpiryDate(formatExpiryDate(e.target.value));
                    if (errors.expiryDate) setErrors(prev => ({ ...prev, expiryDate: '' }));
                  }}
                  error={!!errors.expiryDate}
                  helperText={errors.expiryDate}
                  placeholder="MM/YY"
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  value={cvv}
                  onChange={(e) => {
                    setCvv(e.target.value.replace(/[^0-9]/g, ''));
                    if (errors.cvv) setErrors(prev => ({ ...prev, cvv: '' }));
                  }}
                  error={!!errors.cvv}
                  helperText={errors.cvv}
                  placeholder="123"
                  type="password"
                  inputProps={{ maxLength: 4 }}
                />
              </Grid>
            </Grid>

            <Alert severity="warning" sx={{ mt: 3 }}>
              <Typography variant="caption">
                This is a dummy payment gateway for demonstration purposes only.
              </Typography>
            </Alert>
          </>
        )}
      </DialogContent>

      {!paymentSuccess && (
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay LKR ${amount.toFixed(2)}`}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default PaymentModal;
